import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { BakeryColors } from '@/constants/theme';
import { useLanguage } from '@/context/language-context';
import { useProducts } from '@/context/product-context';
import AddProductScreen, { EditableProduct } from './add';

export const dynamic = 'force-dynamic';

const translations = {
  en: {
    loading: 'Loading pastry details...',
    fetchingRoute: 'Fetching route details...',
    notFound: (id: string) => `Pastry data not found for editing (ID: ${id})`,
    backToHome: '← Back to Home',
  },
  th: {
    loading: 'กำลังโหลดข้อมูลขนม...',
    fetchingRoute: 'กำลังดึงข้อมูลเส้นทาง...',
    notFound: (id: string) => `ไม่พบข้อมูลขนมที่ต้องการแก้ไข (ID: ${id})`,
    backToHome: '← กลับหน้าหลัก',
  },
};

export default function EditProductScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const { products, refreshProducts, isLoading } = useProducts();
  const { locale } = useLanguage();
  const t = translations[locale];

  const [isMounted, setIsMounted] = useState(false);

  // ป้องกัน Server-Side Rendering Crash บน Web
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const rawId = params?.id ? (Array.isArray(params.id) ? params.id[0] : params.id) : null;

  const targetProduct = products && rawId ? products.find((p) => String(p.id) === String(rawId)) : undefined;

  // 🟢 เลือกชื่อและหมวดหมู่ตามภาษาปัจจุบัน หรือ fallback กลับไปใช้ฟิลด์พื้นฐาน
  const initialName = targetProduct
    ? locale === 'th'
      ? targetProduct.nameTh || targetProduct.name
      : targetProduct.nameEn || targetProduct.name
    : '';

  const initialCategory = targetProduct
    ? locale === 'th'
      ? targetProduct.categoryTh || targetProduct.category
      : targetProduct.categoryEn || targetProduct.category
    : '';

  const initialProductData: EditableProduct | undefined = targetProduct
    ? {
        id: targetProduct.id,
        name: initialName,
        category: initialCategory,
        price: Number(targetProduct.price ?? (targetProduct as any).price ?? 0),
        stock: Number(targetProduct.stock ?? 0),
        imageUrl: targetProduct.image || (targetProduct as any).imageUrl || '',
      }
    : undefined;

  const safeGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  const handleSuccess = async () => {
    try {
      await refreshProducts();
    } catch (e) {
      console.warn('Refresh error:', e);
    }
    safeGoBack();
  };

  const handleCancel = () => {
    safeGoBack();
  };

  // ถ้ายังโหลดอยู่ หรือยัง Render บน Client ไม่เสร็จ
  if (!isMounted || isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ThemedText style={styles.loadingText}>{t.loading}</ThemedText>
      </View>
    );
  }

  // ไม่พบข้อมูลสินค้า
  if (!initialProductData) {
    return (
      <View style={styles.loadingContainer}>
        <ThemedText style={styles.loadingText}>
          {!rawId ? t.fetchingRoute : t.notFound(rawId)}
        </ThemedText>
        <TouchableOpacity style={styles.backButton} onPress={safeGoBack}>
          <ThemedText style={styles.backButtonText}>{t.backToHome}</ThemedText>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <AddProductScreen
      product={initialProductData}
      onSuccess={handleSuccess}
      onCancel={handleCancel}
    />
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: BakeryColors.background,
    padding: 20,
  },
  loadingText: {
    fontSize: 14,
    color: BakeryColors.textSecondary,
    marginBottom: 16,
    textAlign: 'center',
  },
  backButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: BakeryColors.chip,
    borderWidth: 1,
    borderColor: BakeryColors.border,
  },
  backButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: BakeryColors.primaryDark,
  },
});