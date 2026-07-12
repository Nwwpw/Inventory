import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { BakeryColors } from '@/constants/theme';

export type Product = {
  id: string;
  name: string;
  category: string;
  price: string;
  image: string;
};

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  return (
    <View style={styles.productCard}>
      <View style={styles.productCover}>
        <Image
          source={{ uri: product.image }}
          style={styles.productCoverImage}
          resizeMode="cover"
        />
      </View>
      <View style={styles.productInfo}>
        <ThemedText style={styles.productTag}>{product.category}</ThemedText>
        <ThemedText style={styles.productTitle}>{product.name}</ThemedText>
        <ThemedText style={styles.productPrice}>฿{product.price}</ThemedText>
      </View>
      <TouchableOpacity style={styles.productMore}>
        <ThemedText style={styles.productMoreIcon}>⋮</ThemedText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  productCard: {
    flexDirection: 'row',
    backgroundColor: BakeryColors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BakeryColors.border,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
    gap: 12,
  },
  productCover: {
    width: 52,
    height: 68,
    borderRadius: 14,
    backgroundColor: BakeryColors.chip,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  productCoverImage: {
    width: '100%',
    height: '100%',
  },
  productInfo: {
    flex: 1,
  },
  productTag: {
    fontSize: 10,
    fontWeight: '700',
    color: BakeryColors.secondary,
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  productTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: BakeryColors.textPrimary,
    marginBottom: 2,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: BakeryColors.primaryDark,
  },
  productMore: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productMoreIcon: {
    fontSize: 18,
    color: BakeryColors.textSecondary,
  },
});