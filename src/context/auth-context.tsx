import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

export const API_BASE_URL = 'http://119.59.102.161:3041/api';

export type UserRole = 'admin' | 'user' | 'staff';

interface AuthUser {
  username: string;
  role: UserRole;
  token: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAdmin: boolean;
  login: (
    username: string,
    password: string
  ) => Promise<{ ok: boolean; message?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      const username = localStorage.getItem('username');
      const role =
        (localStorage.getItem('role') as UserRole) || 'user';

      if (token && username) {
        setUser({
          token,
          username,
          role,
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (
    username: string,
    password: string
  ) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return {
          ok: false,
          message:
            data.error || 'เข้าสู่ระบบไม่สำเร็จ',
        };
      }

      const authUser: AuthUser = {
        username: data.username,
        role: data.role || 'user',
        token: data.token,
      };

      localStorage.setItem('token', data.token);
      localStorage.setItem('username', data.username);
      localStorage.setItem(
        'role',
        data.role || 'user'
      );

      setUser(authUser);

      return {
        ok: true,
      };
    } catch (error) {
      console.error(error);

      return {
        ok: false,
        message: 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้',
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');

    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAdmin: user?.role === 'admin',
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used within AuthProvider'
    );
  }

  return context;
}