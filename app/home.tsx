import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { TextInput } from "react-native-paper";

export default function Produtos() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <View style={styles.container}>
      {/* Gradiente superior */}
      <LinearGradient
        colors={["#EA3F24", "#4E0000"]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 0, y: 0 }}
        style={styles.gradientBox}
      >
        {/* Linha com barra de busca e ícone de menu */}
        <View style={styles.topRow}>
          <TextInput
            label="Buscar Produtos"
            value={searchQuery}
            onChangeText={setSearchQuery}
            mode="flat"
            left={
              <TextInput.Icon
                icon={() => <MaterialCommunityIcons name="magnify" size={22} />}
              />
            }
            style={styles.searchBar}
          />

          {/* Botão de menu */}
          <TouchableOpacity style={styles.menuButton}>
            <Image
              source={require("./assets/icons/menu.png")}
              style={styles.menuIcon}
            />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Quadrados com ícones e textos */}
      <View style={styles.squaresContainer}>
        <View style={styles.square}>
          <Image source={require("./assets/icons/promocao.png")} style={styles.icon} />
          <Text style={styles.squareText}>Promoções</Text>
        </View>

        <View style={styles.square}>
          <Image source={require("./assets/icons/pertodevc.png")} style={styles.icon} />
          <Text style={styles.squareText}>Perto de você</Text>
        </View>

        <View style={styles.square}>
          <Image source={require("./assets/icons/categoria.png")} style={styles.icon} />
          <Text style={styles.squareText}>Categorias</Text>
        </View>
      </View>

      {/* Conteúdo da tela */}
      <View style={styles.content}>
        <Text style={{ fontSize: 24 }}>Tela de Produtos</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  gradientBox: {
    height: "25%",
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    paddingHorizontal: 20,
    paddingTop: 40,
    justifyContent: "flex-start",
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  searchBar: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 25,
    height: 50,
    marginRight: 10, // espaço entre a barra e o ícone
  },
  menuButton: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  menuIcon: {
    width: 25,
    height: 25,
    resizeMode: "contain",
  },
  squaresContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: -25,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  square: {
    width: 110,
    height: 110,
    backgroundColor: "#fff",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
  },
  icon: {
    width: 35,
    height: 35,
    resizeMode: "contain",
    marginBottom: 8,
  },
  squareText: {
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
});
