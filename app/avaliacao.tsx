import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function PerfilLoja() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ flexGrow: 1 }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backRow}>
          <Ionicons name="arrow-back" size={22} color="#E53935" />
          <Text style={styles.backText}>Voltar para Perfil</Text>
        </TouchableOpacity>
      </View>

      {/* Card da Loja */}
      <View style={styles.storeCard}>
        <View style={styles.storeRow}>
          <Image source={require("../assets/assai.png")} style={styles.storeLogo} />
          <Text style={styles.storeName}>Assaí Atacadista</Text>
        </View>

        {/* Informações */}
        <View style={styles.infoRow}>
          <Ionicons name="star-outline" size={18} color="#555" />
          <Text style={styles.infoLabel}>Avaliação</Text>
          <Text style={styles.infoValue}>
            <Text style={{ color: "#E53935", fontWeight: "600" }}>4.7</Text> de 5{" "}
            <Text style={styles.infoSub}>(400 avaliações)</Text>
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="time-outline" size={18} color="#555" />
          <Text style={styles.infoLabel}>Tempo de Resposta</Text>
          <Text style={styles.infoValue}>
            <Text style={{ color: "#E53935", fontWeight: "600" }}>54%</Text>{" "}
            <Text style={styles.infoSub}>(Dentro de horas)</Text>
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="cart-outline" size={18} color="#555" />
          <Text style={styles.infoLabel}>Produtos</Text>
          <Text style={[styles.infoValue, { color: "#E53935", fontWeight: "600" }]}>1500</Text>
        </View>
      </View>

      {/* Botão principal */}
      <TouchableOpacity style={styles.mainButton}>
        <Text style={styles.mainButtonText}>Ver todos os produtos</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f6f6f6",
  },
  header: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  backText: {
    marginLeft: 6,
    color: "#E53935",
    fontSize: 15,
    fontWeight: "500",
  },
  storeCard: {
    backgroundColor: "#fff",
    margin: 16,
    borderRadius: 10,
    padding: 16,
    elevation: 2,
  },
  storeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  storeLogo: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 10,
  },
  storeName: {
    fontSize: 17,
    fontWeight: "600",
    color: "#333",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  infoLabel: {
    marginLeft: 8,
    fontSize: 14,
    color: "#555",
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: "#444",
  },
  infoSub: {
    color: "#999",
    fontSize: 12,
  },
  mainButton: {
    backgroundColor: "#E53935",
    paddingVertical: 12,
    borderRadius: 6,
    marginHorizontal: 16,
    alignItems: "center",
    marginBottom: 20,
  },
  mainButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
