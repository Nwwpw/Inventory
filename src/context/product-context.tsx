import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';

const REMOTE_API_URL = 'http://119.59.102.161:3041/api/products';

export function getProductsApiUrl() {
  if (typeof window !== 'undefined' && window.location?.hostname) {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return REMOTE_API_URL;
    }
    return `http://119.59.102.161:3041/api/products`;
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3041/api/products';
  }

  return REMOTE_API_URL;
}

export const PRODUCTS_API_URL = getProductsApiUrl();

export interface Product {
  id: string;
  name: string;
  nameEn?: string;
  nameTh?: string;
  category: string;
  categoryEn?: string;
  categoryTh?: string;
  price: number;
  stock: number;
  image: string;
  imageUrl?: string;
}

interface ProductContextType {
  products: Product[];
  loading: boolean;
  isLoading: boolean;
  error: string | null;
  refreshProducts: () => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 🟢 Helper Function ดึง Token (ตัดช่องว่าง trim และรองรับ fallback เผื่อชื่อ key อื่น)
  const getToken = async (): Promise<string | null> => {
    try {
      let rawToken: string | null = null;

      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined') {
          // ดึงจาก 'token' หากไม่มีจะลองดึงจาก key สำรอง
          rawToken = localStorage.getItem('token') || localStorage.getItem('userToken');
        }
      } else {
        rawToken = (await AsyncStorage.getItem('token')) || (await AsyncStorage.getItem('userToken'));
      }

      // หากได้ค่าที่ไม่ถูกต้อง หรือเป็น string คำว่า "null"/"undefined" ให้ส่งกลับ null
      if (!rawToken || rawToken === 'null' || rawToken === 'undefined') {
        return null;
      }

      return rawToken.trim();
    } catch (e) {
      console.error('Error getting token:', e);
      return null;
    }
  };

  // 🟢 ฟังก์ชันดึงข้อมูลสินค้าทั้งหมด
  const fetchProducts = useCallback(async () => {
    const currentApiUrl = getProductsApiUrl();

    try {
      setLoading(true);
      setError(null);

      // ดึง Token ล่าสุด
      const token = await getToken();

      // ⚠️ หากไม่มี Token ให้ข้ามการยิง Request เพื่อไม่ให้ติด 403 / 401 ใน Console
      if (!token) {
        console.warn('Fetch Products skipped: No valid token found in storage.');
        setError('Unauthorized: Token missing');
        setProducts([]);
        setLoading(false);
        return;
      }

      // กำหนด Header และแนบ Bearer Token
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // แนบ Token อย่างชัดเจน
      };

      const response = await fetch(currentApiUrl, { method: 'GET', headers });

      if (!response.ok) {
        throw new Error(`HTTP Error Status: ${response.status}`);
      }
      const data = await response.json();

      const formattedData = Array.isArray(data)
        ? data.map((item: any) => {
            const rawPrice = item.price ?? item.price_per_unit ?? item.product_price ?? item.priceEn ?? 0;
            const rawStock = item.stock ?? item.quantity ?? item.amount ?? item.stock_quantity ?? item.quantity_in_stock ?? item.qty ?? 0;
            const rawImage = item.image || item.imageUrl || item.image_url || '';

            return {
              ...item,
              id: String(item.id ?? Math.random()),
              name: item.name || item.product_name || item.nameTh || item.nameEn || '',
              nameEn: item.nameEn || item.name || item.nameTh || '',
              nameTh: item.nameTh || item.name || item.nameEn || '',
              category: item.category || item.categoryTh || item.categoryEn || 'Bakery',
              categoryEn: item.categoryEn || item.category || item.categoryTh || 'Bakery',
              categoryTh: item.categoryTh || item.category || item.categoryEn || 'เบเกอรี่',
              price: typeof rawPrice === 'string' ? parseFloat(rawPrice) || 0 : Number(rawPrice) || 0,
              stock: typeof rawStock === 'string' ? parseInt(rawStock, 10) || 0 : Number(rawStock) || 0,
              image: rawImage,
              imageUrl: rawImage,
            };
          })
        : [];

      setProducts(formattedData);
    } catch (err: any) {
      console.error('Fetch Products Error:', err);
      setError(err.message || 'Failed to fetch products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // 🟢 ฟังก์ชันสั่งลบสินค้า
  const deleteProduct = useCallback(async (id: string) => {
    const currentApiUrl = getProductsApiUrl();

    try {
      setLoading(true);

      // 1. ดึง Token ล่าสุดมาใช้งาน
      const token = await getToken();

      if (!token) {
        throw new Error('Unauthorized: Please login first');
      }

      // 2. ตั้งค่า Header และแนบ Bearer Token
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      };

      // 3. ยิง Request Method DELETE
      const response = await fetch(`${currentApiUrl}/${id}`, {
        method: 'DELETE',
        headers: headers,
      });

      if (!response.ok) {
        throw new Error(`Delete Failed: Status ${response.status}`);
      }

      // 4. ลบสำเร็จแล้วทำการดึงข้อมูลใหม่
      await fetchProducts();
    } catch (err: any) {
      console.error('Delete Product Error:', err);
      setError(err.message || 'Failed to delete product');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchProducts]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <ProductContext.Provider
      value={{
        products,
        loading,
        isLoading: loading,
        error,
        refreshProducts: fetchProducts,
        deleteProduct,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
}