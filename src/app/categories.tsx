import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    FlatList,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import { BakeryColors } from '@/constants/theme';

type Locale = 'en' | 'th';

const CATEGORIES = [
  { id: '1', icon: '🥐', nameEn: 'Croissant & Pastry', nameTh: 'ครัวซองต์และพาย', count: 12 },
  { id: '2', icon: '🎂', nameEn: 'Cakes', nameTh: 'เค้กชิ้น & เค้กปอนด์', count: 8 },
  { id: '3', icon: '🍞', nameEn: 'Bread & Toast', nameTh: 'ขนมปัง & โทสต์', count: 15 },
  { id: '4', icon: '🥧', nameEn: 'Tarts & Pies', nameTh: 'ทาร์ตและพายหวาน', count: 6 },
  { id: '5', icon: '☕', nameEn: 'Drinks & Coffee', nameTh: 'เครื่องดื่ม & กาแฟ', count: 10 },
];

export default function CategoriesScreen() {
  const router = useRouter();
  const [locale, setLocale] = useState<Locale>('th');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={BakeryColors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.titleWrap}>
          <Text style={styles.headerEyebrow}>{locale === 'en' ? 'BAKERY SHOP' : 'ร้านเบเกอรี่'}</Text>
          <Text style={styles.headerTitle}>{locale === 'en' ? 'Categories' : 'หมวดหมู่สินค้า'}</Text>
        </View>
        <TouchableOpacity
          style={styles.langButton}
          onPress={() => setLocale((curr) => (curr === 'en' ? 'th' : 'en'))}>
          <Text style={styles.langButtonText}>{locale === 'en' ? 'ไทย' : 'EN'}</Text>
        </TouchableOpacity>
      </View>

      {/* Category List */}
      <FlatList
        contentContainerStyle={styles.listArea}
        data={CATEGORIES}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => router.push('/products')}>
            <Text style={styles.cardIcon}>{item.icon}</Text>
            <View style={styles.cardTextWrap}>
              <Text style={styles.cardTitle}>
                {locale === 'en' ? item.nameEn : item.nameTh}
              </Text>
              <Text style={styles.cardSubtitle}>
                {item.count} {locale === 'en' ? 'Items' : 'รายการ'}
              </Text>
            </View>
            <Text style={styles.arrowIcon}>›</Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BakeryColors.background },
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
  backButton: { width: 34, height: 34, justifyContent: 'center', alignItems: 'center' },
  backIcon: { fontSize: 22, color: BakeryColors.primaryDark, fontWeight: '700' },
  titleWrap: { alignItems: 'center' },
  headerEyebrow: { fontSize: 11, color: BakeryColors.secondary, letterSpacing: 1, marginBottom: 2 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: BakeryColors.textPrimary },
  langButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: BakeryColors.chip,
    borderWidth: 1,
    borderColor: BakeryColors.border,
  },
  langButtonText: { fontSize: 11, fontWeight: '700', color: BakeryColors.primaryDark },
  listArea: { padding: 20, gap: 12 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BakeryColors.surface,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BakeryColors.border,
  },
  cardIcon: { fontSize: 32, marginRight: 16 },
  cardTextWrap: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: BakeryColors.textPrimary },
  cardSubtitle: { fontSize: 12, color: BakeryColors.textSecondary, marginTop: 2 },
  arrowIcon: { fontSize: 22, color: BakeryColors.primaryDark, fontWeight: '600' },
});