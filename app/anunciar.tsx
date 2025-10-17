// AnunciarProdutos.tsx (salvamento por usuário - versão robusta)
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Product = {
  image: string | null;
  name: string;
  category: string;
  price: string;
};

const STORAGE_KEY_USER = "@my_app_user_v1"; // onde está o user (nome/email)
const STORAGE_KEY_PRODUCTS_PREFIX = "@my_app_products_v1:"; // prefixo + email

export default function AnunciarProdutos() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const userProductsKey = userEmail ? `${STORAGE_KEY_PRODUCTS_PREFIX}${userEmail}` : null;

  // ---- Helpers ----
  const readUser = async (): Promise<{ nome?: string; email?: string } | null> => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY_USER);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.warn("Erro ao ler usuário:", e);
      return null;
    }
  };

  const readUserProducts = async (email: string): Promise<Product[]> => {
    try {
      const raw = await AsyncStorage.getItem(`${STORAGE_KEY_PRODUCTS_PREFIX}${email}`);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.warn("Erro ao ler produtos do usuário:", e);
      return [];
    }
  };

  const saveProducts = async (email: string, list: Product[]) => {
    try {
      await AsyncStorage.setItem(`${STORAGE_KEY_PRODUCTS_PREFIX}${email}`, JSON.stringify(list));
      console.log(`Produtos salvos em ${STORAGE_KEY_PRODUCTS_PREFIX}${email}`, list.length);
    } catch (e) {
      console.warn("Erro ao salvar produtos:", e);
    }
  };

  // ---- Carregamento inicial / foco ----
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const user = await readUser();
      const email = user?.email ? String(user.email).toLowerCase() : null;
      setUserEmail(email);

      if (!email) {
        console.warn("Nenhum usuário logado (anunciar).");
        setProducts([]);
        setLoading(false);
        return;
      }

      const userProd = await readUserProducts(email);
      setProducts(userProd);
    } catch (err) {
      console.warn("Erro ao carregar anunciar:", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  // ---- Recebe params de /adicionarProduto ----
  useEffect(() => {
    const maybeImage = params?.image ? String(params.image) : null;
    const maybeName = params?.name ? String(params.name) : "";
    const maybeCategory = params?.category ? String(params.category) : "";
    const maybePrice = params?.price ? String(params.price) : "";

    if (maybeName.length === 0) return; // nada a fazer
    if (!userEmail) {
      // ainda não sabemos o usuário — aguardar load() (efeito tem userEmail como dependência indiretamente)
      console.log("Recebeu params mas usuário não carregado ainda — ignorando por enquanto.");
      return;
    }

    const newProduct: Product = {
      image: maybeImage,
      name: maybeName,
      category: maybeCategory,
      price: maybePrice,
    };

    // evita duplicata básica
    const exists = products.some(
      (p) => p.name === newProduct.name && p.price === newProduct.price && p.image === newProduct.image
    );

    if (!exists) {
      const next = [newProduct, ...products];
      setProducts(next);
      // salva no storage do usuário
      saveProducts(userEmail, next);
      Alert.alert("Produto adicionado", `${newProduct.name} foi adicionado à sua lista.`);
    } else {
      console.log("Produto já existe para este usuário — não foi adicionado novamente.");
    }

    // limpa params substituindo rota atual (evita reprocessar se o usuário voltar)
    setTimeout(() => {
      router.replace("/anunciar");
    }, 50);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, userEmail, products]);

  // ---- remover produto ----
  const handleRemove = (index: number) => {
    if (!userEmail) {
      Alert.alert("Erro", "Nenhum usuário logado. Não é possível remover.");
      return;
    }
    const next = products.filter((_, i) => i !== index);
    setProducts(next);
    saveProducts(userEmail, next);
  };

  // ---- limpar todos ----
  const handleClearAll = () => {
    if (!userEmail) {
      Alert.alert("Nenhum usuário logado", "Faça login para gerenciar seus produtos.");
      return;
    }
    Alert.alert("Confirmar", "Deseja remover todos os produtos?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sim",
        onPress: async () => {
          setProducts([]);
          if (userProductsKey) await AsyncStorage.removeItem(userProductsKey);
          router.replace("/anunciar");
        },
        style: "destructive",
      },
    ]);
  };

  // ---- UI ----
  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#EA3F24" />
        <Text style={{ marginTop: 8 }}>Carregando seus anúncios...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Cabeçalho */}
      <TouchableOpacity style={styles.boxHeader} onPress={() => router.push("/home")}>
        <Image source={require("./assets/icons/voltar_laranja.png")} style={styles.icon} />
        <Text style={styles.textHeader}>Anunciar Produtos</Text>
      </TouchableOpacity>

      {/* Se não houver usuário logado, mostrar aviso com ação */}
      {!userEmail ? (
        <View style={[styles.box, styles.largeBox, { justifyContent: "center", alignItems: "center" }]}>
          <Text style={styles.emptyText}>Você não está logado.</Text>
          <Text style={styles.hintText}>Faça login ou cadastre-se para ver e gerenciar seus anúncios.</Text>
          <View style={{ flexDirection: "row", gap: 12, marginTop: 12 }}>
            <TouchableOpacity style={styles.addProductButton} onPress={() => router.push("/loginVend")}>
              <Text style={styles.addProductButtonText}>Entrar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.addProductButton, { backgroundColor: "#666" }]} onPress={() => router.push("/cadastroUser")}>
              <Text style={styles.addProductButtonText}>Cadastrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <>
          {/* Área de produtos */}
          <View style={[styles.box, styles.largeBox]}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={styles.sectionTitle}>Produtos adicionados</Text>
              <TouchableOpacity onPress={handleClearAll}>
                <Text style={{ color: "#EA3F24", fontWeight: "700" }}>Limpar tudo</Text>
              </TouchableOpacity>
            </View>

            {products.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Nenhum produto adicionado</Text>
                <Text style={styles.hintText}>
                  Quando você for adicionando os produtos, eles aparecerão aqui.
                </Text>
              </View>
            ) : (
              <ScrollView style={styles.productsList}>
                {products.map((p, idx) => (
                  <View key={idx.toString()} style={styles.productCard}>
                    {p.image ? (
                      <Image source={{ uri: p.image }} style={styles.cardImage} />
                    ) : (
                      <View style={[styles.cardImage, styles.cardImagePlaceholder]}>
                        <Text style={styles.cardImagePlaceholderText}>IMG</Text>
                      </View>
                    )}

                    <View style={styles.cardInfo}>
                      <Text style={styles.cardName}>{p.name}</Text>
                      <Text style={styles.cardCategory}>{p.category}</Text>
                    </View>

                    <Text style={styles.cardPrice}>R$ {p.price}</Text>

                    <TouchableOpacity onPress={() => handleRemove(idx)} style={{ padding: 8 }}>
                      <Text style={{ color: "#999" }}>Remover</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>

          {/* Botão adicionar */}
          <View style={styles.box}>
            <TouchableOpacity style={styles.addProductButton} onPress={() => router.push("/adicionarProduto")}>
              <Text style={styles.addProductButtonText}>Adicionar Produto</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

/* --- estilos (mantive os seus) --- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F2",
    alignItems: "center",
    paddingVertical: 8,
  },
  boxHeader: {
    width: "97%",
    height: 80,
    backgroundColor: "#fff",
    marginVertical: 6,
    justifyContent: "center",
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
  },
  box: {
    width: "97%",
    backgroundColor: "#fff",
    marginVertical: 6,
    padding: 10,
    borderRadius: 10,
  },
  largeBox: {
    height: 160,
  },
  icon: {
    width: 50,
    height: 50,
    marginRight: 10,
  },
  textHeader: {
    fontSize: 18,
    color: "#000000ff",
    fontWeight: "500",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 6,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  hintText: {
    fontSize: 13,
    color: "#777",
    marginTop: 6,
    textAlign: "center",
  },
  productsList: {
    width: "100%",
  },
  productCard: {
    width: "100%",
    height: 64,
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 8,
    padding: 8,
    flexDirection: "row",
    alignItems: "center",
    elevation: 1,
  },
  cardImage: {
    width: 48,
    height: 48,
    borderRadius: 6,
    marginRight: 10,
    resizeMode: "cover",
  },
  cardImagePlaceholder: {
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
  },
  cardImagePlaceholderText: {
    color: "#aaa",
    fontSize: 12,
  },
  cardInfo: {
    flex: 1,
  },
  cardName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#222",
  },
  cardCategory: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  cardPrice: {
    fontSize: 14,
    fontWeight: "700",
    color: "#EA3F24",
  },
  addProductButton: {
    backgroundColor: "#EA3F24",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  addProductButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
