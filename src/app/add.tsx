import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BakeryColors } from '@/constants/theme';
import { useLanguage } from '@/context/language-context';
import { getInitialChar, getPastelColor } from '@/utils/pastel-avatar';
import { processTranslations } from '@/utils/translator';
import { PRODUCTS_API_URL, useProducts } from '../context/product-context';

export interface EditableProduct {
  id: number | string;
  name: string;
  category: string;
  price: number;
  stock?: number;
  imageUrl?: string | null;
}

const parseCategories = (value?: string | null) => {
  if (!value) return [];

  return value
    .split(/[,/|]+/)
    .map((item) => item.trim())
    .filter(Boolean);
};

const joinCategories = (values: string[]) => values.join(', ');

interface AddProductScreenProps {
  product?: EditableProduct;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const translations = {
  en: {
    back: 'Back',
    eyebrow: 'BAKERY SHOP',
    editTitle: 'Edit Pastry',
    addTitle: 'Add New Pastry',
    nameLabel: 'Product Name *',
    namePlaceholder: 'e.g. Fresh Butter Croissant, Orange Cake',
    categoryLabel: 'Categories',
    categoryPlaceholder: 'e.g. Bakery, Pastry, Cake',
    existingCategoriesLabel: 'Or select one or more existing categories:',
    priceLabel: 'Price (THB) *',
    pricePlaceholder: 'e.g. 85',
    stockLabel: 'Stock Quantity (pcs) *',
    stockPlaceholder: 'e.g. 10',
    imageLabel: 'Image URL',
    imagePlaceholder: 'https://...',
    previewLabel: 'Preview:',
    editBtn: 'Save Changes',
    addBtn: 'Save New Product',
    alertTitle: 'Warning 🧁',
    alertMsg: 'Please fill in product name and price completely',
    urlErrorTitle: 'Error ⚠️',
    urlErrorMsg: 'API URL is incorrect (PRODUCTS_API_URL is undefined)',
    successEditTitle: 'Changes Saved ✨',
    successEditMsg: 'Pastry information updated successfully',
    successAddTitle: 'Success ✨',
    successAddMsg: 'New pastry menu added successfully',
    serverErrorTitle: 'Error 🥺',
    serverErrorMsg: (status: number, msg: string) => `Cannot save (${msg || `Response status: ${status}`})`,
    networkErrorTitle: 'Connection Problem 🔌',
    networkErrorMsg: 'Cannot connect to Server. Please check if Node.js is running.',
    ok: 'OK',
  },
  th: {
    back: 'กลับ',
    eyebrow: 'BAKERY SHOP',
    editTitle: 'แก้ไขขนม',
    addTitle: 'เพิ่มขนมใหม่',
    nameLabel: 'ชื่อสินค้า *',
    namePlaceholder: 'เช่น ครัวซองต์เนยสด, เค้กส้ม',
    categoryLabel: 'หมวดหมู่',
    categoryPlaceholder: 'เช่น Bakery, Pastries, Cakes',
    existingCategoriesLabel: 'หรือเลือกหมวดหมู่ที่มีอยู่ได้หลายหมวดหมู่:',
    priceLabel: 'ราคา (บาท) *',
    pricePlaceholder: 'เช่น 85',
    stockLabel: 'จำนวนในสต็อก (ชิ้น) *',
    stockPlaceholder: 'เช่น 10',
    imageLabel: 'URL รูปภาพ',
    imagePlaceholder: 'https://...',
    previewLabel: 'ตัวอย่างแสดงผล:',
    editBtn: 'บันทึกการแก้ไข',
    addBtn: 'บันทึกสินค้าใหม่',
    alertTitle: 'แจ้งเตือน 🧁',
    alertMsg: 'กรุณากรอกชื่อสินค้าและราคาให้ครบถ้วน',
    urlErrorTitle: 'ผิดพลาด ⚠️',
    urlErrorMsg: 'URL ของ API ไม่ถูกต้อง (PRODUCTS_API_URL เป็น undefined)',
    successEditTitle: 'บันทึกการแก้ไขแล้ว ✨',
    successEditMsg: 'อัปเดตข้อมูลขนมเรียบร้อยแล้ว',
    successAddTitle: 'สำเร็จ ✨',
    successAddMsg: 'เพิ่มเมนูสินค้าใหม่เรียบร้อยแล้ว',
    serverErrorTitle: 'ผิดพลาด 🥺',
    serverErrorMsg: (status: number, msg: string) => `ไม่สามารถบันทึกได้ (${msg || `สเตตัสตอบกลับ: ${status}`})`,
    networkErrorTitle: 'การเชื่อมต่อมีปัญหา 🔌',
    networkErrorMsg: 'ไม่สามารถติดต่อ Server ได้ กรุณาตรวจสอบว่ารัน Node.js อยู่หรือไม่',
    ok: 'ตกลง',
  },
};

export default function AddProductScreen({ product, onSuccess, onCancel }: AddProductScreenProps) {
  const router = useRouter();
  const { products, refreshProducts } = useProducts();
  const { locale } = useLanguage();
  const t = translations[locale];

  const isEditMode = !!product;

  const [name, setName] = useState(product?.name ?? '');
  const [category, setCategory] = useState(product?.category ?? '');
  const [price, setPrice] = useState(product?.price != null ? String(product.price) : '');
  const [stock, setStock] = useState(product?.stock != null ? String(product.stock) : '');
  const [imageUrl, setImageUrl] = useState(product?.imageUrl ?? '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedCategories = useMemo(() => parseCategories(category), [category]);

  // 🟢 ดึงรายการหมวดหมู่ที่มีอยู่เดิมจาก products (คัดแยกเฉพาะค่าไม่ซ้ำกัน)
  const existingCategories = useMemo(() => {
    if (!products || !Array.isArray(products)) return [];

    const categoriesSet = new Set<string>();
    products.forEach((p: any) => {
      const values = [
        locale === 'th' ? p.categoryTh || p.category : p.categoryEn || p.category,
        p.category,
      ];

      values.forEach((value) => {
        if (typeof value === 'string' && value.trim().length > 0) {
          parseCategories(value).forEach((cat) => categoriesSet.add(cat));
        }
      });
    });

    return Array.from(categoriesSet);
  }, [products, locale]);

  // คำนวณสีและตัวอักษรสำหรับพรีวิว Avatar
  const colorScheme = getPastelColor(name);
  const initialChar = getInitialChar(name);

  const goBack = () => {
    if (onSuccess) {
      onSuccess();
      return;
    }
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  const toggleCategory = (categoryValue: string) => {
    const normalizedValue = categoryValue.trim();
    if (!normalizedValue) return;

    const currentValues = selectedCategories.map((item) => item.toLowerCase());
    const alreadySelected = currentValues.includes(normalizedValue.toLowerCase());

    const nextValues = alreadySelected
      ? selectedCategories.filter((item) => item.toLowerCase() !== normalizedValue.toLowerCase())
      : [...selectedCategories, normalizedValue];

    setCategory(joinCategories(nextValues));
  };

  const handleSubmit = async () => {
    if (!name.trim() || !price.trim()) {
      Alert.alert(t.alertTitle, t.alertMsg);
      return;
    }

    const targetUrl = isEditMode ? `${PRODUCTS_API_URL}/${product!.id}` : PRODUCTS_API_URL;
    console.log('📌 กำลังยิง API ไปที่:', targetUrl);

    if (!targetUrl || targetUrl.includes('undefined')) {
      Alert.alert(t.urlErrorTitle, t.urlErrorMsg);
      return;
    }

    setIsSubmitting(true);

    try {
      // 🟢 แปลภาษาอัตโนมัติสำหรับชื่อสินค้าและหมวดหมู่
      const translatedName = await processTranslations(name);
      const categoryValues = selectedCategories.length > 0 ? selectedCategories : ['Bakery'];
      const categoryValue = joinCategories(categoryValues);
      const translatedCategory = await processTranslations(categoryValue || 'Bakery');

      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(targetUrl, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          nameTh: translatedName.th,
          nameEn: translatedName.en,
          category: categoryValue,
          categoryTh: translatedCategory.th,
          categoryEn: translatedCategory.en,
          price: Number(price),
          stock: Number(stock) || 0,
          image: imageUrl.trim() || '',
        }),
      });

      if (response.ok) {
        try {
          if (typeof refreshProducts === 'function') {
            await refreshProducts();
          }
        } catch (refreshErr) {
          console.warn('⚠️ refreshProducts พัง แต่บันทึกสำเร็จแล้ว:', refreshErr);
        }

        const title = isEditMode ? t.successEditTitle : t.successAddTitle;
        const message = isEditMode ? t.successEditMsg : t.successAddMsg;

        if (Platform.OS === 'web') {
          goBack();
        } else {
          Alert.alert(title, message, [{ text: t.ok, onPress: goBack }]);
        }
      } else {
        let errorMsg = '';
        try {
          const errorData = await response.json();
          if (errorData?.error) errorMsg = errorData.error;
        } catch {
          console.error('Server ไม่ได้ตอบกลับเป็น JSON');
        }

        Alert.alert(t.serverErrorTitle, t.serverErrorMsg(response.status, errorMsg));
      }
    } catch (error: any) {
      console.error('Add/Edit Fetch Error:', error);
      Alert.alert(t.networkErrorTitle, t.networkErrorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoBack = () => {
    if (onCancel) {
      onCancel();
      return;
    }
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={BakeryColors.background} />

      {/* Header */}
      <ThemedView style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <ThemedText style={styles.backButtonText}>← {t.back}</ThemedText>
        </TouchableOpacity>

        <View style={styles.titleWrap}>
          <ThemedText style={styles.headerEyebrow}>{t.eyebrow}</ThemedText>
          <ThemedText style={styles.headerTitle}>{isEditMode ? t.editTitle : t.addTitle}</ThemedText>
        </View>

        <View style={styles.headerRightSpacer} />
      </ThemedView>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        {/* ฟอร์มการ์ด */}
        <View style={styles.card}>
          <ThemedText style={styles.label}>{t.nameLabel}</ThemedText>
          <TextInput
            style={styles.input}
            placeholder={t.namePlaceholder}
            placeholderTextColor={BakeryColors.textSecondary}
            value={name}
            onChangeText={setName}
          />

          <ThemedText style={styles.label}>{t.categoryLabel}</ThemedText>
          <TextInput
            style={styles.input}
            placeholder={t.categoryPlaceholder}
            placeholderTextColor={BakeryColors.textSecondary}
            value={category}
            onChangeText={setCategory}
          />

          {/* 🟢 ชิปเลือกหมวดหมู่เดิมที่มีอยู่แล้ว */}
          {existingCategories.length > 0 && (
            <View style={styles.chipsSection}>
              <ThemedText style={styles.subLabel}>{t.existingCategoriesLabel}</ThemedText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScrollView}>
                {existingCategories.map((catItem) => {
                  const isSelected = selectedCategories.some(
                    (selectedCategory) => selectedCategory.toLowerCase() === catItem.toLowerCase()
                  );
                  return (
                    <TouchableOpacity
                      key={catItem}
                      style={[styles.chip, isSelected && styles.chipSelected]}
                      onPress={() => toggleCategory(catItem)}
                      activeOpacity={0.7}
                    >
                      <ThemedText style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                        {catItem}
                      </ThemedText>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}

          <ThemedText style={styles.label}>{t.priceLabel}</ThemedText>
          <TextInput
            style={styles.input}
            placeholder={t.pricePlaceholder}
            placeholderTextColor={BakeryColors.textSecondary}
            keyboardType="numeric"
            value={price}
            onChangeText={setPrice}
          />

          <ThemedText style={styles.label}>{t.stockLabel}</ThemedText>
          <TextInput
            style={styles.input}
            placeholder={t.stockPlaceholder}
            placeholderTextColor={BakeryColors.textSecondary}
            keyboardType="numeric"
            value={stock}
            onChangeText={setStock}
          />

          <ThemedText style={styles.label}>{t.imageLabel}</ThemedText>
          <TextInput
            style={styles.input}
            placeholder={t.imagePlaceholder}
            placeholderTextColor={BakeryColors.textSecondary}
            value={imageUrl}
            onChangeText={setImageUrl}
          />

          {/* กล่องพรีวิว (แสดงรูปภาพถ้ามี URL หรือแสดง Avatar สีพาสเทลเมื่อไม่มี URL) */}
          <View style={styles.previewContainer}>
            <ThemedText style={styles.previewLabel}>{t.previewLabel}</ThemedText>
            {imageUrl.trim().length > 0 ? (
              <Image 
                source={{ uri: imageUrl }} 
                style={styles.previewImage}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.avatarPreview, { backgroundColor: colorScheme.bg }]}>
                <ThemedText style={[styles.avatarPreviewText, { color: colorScheme.text }]}>
                  {initialChar}
                </ThemedText>
              </View>
            )}
          </View>

          {/* ปุ่มบันทึก */}
          <TouchableOpacity 
            style={[styles.addButton, isSubmitting && styles.buttonDisabled]} 
            onPress={handleSubmit}
            disabled={isSubmitting}
            activeOpacity={0.8}
          >
            {isSubmitting ? (
              <ActivityIndicator color={BakeryColors.surface} />
            ) : (
              <>
                <ThemedText style={styles.addButtonIcon}>{isEditMode ? '✎' : '＋'}</ThemedText>
                <ThemedText style={styles.addButtonText}>
                  {isEditMode ? t.editBtn : t.addBtn}
                </ThemedText>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BakeryColors.background,
  },
  header: {
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: BakeryColors.surface,
    borderBottomWidth: 1,
    borderBottomColor: BakeryColors.border,
  },
  backButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: BakeryColors.chip,
    borderWidth: 1,
    borderColor: BakeryColors.border,
  },
  backButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: BakeryColors.primaryDark,
  },
  titleWrap: {
    alignItems: 'center',
  },
  headerEyebrow: {
    fontSize: 11,
    color: BakeryColors.secondary,
    letterSpacing: 1,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: BakeryColors.textPrimary,
  },
  headerRightSpacer: {
    width: 60,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: BakeryColors.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: BakeryColors.border,
    elevation: 2,
    ...Platform.select({
      web: {
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)',
      },
      ios: {
        shadowColor: BakeryColors.primaryDark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
    }),
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: BakeryColors.secondary,
    marginBottom: 6,
  },
  subLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: BakeryColors.textSecondary,
    marginBottom: 6,
  },
  input: {
    backgroundColor: BakeryColors.background,
    borderWidth: 1,
    borderColor: BakeryColors.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: BakeryColors.textPrimary,
    marginBottom: 16,
  },
  chipsSection: {
    marginTop: -8,
    marginBottom: 16,
  },
  chipsScrollView: {
    flexDirection: 'row',
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: BakeryColors.background,
    borderWidth: 1,
    borderColor: BakeryColors.border,
    marginRight: 8,
  },
  chipSelected: {
    backgroundColor: BakeryColors.primary,
    borderColor: BakeryColors.primary,
  },
  chipText: {
    fontSize: 12,
    color: BakeryColors.textPrimary,
    fontWeight: '600',
  },
  chipTextSelected: {
    color: BakeryColors.surface,
    fontWeight: '700',
  },
  previewContainer: {
    marginBottom: 16,
    alignItems: 'center',
  },
  previewLabel: {
    fontSize: 12,
    color: BakeryColors.textSecondary,
    marginBottom: 6,
    alignSelf: 'flex-start',
  },
  previewImage: {
    width: '100%',
    height: 160,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BakeryColors.border,
  },
  avatarPreview: {
    width: '100%',
    height: 160,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BakeryColors.border,
  },
  avatarPreviewText: {
    fontSize: 56,
    fontWeight: '800',
  },
  addButton: {
    backgroundColor: BakeryColors.primary,
    height: 50,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    elevation: 2,
    ...Platform.select({
      web: {
        boxShadow: '0px 3px 6px rgba(0, 0, 0, 0.2)',
      },
      ios: {
        shadowColor: BakeryColors.primaryDark,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
      },
    }),
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  addButtonIcon: {
    color: BakeryColors.surface,
    fontSize: 18,
    fontWeight: '700',
  },
  addButtonText: {
    color: BakeryColors.surface,
    fontWeight: '700',
    fontSize: 15,
  },
});