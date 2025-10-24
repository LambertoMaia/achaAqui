// Produtos.tsx (com remoção por long-press — dev tool)
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { TextInput } from "react-native-paper";
import apiRequest from "./services/apiService";
const { width: SCREEN_WIDTH } = Dimensions.get("window");

// chaves
const STORAGE_KEY_GLOBAL = "@my_app_products_v1";
const STORAGE_KEY_USER = "@my_app_user_v1";
const STORAGE_KEY_PRODUCTS_PREFIX = "@my_app_products_v1:";

type Product = {
  image: string | null;
  name: string;
  category: string;
  price: string;
  description?: string;
  store?: string;
};

const CARD_MARGIN = 8;
const CONTENT_WIDTH = SCREEN_WIDTH * 0.97;
const CARD_WIDTH = (CONTENT_WIDTH - CARD_MARGIN * 6) / 2;

export default function Produtos() {
  const [searchQuery, setSearchQuery] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const translateX = useRef(new Animated.Value(SCREEN_WIDTH)).current;
  const router = useRouter();

  // carrega listas (global + listas por usuário) e mescla sem duplicatas
  const loadProducts = async () => {
    try {
      let globalList: Product[] = [];
      const storedGlobal = await AsyncStorage.getItem(STORAGE_KEY_GLOBAL);
      if (storedGlobal) {
        try {
          const parsed = JSON.parse(storedGlobal);
          if (Array.isArray(parsed)) globalList = parsed;
        } catch (e) {
          console.warn("Erro parse global products:", e);
        }
      }

      let userList: Product[] = [];
      try {
        const rawUser = await AsyncStorage.getItem(STORAGE_KEY_USER);
        const user = rawUser ? JSON.parse(rawUser) : null;
        const email = user?.email ? String(user.email).toLowerCase() : null;
        if (email) {
          const rawUserProducts = await AsyncStorage.getItem(`${STORAGE_KEY_PRODUCTS_PREFIX}${email}`);
          if (rawUserProducts) {
            const parsedUser = JSON.parse(rawUserProducts);
            if (Array.isArray(parsedUser)) userList = parsedUser;
          }
        }
      } catch (e) {
        console.warn("Erro ao carregar produtos do usuário:", e);
      }

      const merged: Product[] = [];
      const seen = new Set<string>();
      const pushIfNew = (p: Product) => {
        const key = `${p.name}__${p.price}__${p.image ?? ""}`;
        if (!seen.has(key)) {
          seen.add(key);
          merged.push(p);
        }
      };

      // Prioridade: produtos do usuário primeiro (para aparecerem no topo), depois global
      userList.forEach(pushIfNew);
      globalList.forEach(pushIfNew);

      setProducts(merged);
    } catch (err) {
      console.warn("Erro ao carregar produtos:", err);
      setProducts([]);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProducts();
    }, [])
  );

  const openMenu = () => setModalVisible(true);
  const closeMenu = () => {
    Animated.timing(translateX, {
      toValue: SCREEN_WIDTH,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
      translateX.setValue(SCREEN_WIDTH);
    });
  };

  useEffect(() => {
    if (modalVisible) {
      Animated.timing(translateX, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [modalVisible]);

  const filteredProducts = products.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  // util: compara produtos (mesma chave que você já usa)
  const sameProduct = (a: Product, b: Product) => {
    return a.name === b.name && a.price === b.price && (a.image ?? "") === (b.image ?? "");
  };

  // remove produto da lista global
  const removeFromGlobal = async (target: Product): Promise<boolean> => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY_GLOBAL);
      if (!raw) return false;
      const list: Product[] = JSON.parse(raw);
      const next = list.filter((p) => !sameProduct(p, target));
      if (next.length === list.length) return false; // nada removido
      await AsyncStorage.setItem(STORAGE_KEY_GLOBAL, JSON.stringify(next));
      return true;
    } catch (e) {
      console.warn("Erro ao remover global:", e);
      return false;
    }
  };

  // remove produto de todas as listas de usuário (keys que começam com prefix)
  const removeFromAllUserLists = async (target: Product): Promise<number> => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const userKeys = keys.filter((k) => k.startsWith(STORAGE_KEY_PRODUCTS_PREFIX));
      let removedCount = 0;
      for (const k of userKeys) {
        try {
          const raw = await AsyncStorage.getItem(k);
          if (!raw) continue;
          const arr: Product[] = JSON.parse(raw);
          if (!Array.isArray(arr)) continue;
          const next = arr.filter((p) => !sameProduct(p, target));
          if (next.length !== arr.length) {
            removedCount++;
            if (next.length === 0) {
              await AsyncStorage.removeItem(k);
            } else {
              await AsyncStorage.setItem(k, JSON.stringify(next));
            }
          }
        } catch (e) {
          // ignora parse errors
        }
      }
      return removedCount;
    } catch (e) {
      console.warn("Erro ao varrer user lists:", e);
      return 0;
    }
  };

  // ação de remoção — tenta remover global e de todas as listas de usuário
  const handleRemoveProductDev = async (product: Product) => {
    Alert.alert(
      "Remover produto",
      `Você quer remover "${product.name}"?\nEscolha onde remover:`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Remover apenas do global",
          onPress: async () => {
            const ok = await removeFromGlobal(product);
            if (ok) {
              Alert.alert("Removido", "Produto removido da lista global.");
              loadProducts();
            } else {
              Alert.alert("Não encontrado", "Produto não estava na lista global.");
            }
          },
        },
        {
          text: "Remover de todas as listas",
          style: "destructive",
          onPress: async () => {
            const removedInUsers = await removeFromAllUserLists(product);
            const removedGlobal = await removeFromGlobal(product);
            let msg = "";
            if (removedGlobal) msg += "Removido da lista global.\n";
            msg += `Removido de ${removedInUsers} lista(s) de usuário.`;
            if (!removedGlobal && removedInUsers === 0) {
              Alert.alert("Não encontrado", "Produto não estava em global nem em listas de usuário.");
            } else {
              Alert.alert("Remoção concluída", msg.trim());
            }
            loadProducts();
          },
        },
      ],
      { cancelable: true }
    );
  };

  const renderCard = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.cardWrapper}
      onPress={() =>
        router.push({
          pathname: "/produtoDetalhe",
          params: { product: JSON.stringify(item) },
        })
      }
      onLongPress={() => handleRemoveProductDev(item)} // long-press para remover (dev)
    >
      <View style={styles.card}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.cardImage} />
        ) : (
          <View style={[styles.cardImage, styles.cardImagePlaceholder]}>
            <Text style={styles.cardImagePlaceholderText}>IMG</Text>
          </View>
        )}

        <View style={styles.cardTextWrap}>
          <Text numberOfLines={2} style={styles.cardName}>
            {item.name}
          </Text>

          <Text style={styles.cardPrice}>R$ {item.price}</Text>

          <Text numberOfLines={1} style={styles.cardCategory}>
            {item.category}
          </Text>

          {item.store && (
            <View style={styles.storeInfo}>
              <View style={styles.storeLogoContainer}>
                <Text style={styles.storeLogoText}>{item.store.charAt(0)}</Text>
              </View>
              <Text numberOfLines={1} style={styles.storeName}>
                {item.store}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#EA3F24", "#4E0000"]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 0, y: 0 }}
        style={styles.gradientBox}
      >
        <View style={styles.topRow}>
          <TextInput
            label="Buscar Produtos"
            value={searchQuery}
            onChangeText={setSearchQuery}
            mode="flat"
            left={<TextInput.Icon icon={() => <MaterialCommunityIcons name="magnify" size={22} />} />}
            style={styles.searchBar}
          />
          <TouchableOpacity style={styles.menuButton} onPress={openMenu}>
            <Image source={require("./assets/icons/menu.png")} style={styles.menuIcon} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

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

      <View style={styles.productsContainer}>
        {filteredProducts.length === 0 ? (
          <Text style={styles.noProductsText}>Nenhum produto encontrado</Text>
        ) : (
          <FlatList
            data={filteredProducts}
            renderItem={renderCard}
            keyExtractor={(_, i) => String(i)}
            numColumns={2}
            contentContainerStyle={styles.flatListContent}
            showsVerticalScrollIndicator={false}
            columnWrapperStyle={{ justifyContent: "space-between" }}
          />
        )}
      </View>

      <Modal visible={modalVisible} transparent animationType="none" onRequestClose={closeMenu}>
        <TouchableWithoutFeedback onPress={closeMenu}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>

        <Animated.View style={[styles.sideMenu, { transform: [{ translateX }] }]}>
          <View style={styles.menuHeader}>
            <Text style={styles.menuTitle}>Menu</Text>
            <TouchableOpacity onPress={closeMenu} style={styles.closeBtn}>
              <MaterialCommunityIcons name="close" size={26} />
            </TouchableOpacity>
          </View>

          <View style={styles.menuColumnContainer}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                closeMenu();
                router.push("/perfilVendedor");
              }}
            >
              <MaterialCommunityIcons name="account-circle" size={34} />
              <Text style={styles.menuItemText}>Meu Perfil</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                closeMenu();
                router.push("/home");
              }}
            >
              <MaterialCommunityIcons name="heart" size={34} />
              <Text style={styles.menuItemText}>Favoritos (WIP)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                closeMenu();
                router.push("/anunciar");
              }}
            >
              <MaterialCommunityIcons name="bullhorn" size={34} />
              <Text style={styles.menuItemText}>Anuncie Aqui</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuItem, { borderBottomWidth: 0 }]}
              onPress={async () => {
                closeMenu();
                try {
                  await apiRequest('GET', {}, 'api/users/exit');
                  await AsyncStorage.clear();
                  Alert.alert('Sucesso', 'Você se desconectou da sua conta');
                  router.replace('/');
                } catch (error) {
                  console.error('Erro ao sair:', error);
                  Alert.alert('Erro', 'Não foi possível sair da conta. Tente novamente.');
                }
              }}
            >
              <MaterialCommunityIcons name="exit-to-app" size={34} color="#ff4444" />
              <Text style={[styles.menuItemText, { color: '#ff4444' }]}>Sair</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Modal>
    </View>
  );
}

/* estilos */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  gradientBox: {
    height: "25%",
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    paddingHorizontal: 20,
    paddingTop: 40,
    justifyContent: "flex-start",
  },
  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  searchBar: { flex: 1, backgroundColor: "#fff", borderRadius: 25, height: 50, marginRight: 10 },
  menuButton: { width: 50, height: 50, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  menuIcon: { width: 25, height: 25, resizeMode: "contain" },
  squaresContainer: { flexDirection: "row", justifyContent: "space-around", marginTop: -25, marginBottom: 10, paddingHorizontal: 20 },
  square: { width: 110, height: 110, backgroundColor: "#fff", borderRadius: 20, alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOpacity: 0.1, shadowOffset: { width: 0, height: 2 }, shadowRadius: 5, elevation: 3, marginBottom: 20 },
  icon: { width: 35, height: 35, resizeMode: "contain", marginBottom: 8 },
  squareText: { fontSize: 14, fontWeight: "500", textAlign: "center" },
  productsContainer: { paddingHorizontal: 12, paddingBottom: 16, flex: 1 },
  noProductsText: { fontSize: 16, color: "#666", textAlign: "center", marginTop: 10 },
  flatListContent: { paddingBottom: 40, paddingHorizontal: CARD_MARGIN },
  cardWrapper: { flex: 1, padding: CARD_MARGIN / 2 },
  card: { width: CARD_WIDTH, backgroundColor: "#fff", borderRadius: 10, overflow: "hidden", elevation: 2 },
  cardImage: { width: "100%", height: 150, resizeMode: "cover" },
  cardImagePlaceholder: { backgroundColor: "#eee", justifyContent: "center", alignItems: "center" },
  cardImagePlaceholderText: { color: "#aaa", fontSize: 12 },
  cardTextWrap: { padding: 8, minHeight: 80 },
  cardName: { fontSize: 14, fontWeight: "700", color: "#222", marginBottom: 6 },
  cardPrice: { fontSize: 14, fontWeight: "800", color: "#EA3F24", marginBottom: 6 },
  cardCategory: { fontSize: 12, color: "#666", marginBottom: 6 },
  storeInfo: { 
    flexDirection: "row", 
    alignItems: "center", 
    marginTop: 4 
  },
  storeLogoContainer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#EA3F24",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 6,
  },
  storeLogoText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  storeName: {
    fontSize: 11,
    color: "#666",
    flex: 1,
  },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)" },
  sideMenu: { position: "absolute", right: 0, top: 0, height: "100%", width: SCREEN_WIDTH * 0.7, backgroundColor: "#fff", borderLeftWidth: 1, borderLeftColor: "#e6e6e6", paddingTop: 40, paddingHorizontal: 16, paddingBottom: 20 },
  menuHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  menuTitle: { fontSize: 20, fontWeight: "700" },
  closeBtn: { padding: 6 },
  menuColumnContainer: { flexDirection: "column", gap: 8, marginTop: 6 },
  menuItem: { flexDirection: "row", alignItems: "center", paddingVertical: 14, paddingHorizontal: 8, borderRadius: 10 },
  menuItemText: { marginLeft: 12, fontSize: 16, fontWeight: "600" },
});
