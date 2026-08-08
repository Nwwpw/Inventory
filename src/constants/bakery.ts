// 🧁 Palette สีสไตล์ร้านเบเกอรี่อบอุ่น
export const BakeryShopColors = {
  background: '#FFF8F3', // ครีมนม
  paper: '#FFFFFF',      // ขาวสะอาด
  border: '#F6E1D3',     // ขอบพีชอ่อน
  chip: '#FDEDF1',       // ชมพูฟรอสติ้งอ่อน
  primary: '#F2A6B8',    // ชมพูสตรอว์เบอร์รี
  primaryDark: '#E27F98',// ชมพูเข้ม
  secondary: '#C98B5E',  // น้ำตาลคาราเมล
  textPrimary: '#5B4636',// น้ำตาลโกโก้เข้ม
  textSecondary: '#B29A8B',// น้ำตาลนวล
  accentGreen: '#A3D9A5', // เขียวมัทฉะ
  accentYellow: '#FFE082',// เหลืองเนยสด
} as const;

export type Product = {
  id: string;
  name: string;
  category: string;
  description?: string;
  price: number;
  originalPrice?: number;
  stock: number;
  badge?: string;
  badgeColor?: string;
  image: string;
  imageColor?: string;
  accentColor?: string;
};

// 🧁 ข้อมูลสำรอง (Fallback) ขนมเบเกอรี่ของคุณ
export const fallbackProducts: Product[] = [
  {
    id: '1',
    name: 'Butter Croissant',
    category: 'Croissants',
    description: 'ครัวซองต์เนยสดฝรั่งเศส หอมกรอบนอกนุ่มใน',
    price: 85,
    originalPrice: 95,
    stock: 20,
    badge: 'BESTSELLER',
    badgeColor: BakeryShopColors.secondary,
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500',
    imageColor: '#FFE082',
    accentColor: BakeryShopColors.primary,
  },
  {
    id: '2',
    name: 'Strawberry Shortcake',
    category: 'Cakes',
    description: 'เค้กสตรอว์เบอร์รีสด นุ่มละมุนลิ้น',
    price: 145,
    stock: 15,
    badge: 'FRESH',
    badgeColor: BakeryShopColors.primary,
    image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=500',
    imageColor: '#FDEDF1',
    accentColor: BakeryShopColors.primaryDark,
  },
  {
    id: '3',
    name: 'Blueberry Cheese Pie',
    category: 'Pies & Tarts',
    description: 'ชีสพายบลูเบอร์รีเข้มข้น รสชาติเปรี้ยวหวานลงตัว',
    price: 135,
    stock: 10,
    badge: 'POPULAR',
    badgeColor: BakeryShopColors.accentGreen,
    image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=500',
    imageColor: '#E2D5F8',
    accentColor: BakeryShopColors.secondary,
  },
  {
    id: '4',
    name: 'Chocolate Fudge Cake',
    category: 'Cakes',
    description: 'ช็อกโกแลตฟัดจ์เค้ก เข้มข้นถึงใจ',
    price: 120,
    originalPrice: 140,
    stock: 12,
    badge: 'SALE',
    badgeColor: BakeryShopColors.primaryDark,
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500',
    imageColor: '#D7CCC8',
    accentColor: BakeryShopColors.secondary,
  },
  {
    id: '5',
    name: 'Matcha Danish',
    category: 'Pastries',
    description: 'เดนิชมัทฉะแท้จากชาเขียวเกรดพรีเมียม',
    price: 95,
    stock: 18,
    badge: 'NEW',
    badgeColor: BakeryShopColors.accentGreen,
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500',
    imageColor: '#C8E6C9',
    accentColor: BakeryShopColors.accentGreen,
  },
];

export const formatPrice = (value: number) => `฿${value.toLocaleString('en-US')}`;