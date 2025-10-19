import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

interface SimilarProduct {
  id: string;
  image: any;
  name: string;
  price: string;
}

export default function ProdutoDetalhe() {
  const similares: SimilarProduct[] = [
    {
      id: "1",
      image: require("../assets/oleo.png"),
      name: "Óleo de Soja Soya Pet 900ml",
      price: "R$ 7,50",
    },
    {
      id: "2",
      image: require("../assets/oleo.png"),
      name: "Óleo de Soja Soya Pet 900ml",
      price: "R$ 7,59",
    },
    {
      id: "3",
      image: require("../assets/oleo.png"),
      name: "Óleo de Soja Soya Pet 900ml",
      price: "R$ 7,59",
    },
  ];

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1 }} />
        <TouchableOpacity>
          <Ionicons name="menu" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* IMAGEM DO PRODUTO */}
      <Image source={require("../assets/oleo.png")} style={styles.productImage} />

      {/* DETALHES DO PRODUTO */}
      <View style={styles.productInfo}>
        <View style={styles.priceRow}>
          <Text style={styles.price}>R$ 7,50</Text>
          <View style={styles.discountTag}>
            <Text style={styles.discountText}>10%</Text>
          </View>
          <Ionicons name="heart-outline" size={22} color="#444" style={{ marginLeft: "auto" }} />
        </View>

        <Text style={styles.productName}>Óleo de Soja Soya Pet 900ml</Text>

        {/* INFORMAÇÕES DA LOJA */}
        <View style={styles.storeCard}>
          <Image source={require("../assets/assai.png")} style={styles.storeLogo} />
          <View style={{ flex: 1 }}>
            <Text style={styles.storeName}>Assaí atacadista</Text>
            <Text style={styles.storeLocation}>📍 Recife, Pernambuco</Text>
          </View>
          <TouchableOpacity style={styles.viewButton}>
            <Text style={styles.viewButtonText}>Ver perfil</Text>
          </TouchableOpacity>
        </View>

        {/* PRODUTOS SIMILARES */}
        <Text style={styles.sectionTitle}>Produtos similares</Text>
        <FlatList
          data={similares}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.similarCard}>
              <Image source={item.image} style={styles.similarImage} />
              <Text style={styles.similarName} numberOfLines={2}>
                {item.name}
              </Text>
              <Text style={styles.similarPrice}>{item.price}</Text>
            </View>
          )}
        />
      </View>

      {/* BOTÃO ADICIONAR À LISTA */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.footerButton}>
          <Ionicons name="cart-outline" size={20} color="#fff" />
          <Text style={styles.footerText}>Adicionar à lista</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    backgroundColor: "#E53935",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  productImage: {
    width: width,
    height: 230,
    resizeMode: "contain",
    backgroundColor: "#f7f7f7",
  },
  productInfo: {
    flex: 1,
    padding: 16,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  price: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#000",
  },
  discountTag: {
    backgroundColor: "#FFE6E6",
    borderRadius: 4,
    marginLeft: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  discountText: {
    color: "#E53935",
    fontSize: 12,
    fontWeight: "bold",
  },
  productName: {
    marginTop: 6,
    fontSize: 16,
    color: "#333",
  },
  storeCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7F7F7",
    borderRadius: 8,
    padding: 10,
    marginTop: 12,
  },
  storeLogo: {
    width: 45,
    height: 45,
    borderRadius: 8,
    marginRight: 10,
  },
  storeName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },
  storeLocation: {
    fontSize: 12,
    color: "#777",
  },
  viewButton: {
    borderWidth: 1,
    borderColor: "#E53935",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  viewButtonText: {
    color: "#E53935",
    fontSize: 13,
    fontWeight: "500",
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginTop: 14,
    marginBottom: 8,
  },
  similarCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    marginRight: 10,
    padding: 8,
    width: 120,
    alignItems: "center",
    elevation: 2,
  },
  similarImage: {
    width: 80,
    height: 100,
    resizeMode: "contain",
  },
  similarName: {
    fontSize: 12,
    color: "#333",
    textAlign: "center",
    marginTop: 4,
  },
  similarPrice: {
    fontSize: 13,
    color: "#000",
    fontWeight: "bold",
    marginTop: 4,
  },
  footer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#eee",
    padding: 12,
    justifyContent: "center",
  },
  footerButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E53935",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  footerText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
    marginLeft: 8,
  },
});
