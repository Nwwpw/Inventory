import { useState } from 'react';
import { FlatList, StatusBar, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProductCard, type Product } from '@/components/product-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BakeryColors } from '@/constants/theme';

const PRODUCTS: Array<Product & { nameEn: string; nameTh: string; categoryEn: string; categoryTh: string }> = [
  {
    id: '1',
    nameEn: 'Butter Croissant',
    nameTh: 'ครัวซองต์เนย',
    categoryEn: 'Pastry',
    categoryTh: 'ขนมอบ',
    price: '55',
    image: 'https://i.pinimg.com/736x/05/4b/1a/054b1ae2136808ae87e264fb7724f4c3.jpg',
  },
  {
    id: '2',
    nameEn: 'Chocolate Fudge Cake',
    nameTh: 'ช็อกโกแลตฟัดจ์เค้ก',
    categoryEn: 'Cake',
    categoryTh: 'เค้ก',
    price: '320',
    image: 'https://www.hickoryfarms.com/on/demandware.static/-/Sites-Web-Master-Catalog/default/dwee90ec6c/images/products/decadent-chocolate-fudge-layer-cake-064026-1.jpg',
  },
  {
    id: '3',
    nameEn: 'Strawberry Macaron',
    nameTh: 'มาการองสตรอเบอรี่',
    categoryEn: 'Macaron',
    categoryTh: 'มาการอง',
    price: '45',
    image: 'https://everythingmarina.com/wp-content/uploads/2022/01/AZ3A3254-2-683x1024.jpg',
  },
  {
    id: '4',
    nameEn: 'Vanilla Cupcake',
    nameTh: 'คัพเค้กวานิลลา',
    categoryEn: 'Cupcake',
    categoryTh: 'คัพเค้ก',
    price: '65',
    image: 'https://i.pinimg.com/originals/c1/b8/30/c1b830ad69f1025ba3f40e505013107f.jpg',
  },
  {
    id: '5',
    nameEn: 'Chocolate Chip Cookies',
    nameTh: 'คุกกี้ช็อกโกแลตชิป',
    categoryEn: 'Cookies',
    categoryTh: 'คุกกี้',
    price: '40',
    image: 'https://sallysbakingaddiction.com/wp-content/uploads/2013/05/classic-chocolate-chip-cookies.jpg',
  },
];

type Locale = 'en' | 'th';

const translations = {
  en: {
    eyebrow: 'BAKERY SHOP',
    title: 'Bakery Stock',
    searchPlaceholder: 'Search pastries, categories...',
    filter: 'Filter🔻',
    addButton: 'Add New Pastry',
    sectionLabel: (count: number) => `All Products (${count})`,
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
    addButton: 'เพิ่มขนมใหม่',
    sectionLabel: (count: number) => `สินค้าทั้งหมด (${count})`,
    home: 'หน้าแรก',
    add: 'เพิ่ม',
    menu: 'เมนู',
    settings: 'ตั้งค่า',
  },
};

export default function HomeScreen() {
  const [locale, setLocale] = useState<Locale>('en');
  const t = locale === 'en' ? translations.en : translations.th;
  const visibleProducts = PRODUCTS.map((product) => ({
    ...product,
    name: locale === 'en' ? product.nameEn : product.nameTh,
    category: locale === 'en' ? product.categoryEn : product.categoryTh,
  }));

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={BakeryColors.background} />

      <ThemedView style={styles.header}>
        <TouchableOpacity style={styles.categoryButton}>
          <ThemedText style={styles.categoryIcon}>☰</ThemedText>
        </TouchableOpacity>
        <View style={styles.titleWrap}>
          <ThemedText style={styles.headerEyebrow}>{t.eyebrow}</ThemedText>
          <ThemedText style={styles.headerTitle}>{t.title}</ThemedText>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.langButton}
            onPress={() => setLocale((current) => (current === 'en' ? 'th' : 'en'))}
          >
            <ThemedText style={styles.langButtonText}>{locale === 'en' ? 'ไทย' : 'EN'}</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.profileButton}>
            <ThemedText style={styles.profileIcon}>👤</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <ThemedText style={styles.searchIcon}>🔍</ThemedText>
          <TextInput
            style={styles.searchInput}
            placeholder={t.searchPlaceholder}
            placeholderTextColor={BakeryColors.textSecondary}
            editable={true}
          />
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <ThemedText style={styles.filterIcon}>{t.filter}</ThemedText>
        </TouchableOpacity>
      </View>

      <View style={styles.addRow}>
        <TouchableOpacity style={styles.addButton}>
          <ThemedText style={styles.addButtonIcon}>＋</ThemedText>
          <ThemedText style={styles.addButtonText}>{t.addButton}</ThemedText>
        </TouchableOpacity>
      </View>

      <FlatList
        style={styles.list}
        contentContainerStyle={styles.shelfArea}
        data={visibleProducts}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <ThemedText style={styles.sectionLabel}>{t.sectionLabel(visibleProducts.length)}</ThemedText>
        }
        renderItem={({ item }) => <ProductCard product={item} />}
      />

      <ThemedView style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <ThemedText style={styles.navIcon}>🏠</ThemedText>
          <ThemedText style={styles.navText}>{t.home}</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
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
  addRow: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 16,
  },
  addButton: {
    backgroundColor: BakeryColors.primary,
    height: 48,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    shadowColor: BakeryColors.primaryDark,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 2,
  },
  addButtonIcon: {
    color: BakeryColors.surface,
    fontSize: 16,
    fontWeight: '700',
  },
  addButtonText: {
    color: BakeryColors.surface,
    fontWeight: '600',
    fontSize: 14,
  },
  list: {
    flex: 1,
  },
  shelfArea: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 20,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: BakeryColors.secondary,
    marginBottom: 10,
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

