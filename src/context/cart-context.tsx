import { createContext, PropsWithChildren, useContext, useMemo, useState } from 'react';

import { Product } from '@/constants/bakery';
import { useProducts } from './product-context';

type CartLine = {
  product: Product;
  quantity: number;
};

type CartContextValue = {
  items: CartLine[];
  cartCount: number;
  addItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

// 🧁 ตะกร้าสินค้าเริ่มต้น (เป็น ID ขนมจากรายการของคุณ)
const initialQuantities: Record<string, number> = {
  '1': 1, // Butter Croissant
  '2': 1, // Strawberry Shortcake
};

export function CartProvider({ children }: PropsWithChildren) {
  const { products } = useProducts();
  const [quantities, setQuantities] = useState<Record<string, number>>(initialQuantities);

  const value = useMemo<CartContextValue>(() => {
    const items = products
      .filter((product) => (quantities[product.id] ?? 0) > 0)
      .map((product) => ({ product, quantity: quantities[product.id] }));

    return {
      items,
      cartCount: items.reduce((total, item) => total + item.quantity, 0),
      addItem: (productId: string) => {
        setQuantities((current) => ({
          ...current,
          [productId]: (current[productId] ?? 0) + 1,
        }));
      },
      updateQuantity: (productId: string, quantity: number) => {
        setQuantities((current) => ({
          ...current,
          [productId]: Math.max(0, quantity),
        }));
      },
      clearCart: () => setQuantities({}),
    };
  }, [products, quantities]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const value = useContext(CartContext);

  if (!value) {
    throw new Error('useCart must be used inside CartProvider');
  }

  return value;
}