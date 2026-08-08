import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import { BakeryColors } from '@/constants/theme';

export default function CartScreen() {
  const router = useRouter();
  const [locale, setLocale] = useState<'en' | 'th'>('th');

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
          <Text style={styles.headerTitle}>{locale === 'en' ? 'Your Cart' : 'ตะกร้าของคุณ'}</Text>
        </View>
        <TouchableOpacity
          style={styles.langButton}
          onPress={() => setLocale((curr) => (curr === 'en' ? 'th' : 'en'))}>
          <Text style={styles.langButtonText}>{locale === 'en' ? 'ไทย' : 'EN'}</Text>
        </TouchableOpacity>
      </View>

      {/* Empty State */}
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>🛍️</Text>
        <Text style={styles.emptyTitle}>
          {locale === 'en' ? 'Your cart is empty' : 'ยังไม่มีสินค้าในตะกร้า'}
        </Text>
        <Text style={styles.emptySubtitle}>
          {locale === 'en' ? 'Add some sweet pastries to get started' : 'เลือกซื้อขนมอร่อยๆ ใส่ตะกร้าได้เลย'}
        </Text>
        <TouchableOpacity style={styles.shopButton} onPress={() => router.push('/')}>
          <Text style={styles.shopButtonText}>
            {locale === 'en' ? 'Explore Pastries 🧁' : 'เลือกซื้อขนม 🧁'}
          </Text>
        </TouchableOpacity>
      </View>
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
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyIcon: { fontSize: 50, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: BakeryColors.textPrimary, marginBottom: 6 },
  emptySubtitle: { fontSize: 13, color: BakeryColors.textSecondary, textAlign: 'center', marginBottom: 20 },
  shopButton: {
    backgroundColor: BakeryColors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 16,
  },
  shopButtonText: { color: BakeryColors.surface, fontWeight: '700', fontSize: 14 },
});