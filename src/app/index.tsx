import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  StatusBar,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProductCard } from '@/components/product-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BakeryColors } from '@/constants/theme';
import { useLanguage } from '@/context/language-context';
import { PRODUCTS_API_URL, useProducts } from '@/context/product-context';

// 🌐 1. Translation Dictionary (โครงสร้างข้อความ 2 ภาษา EN / TH)
// ทำหน้าที่เก็บข้อความหน้า UI ทั้งหมด เปลี่ยนตามภาษาที่ผู้ใช้เลือก (locale)
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
    imageUrlOption: 'Image URL',
    uploadOption: 'Upload Image',
    deleteConfirm: (name: string) => `Are you sure you want to delete ${name}?`,
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
    imageUrlOption: 'URL รูปภาพ',
    uploadOption: 'อัปโหลดรูปภาพ',
    deleteConfirm: (name: string) => `คุณต้องการลบ ${name} ใช่หรือไม่?`,
  },
};

export default function HomeScreen() {
  // -------------------------------------------------------------
  // ⚙️ 2. Hooks & State Management (เตรียมความพร้อมข้อมูลเริ่มต้น)
  // -------------------------------------------------------------
  const router = useRouter(); // ตัวจัดการเปลี่ยนหน้า (Navigation)
  const { products, isLoading, refreshProducts } = useProducts(); // ดึงข้อมูลสินค้า + ฟังก์ชั่นรีเฟรชจาก Context Global
  const { locale, toggleLanguage } = useLanguage(); // ดึงภาษาปัจจุบัน (en/th) และฟังก์ชั่นสลับภาษา
  
  const [searchQuery, setSearchQuery] = useState(''); // เก็บคำค้นหาที่ผู้ใช้พิมพ์ในช่อง Search
  const [role, setRole] = useState(''); // เก็บสิทธิ์ผู้ใช้ ('admin' หรือ 'user')
  const [isMounted, setIsMounted] = useState(false); // เช็กสถานะว่า Component โหลดฝั่ง Client เรียบร้อยหรือยัง

  // -------------------------------------------------------------
  // 🔐 3. Authentication Flow Check (ทำงานครั้งแรกเมื่อเปิดหน้านี้)
  // -------------------------------------------------------------
  useEffect(() => {
    // 1. ยืนยันว่าหน้าจอพร้อมทำงานฝั่ง Client แล้ว (ป้องกัน Server-Side Rendering พัง)
    setIsMounted(true);

    if (typeof window !== 'undefined') {
      // 2. ดึง Token จาก LocalStorage
      const token = localStorage.getItem('token');
      console.log('TOKEN =', token);

      // 3. ป้องกันคนแอบเข้า: ถ้าไม่มี Token ให้เด้งส่งไปหน้า Login ทันที
      if (!token) {
        router.replace('/login');
        return;
      }

      // 4. อ่าน Role ของผู้ใช้จาก LocalStorage (เพื่อเอาไปควบคุมปุ่ม เพิ่ม/แก้ไข/ลบ)
      const savedRole = localStorage.getItem('role') || '';
      setRole(savedRole);
      console.log('ROLE =', savedRole);
    }
  }, []);

  // เลือกว่าจะใช้ชุดคำแปลภาษาไทย หรือ ภาษาอังกฤษ ตาม State locale
  const t = locale === 'en' ? translations.en : translations.th;

  // -------------------------------------------------------------
  // 🔄 4. Auto Refresh Flow (ดึงข้อมูลใหม่เมื่อสลับกลับมาหน้านี้)
  // -------------------------------------------------------------
  useFocusEffect(
    useCallback(() => {
      // ทุกครั้งที่ผู้ใช้สลับหน้ากลับมาที่หน้านี้ ให้สั่งดึงข้อมูลสินค้าใหม่ล่าสุดจาก API เสมอ
      if (isMounted && typeof refreshProducts === 'function') {
        refreshProducts();
      }
    }, [isMounted])
  );

  // -------------------------------------------------------------
  // 🔍 5. Search & Data Pipeline Flow (กรอง + แปลงโครงสร้างข้อมูล)
  // -------------------------------------------------------------
  const visibleProducts = useMemo(() => {
    if (!Array.isArray(products)) return [];

    return products
      // Step A: Filtering Flow (กรองสินค้าจากช่อง Search)
      .filter((item: any) => {
        if (!item) return false;
        // ดึงชื่อและหมวดหมู่มารองรับหลาย Key จาก Database เพื่อป้องกันข้อมูลหลุด
        const name = (item.nameEn || item.nameTh || item.name || '').toLowerCase();
        const category = (item.categoryEn || item.categoryTh || item.category || '').toLowerCase();
        const query = searchQuery.toLowerCase().trim(); // เปลี่ยนเป็นพิมพ์เล็ก, ตัดช่องว่างรอบๆ เพื่อให้ค้นหาได้ง่ายขึ้น
        
        // คืนค่าเฉพาะสินค้าที่มีชื่อหรือหมวดหมู่ตรงกับคำค้นหา
        return name.includes(query) || category.includes(query);
      })
      // Step B: Data Normalization Flow (จัดฟอร์แมตข้อมูลให้ ProductCard นำไปใช้ง่ายๆ)
      .map((item: any) => {
        // ดึงราคา/สต็อก แบบครอบคลุม ป้องกันชื่อ Field จาก API ไม่ตรงกัน
        const rawPrice = item.price ?? item.price_baht ?? item.price_per_unit ?? 0;
        const rawStock = item.stock ?? item.quantity ?? item.amount ?? item.stock_quantity ?? 0;
        const imageUrl = item.image || item.imageUrl || item.image_url || null;

        return {
          ...item,
          id: String(item.id ?? Math.random()),
          // เลือกแสดงชื่อ/หมวดหมู่ให้ตรงกับภาษา (EN / TH) ที่เลือกอยู่
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
  }, [products, locale, searchQuery]); // ทำงานใหม่เฉพาะเมื่อ ข้อมูลสินค้า, ภาษา หรือ คำค้นหา มีการเปลี่ยนแปลง

  // ป้องกันการ Render พัง ช่วงที่หน้าเว็บกำลังโหลดฝั่ง Server (SSR Guard)
  if (!isMounted) {
    return null;
  }

  // -------------------------------------------------------------
  // 🎨 6. UI Render Structure (โครงสร้างส่วนแสดงผล)
  // -------------------------------------------------------------
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={BakeryColors.background} />

      {/* 🧱 Structure Section A: Header (แถบบนสุด) */}
      <ThemedView style={styles.header}>
        {/* ปุ่ม Hamburger Menu */}
        <TouchableOpacity style={styles.categoryButton}>
          <ThemedText style={styles.categoryIcon}>☰</ThemedText>
        </TouchableOpacity>

        {/* ชื่อหัวข้อหน้าจอ */}
        <View style={styles.titleWrap}>
          <ThemedText style={styles.headerEyebrow}>{t.eyebrow}</ThemedText>
          <ThemedText style={styles.headerTitle}>{t.title}</ThemedText>
        </View>

        {/* ปุ่มแอคชันฝั่งขวา (สลับภาษา + โปรไฟล์) */}
        <View style={styles.headerActions}>
          {/* 🌐 Toggle Language Flow: กดเพื่อเปลี่ยนภาษาทั้งแอพ */}
          <TouchableOpacity style={styles.langButton} onPress={toggleLanguage}>
            <ThemedText style={styles.langButtonText}>
              {locale === 'en' ? 'ไทย' : 'EN'}
            </ThemedText>
          </TouchableOpacity>

          {/* 👤 Navigate Flow: กดเพื่อเปิดไปหน้าโปรไฟล์ */}
          <TouchableOpacity style={styles.profileButton} onPress={() => router.push('/profile')}>
            <ThemedText style={styles.profileIcon}>👤</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>

      {/* 🧱 Structure Section B: Search Bar (กล่องค้นหา) */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <ThemedText style={styles.searchIcon}>🔍</ThemedText>
          {/* 🔍 Search Input Flow: พิมพ์ข้อความ -> อัปเดต searchQuery state ทันที */}
          <TextInput
            style={styles.searchInput}
            placeholder={t.searchPlaceholder}
            placeholderTextColor={BakeryColors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            editable={true}
          />
        </View>
      </View>

      {/* 🧱 Structure Section C: Product List (รายการแสดงสินค้า) */}
      <FlatList
        style={styles.list}
        contentContainerStyle={styles.shelfArea}
        data={visibleProducts} // นำข้อมูลที่ผ่านการกรอง/จัดฟอร์แมตแล้วมาแสดง
        keyExtractor={(item) => item.id}
        refreshing={isLoading}
        onRefresh={refreshProducts} // 🔄 Pull to Refresh Flow: ดึงหน้าจอลงเพื่อโหลดข้อมูลใหม่
        
        // ส่วนหัวของรายการสินค้า
        ListHeaderComponent={
          <View style={styles.listHeaderRow}>
            {/* แสดงจำนวนสินค้าทั้งหมดที่มีอยู่ขณะนั้น */}
            <ThemedText style={styles.sectionLabel}>{t.sectionLabel(visibleProducts.length)}</ThemedText>
            
            {/* ➕ Quick Add Flow: ปุ่มเพิ่มสินค้าแบบด่วน (จำกัดเฉพาะ role === 'admin' ถึงจะเห็น) */}
            {role === 'admin' && (
              <TouchableOpacity
                style={styles.quickAddBtn}
                onPress={() => router.push('/add')} // นำทางไปหน้าสร้างสินค้า /add
              >
                <ThemedText style={styles.quickAddBtnText}>
                  {t.quickAddBtn}
                </ThemedText>
              </TouchableOpacity>
            )}
          </View>
        }

        // การแสดงผลสินค้าแต่ละรายการ (ส่ง Data & Callbacks ลงไปที่ ProductCard)
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            editText={t.editBtn}
            inStockText={t.inStock}
            outOfStockText={t.outOfStock}
            
            // ✏️ Edit Flow: กดปุ่มแก้ไข -> ส่ง id สินค้าไปที่หน้า /edit เพื่อดึงข้อมูลมาแก้
            onEdit={(prod) =>             // เมื่อกดปุ่มแก้ไข โดยรับข้อมูลสินค้า (prod) เข้ามา
              router.push({               // เปลี่ยนหน้าจอไปยังปลายทางที่กำหนด
                pathname: '/edit',        // ระบุไปที่หน้าแก้ไขสินค้า (/edit)
                params: { id: prod.id },  // แนบ ID สินค้าไปด้วย เพื่อให้หน้าแก้ไขรู้ว่าเป็นชิ้นไหน
              })
            }
            
            // 🗑️ Delete Flow: กระบวนการลบสินค้า
            onDelete={async (prod) => {
              // 1. เช็กว่ารันบนเบราว์เซอร์หรือไม่ (ป้องกัน SSR Crash)
              if (typeof window !== 'undefined') {
                // 2. เด้ง Confirm Dialog ถามความแน่ใจผู้ใช้
                const confirmDelete = window.confirm(t.deleteConfirm(prod.name));
                // 3. ถ้านผู้ใช้กด "ยกเลิก" -> หยุดการทำงานทันที
                if (!confirmDelete) return;
              }

              try {
                // 4. ดึง Auth Token จาก LocalStorage
                const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

                // 5. ส่ง Request ยิง DELETE ไปยัง API พร้อมแนบ Token ใน Header
                const response = await fetch(
                  `${PRODUCTS_API_URL}/${prod.id}`, // เช็ค id ถ้าเจอส่งคำสั่งให้ server.js
                  {
                    method: 'DELETE',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${token}`, // ยืนยันสิทธิ์ตัวตนกัน Error 401
                    },
                  }
                );

                if (!response.ok) {
                  throw new Error('Delete failed');
                }

                // 6. ลบสำเร็จ -> แจ้งเตือน + รีเฟรชรายการสินค้าบนหน้าจอทันที
                alert('Deleted successfully');
                refreshProducts();
              } catch (error) {
                console.error(error);
                alert('Delete failed');
              }
            }}
          />
        )}
      />

      {/* 🧱 Structure Section D: Bottom Navigation Bar (เมนูด้านล่าง) */}
      <ThemedView style={styles.bottomNav}>
        {/* เมนู 1: หน้าแรก */}
        <TouchableOpacity style={styles.navItem}>
          <ThemedText style={styles.navIcon}>🏠</ThemedText>
          <ThemedText style={styles.navText}>{t.home}</ThemedText>
        </TouchableOpacity>

        {/* ➕ Add Flow 2: เมนูเพิ่มสินค้าบน Nav Bar (ซ่อนไว้ ถ้าไม่ใช่ Admin) */}
        {role === 'admin' && (
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => router.push('/add')} // นำทางไปหน้าสร้างสินค้า /add
          >
            <ThemedText style={styles.navIcon}>➕</ThemedText>
            <ThemedText style={styles.navText}>{t.add}</ThemedText>
          </TouchableOpacity>
        )}

        {/* เมนู 3: เมนูเบเกอรี่ (กำลังเปิดใช้งานอยู่ - Active) */}
        <TouchableOpacity style={styles.navItemActive}>
          <View style={styles.navActivePill}>
            <ThemedText style={styles.navIconActive}>🧁</ThemedText>
          </View>
          <ThemedText style={styles.navTextActive}>{t.menu}</ThemedText>
        </TouchableOpacity>

        {/* เมนู 4: ตั้งค่า */}
        <TouchableOpacity style={styles.navItem}>
          <ThemedText style={styles.navIcon}>⚙️</ThemedText>
          <ThemedText style={styles.navText}>{t.settings}</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </SafeAreaView>
  );
}

// -------------------------------------------------------------
// 🎨 7. Stylesheet (ส่วนกำหนดสไตล์และเลย์เอาต์ของหน้าจอ)
// -------------------------------------------------------------
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
    justify: 'center',
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
    justify: 'center',
  },

  navItemActive: {
    flex: 1,
    alignItems: 'center',
    justify: 'center',
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