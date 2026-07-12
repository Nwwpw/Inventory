import { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

import { BakeryColors } from "@/constants/theme";

type Locale = "en" | "th";

const translations = {
  en: {
    eyebrow: "BAKERY SHOP",
    title: "Bakery Stock",
    searchPlaceholder: "Search pastries, categories...",
    filter: "⚲ Filter",
    addButton: "Add New Pastry",
    emptyTitle: "The pastry shelf is still empty",
    emptySubtitle: "Start adding your first pastry now",
    home: "Home",
    add: "Add",
    menu: "Pastries",
    categories: "Categories",
  },
  th: {
    eyebrow: "ร้านเบเกอรี่",
    title: "สต็อกเบเกอรี่",
    searchPlaceholder: "ค้นหาขนมและหมวดหมู่...",
    filter: "⚲ ตัวกรอง",
    addButton: "เพิ่มขนมใหม่",
    emptyTitle: "ชั้นวางขนมยังว่างอยู่",
    emptySubtitle: "เริ่มเพิ่มขนมแรกของคุณเลยตอนนี้",
    home: "หน้าแรก",
    add: "เพิ่ม",
    menu: "ขนม",
    categories: "หมวดหมู่",
  },
};

export default function ProductHeader() {
  const [locale, setLocale] = useState<Locale>("en");
  const t = locale === "en" ? translations.en : translations.th;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={BakeryColors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuButton}>
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
        <View style={styles.titleWrap}>
          <Text style={styles.headerEyebrow}>{t.eyebrow}</Text>
          <Text style={styles.headerTitle}>{t.title}</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.langButton}
            onPress={() => setLocale((current) => (current === "en" ? "th" : "en"))}
          >
            <Text style={styles.langButtonText}>{locale === "en" ? "ไทย" : "EN"}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.profileButton}>
            <Text style={styles.profileIcon}>👤</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search and Filter */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder={t.searchPlaceholder}
            placeholderTextColor={BakeryColors.textSecondary}
            editable={true}
          />
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterIcon}>{t.filter}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.addRow}>
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonIcon}>＋</Text>
          <Text style={styles.addButtonText}>{t.addButton}</Text>
        </TouchableOpacity>
      </View>

      {/* Main Content Area (For layout buffer) */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.shelfArea}
      >
        {/* You can add product items here */}
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🧁</Text>
          <Text style={styles.emptyTitle}>{t.emptyTitle}</Text>
          <Text style={styles.emptySubtitle}>
            {t.emptySubtitle}
          </Text>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>🏠</Text>
          <Text style={styles.navText}>{t.home}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>➕</Text>
          <Text style={styles.navText}>{t.add}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItemActive}>
          <View style={styles.navActivePill}>
            <Text style={styles.navIconActive}>🧁</Text>
          </View>
          <Text style={styles.navTextActive}>{t.menu}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>🗂️</Text>
          <Text style={styles.navText}>{t.categories}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ---- Cute Minimal Bakery palette (see BakeryColors in constants/theme.ts) ----
// Background cream : BakeryColors.background (#FFF8F3)
// Card white       : BakeryColors.surface   (#FFFFFF)
// Frosting pink    : BakeryColors.primary   (#F2A6B8)
// Pink pressed     : BakeryColors.primaryDark (#E27F98)
// Caramel accent   : BakeryColors.secondary (#C98B5E)
// Soft peach border: BakeryColors.border    (#F6E1D3)
// Text cocoa       : BakeryColors.textPrimary (#5B4636)
// Muted mocha      : BakeryColors.textSecondary (#B29A8B)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BakeryColors.background,
  },
  header: {
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    backgroundColor: BakeryColors.surface,
    borderBottomWidth: 1,
    borderBottomColor: BakeryColors.border,
  },
  menuButton: {
    width: 34,
    height: 34,
    justifyContent: "center",
    alignItems: "center",
  },
  menuIcon: {
    fontSize: 18,
    color: BakeryColors.primaryDark,
  },
  titleWrap: {
    alignItems: "center",
  },
  headerEyebrow: {
    fontSize: 11,
    color: BakeryColors.secondary,
    letterSpacing: 1,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: BakeryColors.textPrimary,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
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
    fontWeight: "700",
    color: BakeryColors.primaryDark,
  },
  profileButton: {
    width: 34,
    height: 34,
    backgroundColor: BakeryColors.primary,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
  },
  profileIcon: {
    fontSize: 16,
    color: BakeryColors.surface,
  },
  searchContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
    gap: 12,
    alignItems: "center",
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: BakeryColors.surface,
    borderWidth: 1,
    borderColor: BakeryColors.border,
    borderRadius: 20,
    paddingHorizontal: 14,
    alignItems: "center",
    height: 52,
  },
  searchIcon: {
    fontSize: 15,
    marginRight: 8,
    opacity: 0.7,
  },
  searchInput: {
    flex: 1,
    height: "100%",
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
    justifyContent: "center",
    alignItems: "center",
  },
  filterIcon: {
    color: BakeryColors.primaryDark,
    fontSize: 18,
    fontWeight: "700",
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
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
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
    fontWeight: "700",
  },
  addButtonText: {
    color: BakeryColors.surface,
    fontWeight: "600",
    fontSize: 14,
  },
  shelfArea: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 12,
    opacity: 0.7,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: BakeryColors.primaryDark,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    color: BakeryColors.textSecondary,
    textAlign: "center",
  },
  bottomNav: {
    flexDirection: "row",
    backgroundColor: BakeryColors.surface,
    borderTopWidth: 1,
    borderTopColor: BakeryColors.border,
    paddingVertical: 10,
    paddingBottom: 14,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  navItemActive: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
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
    fontWeight: "700",
  },
});