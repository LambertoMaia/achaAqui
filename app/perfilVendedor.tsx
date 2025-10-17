// perfilVendedor.tsx (atualizado para contar produtos do usuário)
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const STORAGE_USER_KEY = "@my_app_user_v1";
const STORAGE_KEY_PRODUCTS_PREFIX = "@my_app_products_v1:";
const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function PerfilVendedor() {
  const [user, setUser] = useState<{ nome?: string; email?: string } | null>(null);
  const [rating, setRating] = useState<number>(0); // 0..5
  const [followers, setFollowers] = useState<number>(0);
  const [productsCount, setProductsCount] = useState<number>(0);
  const router = useRouter();

  useEffect(() => {
    const loadAll = async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_USER_KEY);
        const usr = raw ? JSON.parse(raw) : null;
        setUser(usr);

        const email = usr?.email ? String(usr.email).toLowerCase() : null;
        if (email) {
          const rawProducts = await AsyncStorage.getItem(`${STORAGE_KEY_PRODUCTS_PREFIX}${email}`);
          const arr = rawProducts ? JSON.parse(rawProducts) : [];
          setProductsCount(Array.isArray(arr) ? arr.length : 0);
        } else {
          setProductsCount(0);
        }

        // se tiver followers/ratings salvos também, carregar aqui (ex.: key separada)
        // setFollowers(...) / setRating(...)
      } catch (err) {
        console.warn("Erro ao carregar perfil:", err);
      }
    };
    loadAll();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem(STORAGE_USER_KEY);
    router.replace("/"); // volta pra inicial
  };

  return (
    <View style={styles.container}>
      {/* Top rectangle */}
      <View style={styles.topRectangle}>
        <View style={styles.topRow}>
          <TouchableOpacity activeOpacity={0.8} style={styles.searchBar}>
            <MaterialCommunityIcons name="magnify" size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.searchPlaceholder}>Buscar produtos...</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuButton} onPress={() => router.push("/home")}>
            <MaterialIcons name="menu" size={26} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.profileRow}>
          <View style={styles.leftProfile}>
            <View style={styles.avatarWrapper}>
              <View style={styles.avatarCircle}>
                <MaterialCommunityIcons name="account" size={36} color="#fff" />
              </View>
            </View>

            <View style={styles.nameAndRating}>
              <Text style={styles.userName}>{user?.nome ?? "Usuário"}</Text>

              <View style={styles.ratingRow}>
                {Array.from({ length: 5 }).map((_, i) => {
                  const index = i + 1;
                  return (
                    <MaterialCommunityIcons
                      key={i}
                      name={index <= rating ? "star" : "star-outline"}
                      size={18}
                      color="#FFD700"
                      style={{ marginRight: 4 }}
                    />
                  );
                })}
                <Text style={styles.ratingText}>{rating.toFixed(1)} / 5</Text>
              </View>

              <Text style={styles.productCountText}>{productsCount} produtos anunciados</Text>
            </View>
          </View>

          <View style={styles.followersBox}>
            <Text style={styles.followersNumber}>{followers}</Text>
            <Text style={styles.followersLabel}>Seguidores</Text>
          </View>
        </View>
      </View>

      {/* Conteúdo */}
      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Informações</Text>
          <Text style={styles.cardText}>E-mail: {user?.email ?? "-"}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Estatísticas</Text>
          <Text style={styles.cardText}>Produtos anunciados: {productsCount}</Text>
          <Text style={styles.cardText}>Vendas: 0</Text>
        </View>

        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() =>
            Alert.alert("Sair", "Deseja sair da conta?", [
              { text: "Cancelar", style: "cancel" },
              { text: "Sair", onPress: handleLogout },
            ])
          }
        >
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* --- estilos: mantive os mesmos do layout anterior --- */
const TOP_RECT_HEIGHT = Math.round(SCREEN_HEIGHT * 0.40);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F2F2F2" },
  topRectangle: {
    width: "100%",
    height: TOP_RECT_HEIGHT,
    backgroundColor: "#808080ff",
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 14,
    justifyContent: "flex-start",
  },
  topRow: { flexDirection: "row", alignItems: "center", marginBottom: 18 },
  searchBar: {
    flex: 1,
    height: 42,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.22)",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  searchPlaceholder: { color: "#fff", fontSize: 14, opacity: 0.95 },
  menuButton: {
    width: 44,
    height: 44,
    borderRadius: 10,
    marginLeft: 12,
    backgroundColor: "rgba(255,255,255,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },
  profileRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", flex: 1 },
  leftProfile: { flexDirection: "row", alignItems: "center", flex: 1 },
  avatarWrapper: { marginRight: 12 },
  avatarCircle: {
    width: 86,
    height: 86,
    borderRadius: 86 / 2,
    backgroundColor: "#333333",
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },
  nameAndRating: { flexDirection: "column", justifyContent: "center" },
  userName: { color: "#fff", fontSize: 20, fontWeight: "800", marginBottom: 6 },
  ratingRow: { flexDirection: "row", alignItems: "center" },
  ratingText: { color: "#fff", marginLeft: 8, fontSize: 12, opacity: 0.95 },
  productCountText: { color: "#fff", marginTop: 6, opacity: 0.95 },
  followersBox: { width: 90, alignItems: "center", justifyContent: "center", paddingVertical: 6 },
  followersNumber: { color: "#fff", fontSize: 22, fontWeight: "800" },
  followersLabel: { color: "#fff", fontSize: 12, opacity: 0.95 },
  content: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
  card: { width: "100%", backgroundColor: "#fff", borderRadius: 12, padding: 14, marginBottom: 12, elevation: 2 },
  cardTitle: { fontWeight: "700", marginBottom: 8, fontSize: 16 },
  cardText: { color: "#333", marginBottom: 6 },
  logoutBtn: { marginTop: 6, backgroundColor: "#EA3F24", paddingVertical: 12, borderRadius: 10, alignItems: "center" },
  logoutText: { color: "#fff", fontWeight: "700" },
});
