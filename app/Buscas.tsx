import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  FlatList,
  StyleSheet,
  ListRenderItem,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Tipagem das lojas
interface Store {
  id: string;
  name: string;
  distance: string;
  logo: any;
}

export default function PertoDeVoce() {
  const [search, setSearch] = useState<string>("");

  const stores: Store[] = [
    { id: "1", name: "Assaí atacadista", distance: "300 m", logo: require("../assets/assai.png") },
    { id: "2", name: "Mix Mateus", distance: "400 m", logo: require("../assets/mixmateus.png") },
    { id: "3", name: "Assaí atacadista", distance: "1,2 km", logo: require("../assets/assai.png") },
    { id: "4", name: "Mix Mateus", distance: "400 m", logo: require("../assets/mixmateus.png") },
  ];

  const renderItem: ListRenderItem<Store> = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardLeft}>
        <Image source={item.logo} style={styles.logo} />
        <View>
          <Text style={styles.storeName}>{item.name}</Text>
          <View style={styles.distanceRow}>
            <Ionicons name="location-outline" size={16} color="#777" />
            <Text style={styles.distanceText}>{item.distance}</Text>
          </View>
        </View>
      </View>
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Ver perfil</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Cabeçalho com barra de busca */}
      <View style={styles.header}>
        <TouchableOpacity>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={18} color="#999" style={{ marginLeft: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Pesquise o produto que você deseja"
            placeholderTextColor="#999"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <TouchableOpacity>
          <Ionicons name="menu" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Lista de lojas */}
      <FlatList
        data={stores}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 12, paddingTop: 12 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f7f7",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E53935",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 20,
    marginHorizontal: 8,
    paddingVertical: 4,
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 8,
    fontSize: 14,
    color: "#333",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 2,
  },
  cardLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: 45,
    height: 45,
    borderRadius: 8,
    marginRight: 10,
  },
  storeName: {
    fontSize: 15,
    fontWeight: "500",
    color: "#333",
  },
  distanceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  distanceText: {
    fontSize: 13,
    color: "#777",
    marginLeft: 4,
  },
  button: {
    borderWidth: 1,
    borderColor: "#E53935",
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  buttonText: {
    color: "#E53935",
    fontSize: 13,
    fontWeight: "500",
  },
});
