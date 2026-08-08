import { useProducts } from '@/context/product-context';
import { FlatList, Image, StyleSheet, Text, View } from 'react-native';

export default function ProductsScreen() {
  const { products, isLoading, refreshProducts } = useProducts();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Product List</Text>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id.toString()}
        refreshing={isLoading}
        onRefresh={refreshProducts}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image 
              source={{ uri: item.image || (item as any).imageUrl || 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500' }} 
              style={styles.image} 
            />
            <View style={styles.info}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.category}>{item.category || 'Bakery'}</Text>
              <Text style={styles.stock}>
                {item.price ? `ราคา: ${item.price} ฿` : `Stock: ${item.stock}`}
              </Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  card: { flexDirection: 'row', marginBottom: 12, borderWidth: 1, borderColor: '#eee', borderRadius: 8, padding: 8 },
  image: { width: 70, height: 70, borderRadius: 6 },
  info: { marginLeft: 12, justifyContent: 'center' },
  name: { fontSize: 16, fontWeight: 'bold' },
  category: { color: '#666', fontSize: 14 },
  stock: { color: '#007AFF', marginTop: 4 },
});