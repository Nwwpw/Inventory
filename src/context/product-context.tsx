import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';

const REMOTE_API_URL = 'http://119.59.102.161:3041/api/products';
const LOCAL_API_URL = 'http://localhost:3041/api/products';

export function getProductsApiUrl() {
  if (typeof window !== 'undefined' && window.location?.hostname) {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      // Local web app should use the remote course backend when the SSH tunnel is not available.
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

interface ProductContextType {
  products: Product[];
  loading: boolean;
  isLoading: boolean;
  error: string | null;
  refreshProducts: () => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 🟢 ดึงข้อมูลสินค้า และ Map Data ให้อยู่ใน Format ที่พร้อมใช้
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const currentApiUrl = getProductsApiUrl();
      const response = await fetch(currentApiUrl);

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

  // 🟢 ปรับเปลี่ยนการเช็ก Mount ให้รองรับทั้ง Web, iOS และ Android
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