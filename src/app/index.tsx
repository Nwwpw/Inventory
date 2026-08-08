import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  StatusBar,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProductCard } from '@/components/product-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BakeryColors } from '@/constants/theme';
import { useLanguage } from '@/context/language-context'; // 🟢 1. Import useLanguage
import { useProducts } from '@/context/product-context';

const translations = {
  en: {
    eyebrow: 'BAKERY SHOP',
    title: 'Bakery Stock',
    searchPlaceholder: 'Search pastries, categories...',
    filter: 'Filter🔻',
    quickAddBtn: '➕ Add Product',
    sectionLabel: (count: number) => `All Products (${count})`,
    editBtn: 'Edit',
    inStock: 'In Stock',
    outOfStock: 'Out of Stock',
    home: 'Home',
    add: 'Add',
    menu: 'Menu',
    settings: 'Settings',
  },
  th: {
    eyebrow: 'ร้านเบเกอรี่',
    title: 'สต็อกเบเกอรี่',
    searchPlaceholder: 'ค้นหาขนมและหมวดหมู่...',
    filter: 'ตัวกรอง🔻',
    quickAddBtn: '➕ เพิ่มขนม',
    sectionLabel: (count: number) => `สินค้าทั้งหมด (${count})`,
    editBtn: 'แก้ไข',
    inStock: 'คงเหลือ',
    outOfStock: 'สินค้าหมด',
    home: 'หน้าแรก',
    add: 'เพิ่ม',
    menu: 'เมนู',
    settings: 'ตั้งค่า',
  },
};

export default function HomeScreen() {
  const router = useRouter();
  const { products, isLoading, refreshProducts } = useProducts();
  
  // 🟢 2. ดึง locale และ toggleLanguage มาจาก Global Context
  const { locale, toggleLanguage } = useLanguage();
  
  const [searchQuery, setSearchQuery] = useState('');
  
  // 🟢 เช็กว่า Client โหลดเสร็จหรือยัง เพื่อป้องกัน SSR 500 Error
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const t = locale === 'en' ? translations.en : translations.th;

  // 🟢 เรียก refreshProducts
  useFocusEffect(
    useCallback(() => {
      if (isMounted && typeof refreshProducts === 'function') {
        refreshProducts();
      }
    }, [isMounted])
  );

  // 🟢 การแปลงข้อมูลสำหรับแสดงผล
  const visibleProducts = useMemo(() => {
    if (!Array.isArray(products)) return [];

    return products
      .filter((item: any) => {
        if (!item) return false;
        const name = (item.nameEn || item.nameTh || item.name || '').toLowerCase();
        const category = (item.categoryEn || item.categoryTh || item.category || '').toLowerCase();
        const query = searchQuery.toLowerCase().trim();
        return name.includes(query) || category.includes(query);
      })
      .map((item: any) => {
        const rawPrice = item.price ?? item.price_baht ?? item.price_per_unit ?? 0;
        const rawStock = item.stock ?? item.quantity ?? item.amount ?? item.stock_quantity ?? 0;
        const imageUrl = item.image || item.imageUrl || item.image_url || null;

        return {
          ...item,
          id: String(item.id ?? Math.random()),
          name: locale === 'en'
            ? (item.nameEn || item.name || item.nameTh)
            : (item.nameTh || item.name || item.nameEn),
          category: locale === 'en'
            ? (item.categoryEn || item.category || item.categoryTh)
            : (item.categoryTh || item.category || item.categoryEn),
          price: `${rawPrice} ฿`,
          stock: Number(rawStock) || 0,
          quantity: Number(rawStock) || 0,
          image: imageUrl, 
          imageUrl: imageUrl,
        };
      });
  }, [products, locale, searchQuery]);

  // ป้องกัน Render พังช่วง SSR
  if (!isMounted) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={BakeryColors.background} />

      {/* Header */}
      <ThemedView style={styles.header}>
        <TouchableOpacity style={styles.categoryButton}>
          <ThemedText style={styles.categoryIcon}>☰</ThemedText>
        </TouchableOpacity>
        <View style={styles.titleWrap}>
          <ThemedText style={styles.headerEyebrow}>{t.eyebrow}</ThemedText>
          <ThemedText style={styles.headerTitle}>{t.title}</ThemedText>
        </View>
        <View style={styles.headerActions}>
          {/* 🟢 3. ปรับปุ่มให้สลับภาษาระดับ Global Context */}
          <TouchableOpacity
            style={styles.langButton}
            onPress={toggleLanguage}
          >
            <ThemedText style={styles.langButtonText}>{locale === 'en' ? 'ไทย' : 'EN'}</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.profileButton}>
            <ThemedText style={styles.profileIcon}>👤</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <ThemedText style={styles.searchIcon}>🔍</ThemedText>
          <TextInput
            style={styles.searchInput}
            placeholder={t.searchPlaceholder}
            placeholderTextColor={BakeryColors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            editable={true}
          />
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <ThemedText style={styles.filterIcon}>{t.filter}</ThemedText>
        </TouchableOpacity>
      </View>

      {/* รายการเบเกอรี่ */}
      <FlatList
        style={styles.list}
        contentContainerStyle={styles.shelfArea}
        data={visibleProducts}
        keyExtractor={(item) => item.id}
        refreshing={isLoading}
        onRefresh={refreshProducts}
        ListHeaderComponent={
          <View style={styles.listHeaderRow}>
            <ThemedText style={styles.sectionLabel}>{t.sectionLabel(visibleProducts.length)}</ThemedText>
            <TouchableOpacity style={styles.quickAddBtn} onPress={() => router.push('/add')}>
              <ThemedText style={styles.quickAddBtnText}>{t.quickAddBtn}</ThemedText>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => (
          <ProductCard 
            product={item} 
            editText={t.editBtn}
            inStockText={t.inStock}
            outOfStockText={t.outOfStock}
            onEdit={(prod) => router.push({ pathname: '/edit', params: { id: prod.id } })} 
          />
        )}
      />

      {/* Bottom Nav */}
      <ThemedView style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <ThemedText style={styles.navIcon}>🏠</ThemedText>
          <ThemedText style={styles.navText}>{t.home}</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/add')}>
          <ThemedText style={styles.navIcon}>➕</ThemedText>
          <ThemedText style={styles.navText}>{t.add}</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItemActive}>
          <View style={styles.navActivePill}>
            <ThemedText style={styles.navIconActive}>🧁</ThemedText>
          </View>
          <ThemedText style={styles.navTextActive}>{t.menu}</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <ThemedText style={styles.navIcon}>⚙️</ThemedText>
          <ThemedText style={styles.navText}>{t.settings}</ThemedText>
        </TouchableOpacity>
      </ThemedView>
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
  categoryButton: {
    width: 34,
    height: 34,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryIcon: {
    fontSize: 18,
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
    fontSize: 20,
    fontWeight: '700',
    color: BakeryColors.textPrimary,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  langButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: BakeryColors.chip,
    borderWidth: 1,
    borderColor: BakeryColors.border,
  },
  langButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: BakeryColors.primaryDark,
  },
  profileButton: {
    width: 34,
    height: 34,
    backgroundColor: BakeryColors.primary,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileIcon: {
    fontSize: 16,
    color: BakeryColors.surface,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
    gap: 12,
    alignItems: 'center',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: BakeryColors.surface,
    borderWidth: 1,
    borderColor: BakeryColors.border,
    borderRadius: 20,
    paddingHorizontal: 14,
    alignItems: 'center',
    height: 52,
  },
  searchIcon: {
    fontSize: 15,
    marginRight: 8,
    opacity: 0.7,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    color: BakeryColors.textPrimary,
    paddingVertical: 0,
  },
  filterButton: {
    minWidth: 58,
    height: 52,
    paddingHorizontal: 14,
    backgroundColor: BakeryColors.surface,
    borderWidth: 1,
    borderColor: BakeryColors.border,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterIcon: {
    color: BakeryColors.primaryDark,
    fontSize: 18,
    fontWeight: '700',
  },
  list: {
    flex: 1,
  },
  shelfArea: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: BakeryColors.secondary,
  },
  quickAddBtn: {
    backgroundColor: '#FFEBF0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  quickAddBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: BakeryColors.primaryDark,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: BakeryColors.surface,
    borderTopWidth: 1,
    borderTopColor: BakeryColors.border,
    paddingVertical: 10,
    paddingBottom: 14,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navItemActive: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navActivePill: {
    backgroundColor: BakeryColors.chip,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 4,
    marginBottom: 4,
  },
  navIcon: {
    fontSize: 20,
    marginBottom: 4,
    opacity: 0.55,
  },
  navIconActive: {
    fontSize: 18,
  },
  navText: {
    fontSize: 11,
    color: BakeryColors.textSecondary,
  },
  navTextActive: {
    fontSize: 11,
    color: BakeryColors.primaryDark,
    fontWeight: '700',
  },
});