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
    return `http://${hostname}:3041/api/products`;
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

// 🟢 เพิ่ม deleteProduct เข้าไปใน Context Type
interface ProductContextType {
  products: Product[];
  loading: boolean;
  isLoading: boolean;
  error: string | null;
  refreshProducts: () => Promise<void>;
  deleteProduct: (id: string) => Promise<void>; // <-- ฟังก์ชันลบสินค้า
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 🟢 Helper Function สำหรับดึง Token แบบรองรับทั้ง Web และ Mobile
  const getToken = async (): Promise<string | null> => {
    if (Platform.OS === 'web') {
      return typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    }
    return await AsyncStorage.getItem('token');
  };

  // 🟢 ฟังก์ชันดึงข้อมูลสินค้าทั้งหมด
  const fetchProducts = useCallback(async () => {
    const currentApiUrl = getProductsApiUrl();

    try {
      setLoading(true);
      setError(null);

      // ดึง Token
      const token = await getToken();

      // กำหนด Header
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (token && token !== 'null' && token !== 'undefined') {
        headers['Authorization'] = `Bearer ${token}`;
      }

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

  // 🟢 ฟังก์ชันสั่งลบสินค้า (เพิ่มใหม่เพื่อแก้ปัญหา 401 Unauthorized)
  const deleteProduct = useCallback(async (id: string) => {
    const currentApiUrl = getProductsApiUrl();

    try {
      setLoading(true);

      // 1. ดึง Token ล่าสุดมาใช้งาน
      const token = await getToken();

      // 2. ตั้งค่า Header และแนบ Bearer Token (สำคัญมาก ป้องกัน 401)
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (token && token !== 'null' && token !== 'undefined') {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // 3. ยิง Request Method DELETE ไปยัง API ปลายทางตาม ID สินค้า
      const response = await fetch(`${currentApiUrl}/${id}`, {
        method: 'DELETE',
        headers: headers,
      });

      // หาก Response ตอบกลับมาไม่โอเค (เช่น 401 หรือ 403) ให้สั่ง Throw Error
      if (!response.ok) {
        throw new Error(`Delete Failed: Status ${response.status}`);
      }

      // 4. ลบสำเร็จแล้ว ให้ทำการโหลดรายการสินค้าใหม่ทันที
      await fetchProducts();
    } catch (err: any) {
      console.error('Delete Product Error:', err);
      setError(err.message || 'Failed to delete product');
      throw err; // โยน Error ออกไปให้ UI ฝั่งปุ่มกดดักแสดง Alert ต่อได้
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
        deleteProduct, // <-- ส่งฟังก์ชันลบออกไปให้หน้ารายการสินค้าใช้
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