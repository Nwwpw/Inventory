// utils/pastel-avatar.ts

// 🎨 รายการชุดสีพาสเทลสำหรับขนมเบเกอรี่
export const PASTEL_COLORS = [
  { bg: '#FFE5EC', text: '#D81B60' }, // ชมพูสตรอว์เบอร์รี 🍓
  { bg: '#FFF3E0', text: '#E65100' }, // ส้มชาไทย/คัสตาร์ด 🍊
  { bg: '#FFFDE7', text: '#F57F17' }, // เหลืองเนยสด/เลมอน 🧈
  { bg: '#E8F5E9', text: '#2E7D32' }, // เขียวมัทฉะ 🍵
  { bg: '#EFEBE9', text: '#4E342E' }, // น้ำตาลช็อกโกแลต/กาแฟ 🍫
  { bg: '#EDE7F6', text: '#512DA8' }, // ม่วงบลูเบอร์รี 🫐
  { bg: '#E0F7FA', text: '#00838F' }, // ฟ้าพาสเทล 🩵
];

/**
 * คำนวณ Index จากชื่อสินค้า เพื่อให้ชื่อเดิมได้สีเดิมเสมอ
 */
export const getPastelColor = (name: string = '') => {
  let charCodeSum = 0;
  for (let i = 0; i < name.length; i++) {
    charCodeSum += name.charCodeAt(i);
  }
  const colorIndex = charCodeSum % PASTEL_COLORS.length;
  return PASTEL_COLORS[colorIndex];
};

/**
 * ดึงอักษรตัวแรกของชื่อสินค้า (รองรับทั้งไทยและอังกฤษ)
 */
export const getInitialChar = (name: string = '') => {
  const trimmed = name.trim();
  if (!trimmed) return '🧁'; // Fallback ตัวแรกถ้าไม่มีชื่อ
  return trimmed.charAt(0).toUpperCase();
};