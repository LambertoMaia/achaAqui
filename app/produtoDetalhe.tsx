// ProdutoDetalhe.tsx
import { useLocalSearchParams } from "expo-router"; // <- aqui mudou
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";

export default function ProdutoDetalhe() {
  const { product } = useLocalSearchParams<{ product?: string }>(); // pega params
  const item = product ? JSON.parse(product) : null;

  if (!item) {
    return (
      <View style={styles.container}>
        <Text>Produto não encontrado</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.image} />
      ) : (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>IMG</Text>
        </View>
      )}

      <View style={styles.infoContainer}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.price}>R$ {item.price}</Text>
        <Text style={styles.category}>Categoria: {item.category}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#fff" },
  image: { width: "100%", height: 300, borderRadius: 12, marginBottom: 20, resizeMode: "cover" },
  placeholder: { width: "100%", height: 300, backgroundColor: "#eee", justifyContent: "center", alignItems: "center", borderRadius: 12, marginBottom: 20 },
  placeholderText: { color: "#aaa", fontSize: 16 },
  infoContainer: { paddingHorizontal: 10 },
  name: { fontSize: 24, fontWeight: "700", marginBottom: 10 },
  price: { fontSize: 20, fontWeight: "800", color: "#EA3F24", marginBottom: 10 },
  category: { fontSize: 16, color: "#555" },
});
