import { ThemedText } from '@/components/themed-text';
import { BakeryColors } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const API_BASE_URL = 'http://119.59.102.161:3041/api';

export default function LoginScreen() {
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const handleLogin = async () => {

    if (!username.trim() || !password.trim()) {
      showAlert('แจ้งเตือน', 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        showAlert(
          'เข้าสู่ระบบไม่สำเร็จ',
          data.error || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง'
        );
        return;
      }

      if (typeof window !== 'undefined') {

        console.log('FULL DATA =', data);

        localStorage.setItem('token', data.token || '');

        localStorage.setItem(
          'role',
          String(data.role || '')
        );

        localStorage.setItem(
          'userId',
          String(data.userId || '')
        );

        localStorage.setItem(
          'username',
          String(
            data.username || data.user_name || '')
        );

        localStorage.setItem('email', data.email || '');

        console.log(
          'ROLE SAVED =',
          localStorage.getItem('role')
        );

        console.log(
          'USERID SAVED =',
          localStorage.getItem('userId')
        );
      }

      console.log('LOGIN SUCCESS');
      console.log('ROLE =', data.role);
      console.log('USER ID =', data.userId);

      router.replace('/');
    } catch (error) {
      console.error(error);
      showAlert(
        'ข้อผิดพลาด',
        'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <ThemedText style={styles.title}>
          🧁 Bakery Shop
        </ThemedText>

        <ThemedText style={styles.subtitle}>
          เข้าสู่ระบบเพื่อจัดการสต็อกสินค้า
        </ThemedText>

        <View style={styles.form}>
          <ThemedText style={styles.label}>
            ชื่อผู้ใช้ (Username)
          </ThemedText>

          <TextInput
            style={styles.input}
            placeholder="กรอกชื่อผู้ใช้"
            placeholderTextColor="#A09080"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />

          <ThemedText style={styles.label}>
            รหัสผ่าน (Password)
          </ThemedText>

          <TextInput
            style={styles.input}
            placeholder="กรอกรหัสผ่าน"
            placeholderTextColor="#A09080"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity
            style={[
              styles.button,
              loading && styles.buttonDisabled,
            ]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <ThemedText style={styles.buttonText}>
                เข้าสู่ระบบ
              </ThemedText>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/register')}
            style={{ marginTop: 16 }}
          >
            <ThemedText
              style={{
                textAlign: 'center',
                color: BakeryColors.primaryDark,
                fontWeight: '700',
              }}
            >
              ยังไม่มีบัญชี? สมัครสมาชิก
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F1EB',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },

  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFDFB',
    borderRadius: 28,
    padding: 32,
    borderWidth: 1,
    borderColor: '#F2DDD1',

    shadowColor: '#6B4A34',
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 4,
  },

  title: {
    fontSize: 30,
    fontWeight: '800',
    textAlign: 'center',
    color: '#6B4A34',
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    color: '#9C7D67',
    marginBottom: 28,
    lineHeight: 20,
  },

  form: {
    width: '100%',
  },

  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8C6A52',
    marginBottom: 8,
    marginTop: 12,
  },

  input: {
    backgroundColor: '#FFF8F4',
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 52,
    borderWidth: 1,
    borderColor: '#EAD6C8',
    color: '#4A3628',
    fontSize: 14,
  },

  button: {
    backgroundColor: '#F4A8B8',
    height: 54,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 28,

    shadowColor: '#F4A8B8',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  buttonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});