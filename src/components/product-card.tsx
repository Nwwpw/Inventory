import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useLanguage } from '@/context/language-context';
import { getInitialChar, getPastelColor } from '@/utils/pastel-avatar';

export type ProductCardProps = {
  product: any;
  editText?: string;       // ข้อความปุ่ม Edit
  inStockText?: string;    // ข้อความสต็อก
  outOfStockText?: string; // ข้อความสินค้าหมด
  onEdit?: (product: any) => void;
  onDelete?: (product: any) => void;
};

export function ProductCard({
  product,
  editText,
  inStockText,
  outOfStockText,
  onEdit,
  onDelete,
}: ProductCardProps) {
  const { locale } = useLanguage();

  // 🟢 เลือกข้อความตามภาษาปัจจุบันถ้าไม่ได้ส่ง props มา
  const defaultEditText = editText ?? (locale === 'th' ? 'แก้ไข' : 'Edit');
  const defaultDeleteText = locale === 'th' ? 'ลบ' : 'Delete';
  const defaultInStockText = inStockText ?? (locale === 'th' ? 'คงเหลือ' : 'In Stock');
  const defaultOutOfStockText = outOfStockText ?? (locale === 'th' ? 'สินค้าหมด' : 'Out of Stock');

  // 🟢 ดึงชื่อสินค้าและหมวดหมู่ตามภาษาปัจจุบัน
  const displayName = locale === 'th'
    ? (product?.nameTh || product?.name || 'ไม่มีชื่อสินค้า')
    : (product?.nameEn || product?.name || 'No Name');

  const displayCategory = locale === 'th'
    ? (product?.categoryTh || product?.category || 'เบเกอรี่')
    : (product?.categoryEn || product?.category || 'BAKERY');

  // 🟢 ดึงรูปภาพรองรับหลายชื่อคีย์
  const imageUrl = product?.image || product?.imageUrl;

  // 🟢 ดึงค่าจำนวนสต็อก
  const stockCount = product?.stock ?? product?.quantity ?? 0;

  // 🎨 คำนวณสีพาสเทลและตัวอักษรแรกสำหรับ Avatar
  const colorScheme = getPastelColor(displayName);
  const initialChar = getInitialChar(displayName);

  // 🟢 จัดการการแสดงผลราคา
  const renderPrice = () => {
    if (product?.price === undefined || product?.price === null) return '0 ฿';
    if (typeof product.price === 'string' && product.price.includes('฿')) {
      return product.price;
    }
    return `${Number(product.price).toLocaleString()} ฿`;
  };

  return (
    <View style={styles.card}>
      {/* 🖼️ รูปภาพสินค้า หรือ Avatar พาสเทล */}
      {imageUrl && imageUrl.trim().length > 0 ? (
        <Image 
          source={{ uri: imageUrl }} 
          style={styles.image} 
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.image, styles.avatarPlaceholder, { backgroundColor: colorScheme.bg }]}>
          <Text style={[styles.avatarText, { color: colorScheme.text }]}>
            {initialChar}
          </Text>
        </View>
      )}

      {/* 📝 รายละเอียดสินค้า */}
      <View style={styles.info}>
        <Text style={styles.category}>
          {displayCategory.toUpperCase()}
        </Text>
        <Text style={styles.name} numberOfLines={1}>
          {displayName}
        </Text>

        <View style={styles.priceAndStockRow}>
          <Text style={styles.price}>{renderPrice()}</Text>

          {/* 🟢 Badge แสดงสต็อก */}
          <View style={[styles.stockBadge, stockCount === 0 && styles.outOfStockBadge]}>
            <Text style={[styles.stockText, stockCount === 0 && styles.outOfStockText]}>
              {stockCount > 0 ? `${defaultInStockText}: ${stockCount}` : defaultOutOfStockText}
            </Text>
          </View>
        </View>
      </View>

      {/* ✏️ ปุ่มแก้ไข */}
<View>
  {onEdit && (
    <TouchableOpacity
      style={styles.editBtn}
      onPress={() => onEdit(product)}
      activeOpacity={0.7}
    >
      <Text style={styles.editBtnText}>
        ✏️ {defaultEditText}
      </Text>
    </TouchableOpacity>
  )}

  {onDelete && (
    <TouchableOpacity
      style={styles.deleteBtn}
      onPress={() => onDelete(product)}
      activeOpacity={0.7}
    >
      <Text style={styles.deleteBtnText}>
        <Text style={{ color: '#dc2f4c' }}>🗑</Text> {defaultDeleteText}
      </Text>
    </TouchableOpacity>
  )}
</View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F3E8E8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  image: {
    width: 64,
    height: 64,
    borderRadius: 14,
    marginRight: 12,
  },
  avatarPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  avatarText: {
    fontSize: 26,
    fontWeight: '800',
  },
  info: {
    flex: 1,
  },
  category: {
    fontSize: 10,
    fontWeight: '700',
    color: '#C88A72',
    marginBottom: 2,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: '#4A3E3D',
    marginBottom: 4,
  },
  priceAndStockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  price: {
    fontSize: 14,
    fontWeight: '700',
    color: '#E08092',
  },
  stockBadge: {
    backgroundColor: '#E6F4EA',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CEEAD6',
  },
  stockText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#137333',
  },
  outOfStockBadge: {
    backgroundColor: '#FCE8E6',
    borderColor: '#FAD2CF',
  },
  outOfStockText: {
    color: '#C5221F',
  },
  editBtn: {
    backgroundColor: '#FFF0F3',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FFD6E0',
  },
  editBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#E08092',
  },
  deleteBtn: {
    backgroundColor: '#FFF0F3',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FFD6E0',
    marginTop: 8,
  },
  deleteBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#E08092',
  },
});