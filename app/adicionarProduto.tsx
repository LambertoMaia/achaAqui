// adicionarProduto.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, Image, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { TextInput } from "react-native-paper";

type Product = {
  image: string | null;
  name: string;
  category: string;
  price: string;
};

const STORAGE_KEY_USER = "@my_app_user_v1";
const STORAGE_KEY_PRODUCTS_PREFIX = "@my_app_products_v1:"; // per-user
const STORAGE_KEY_GLOBAL = "@my_app_products_v1"; // global list (legacy)

export default function AdicionarProduto() {
  const router = useRouter();

  const [image, setImage] = useState<string | null>(null);
  const [productName, setProductName] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [price, setPrice] = useState<string>("");

  const [loading, setLoading] = useState(false);

  // solicitar permissão para iOS (Android já lida internamente)
  useEffect(() => {
    (async () => {
      if (Platform.OS !== "web") {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Permissão necessária", "Preciso de acesso às suas fotos para você escolher a imagem do produto.");
        }
      }
    })();
  }, []);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
      }
    } catch (err) {
      console.warn("Erro ao abrir image picker:", err);
      Alert.alert("Erro", "Não foi possível selecionar a imagem.");
    }
  };

  const canPublish =
    !!image && productName.trim().length > 0 && category.trim().length > 0 && price.trim().length > 0;

  // helpers storage
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

  const writeUserProducts = async (email: string, list: Product[]) => {
    try {
      await AsyncStorage.setItem(`${STORAGE_KEY_PRODUCTS_PREFIX}${email}`, JSON.stringify(list));
    } catch (e) {
      console.warn("Erro ao gravar produtos do usuário:", e);
      throw e;
    }
  };

  const readGlobalProducts = async (): Promise<Product[]> => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY_GLOBAL);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.warn("Erro ao ler global products:", e);
      return [];
    }
  };

  const writeGlobalProducts = async (list: Product[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY_GLOBAL, JSON.stringify(list));
    } catch (e) {
      console.warn("Erro ao gravar global products:", e);
      throw e;
    }
  };

  // salvar produto (usuário + opcional global)
  const handlePublish = async () => {
    if (!canPublish) {
      Alert.alert("Campos faltando", "Preencha todos os campos obrigatórios antes de anunciar.");
      return;
    }

    setLoading(true);
    try {
      const user = await readUser();
      const email = user?.email ? String(user.email).toLowerCase() : null;

      if (!email) {
        Alert.alert("Atenção", "Você precisa entrar na sua conta para anunciar. Deseja entrar agora?", [
          { text: "Cancelar", style: "cancel" },
          { text: "Entrar", onPress: () => router.push("/loginVend") },
        ]);
        setLoading(false);
        return;
      }

      const newProduct: Product = {
        image,
        name: productName.trim(),
        category: category.trim(),
        price: price.trim(),
      };

      // --- salvar na lista do usuário ---
      const userProducts = await readUserProducts(email);
      const existsUser = userProducts.some(
        (p) => p.name === newProduct.name && p.price === newProduct.price && p.image === newProduct.image
      );

      let nextUserProducts = userProducts;
      if (!existsUser) {
        nextUserProducts = [newProduct, ...userProducts];
        await writeUserProducts(email, nextUserProducts);
      } else {
        console.log("Produto já existe na lista do usuário, não duplicando.");
      }

      // --- salvar também no global (opcionalmente) ---
      const globalProducts = await readGlobalProducts();
      const existsGlobal = globalProducts.some(
        (p) => p.name === newProduct.name && p.price === newProduct.price && p.image === newProduct.image
      );

      let nextGlobal = globalProducts;
      if (!existsGlobal) {
        nextGlobal = [newProduct, ...globalProducts];
        await writeGlobalProducts(nextGlobal);
      } else {
        console.log("Produto já existe na lista global, não duplicando.");
      }

      Alert.alert("Publicado", "Seu produto foi anunciado com sucesso!", [
        {
          text: "OK",
          onPress: () => {
            // voltar para Anunciar (ela vai recarregar da storage)
            router.replace("/anunciar");
          },
        },
      ]);
    } catch (err) {
      console.warn("Erro ao publicar produto:", err);
      Alert.alert("Erro", "Não foi possível publicar o produto. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header back */}
      <TouchableOpacity style={[styles.box, styles.row]} onPress={() => router.push("/anunciar")}>
        <Image source={require("./assets/icons/voltar_laranja.png")} style={styles.icon} />
        <Text style={styles.text}>Adicionar produto</Text>
      </TouchableOpacity>

      {/* Imagem */}
      <View style={[styles.box, styles.largeBox]}>
        <TouchableOpacity style={styles.dashedBox} onPress={pickImage}>
          {image ? <Image source={{ uri: image }} style={styles.preview} /> : <Text style={styles.addPhotoText}>Adicionar foto</Text>}
        </TouchableOpacity>
      </View>

      {/* Nome */}
      <View style={styles.box}>
        <Text style={styles.label}>
          Nome do Produto <Text style={{ color: "red" }}>*</Text>
        </Text>
        <TextInput
          mode="flat"
          placeholder="Adicionar nome do produto"
          value={productName}
          onChangeText={setProductName}
          style={styles.input}
          underlineColor="transparent"
          activeUnderlineColor="transparent"
        />
      </View>

      {/* Categoria / Preço / Descrição placeholder */}
      <View style={[styles.box, styles.largeBox]}>
        <View style={styles.row}>
          <Image source={require("./assets/icons/iconCateg.png")} style={styles.smallIcon} />
          <Text style={styles.columnText}>
            Categoria <Text style={{ color: "red" }}>*</Text>
          </Text>
          <TextInput mode="flat" placeholder="Adicionar categoria" value={category} onChangeText={setCategory} style={styles.inputInline} underlineColor="transparent" activeUnderlineColor="transparent" />
        </View>

        <View style={styles.row}>
          <Image source={require("./assets/icons/preco.png")} style={styles.smallIcon} />
          <Text style={styles.columnText}>
            Preço <Text style={{ color: "red" }}>*</Text>
          </Text>
          <TextInput mode="flat" placeholder="Adicionar preço" value={price} onChangeText={setPrice} keyboardType="numeric" style={styles.inputInline} underlineColor="transparent" activeUnderlineColor="transparent" />
        </View>

        <View style={styles.row}>
          <Image source={require("./assets/icons/descricao.png")} style={styles.smallIcon} />
          <Text style={styles.columnText}>Descrição</Text>
        </View>
      </View>

      {/* Botões */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.saveButton} onPress={() => Alert.alert("Salvo", "Rascunho salvo!")}>
          <Text style={styles.saveText}>Salvar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.publishButton, !canPublish ? { opacity: 0.5 } : undefined]} disabled={!canPublish || loading} onPress={handlePublish}>
          <Text style={styles.publishText}>{loading ? "Publicando..." : "Anunciar"}</Text>
        </TouchableOpacity>
      </View>

      {!canPublish && <Text style={styles.helpText}>Preencha todos os campos obrigatórios (*) para poder anunciar.</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F2",
    alignItems: "center",
    paddingVertical: 5,
  },
  box: {
    width: "97%",
    height: 80,
    backgroundColor: "#fff",
    marginVertical: 4,
    justifyContent: "center",
    paddingHorizontal: 15,
  },
  largeBox: {
    height: 160,
    justifyContent: "space-around",
    paddingVertical: 10,
    width: "97%",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginVertical: 5,
  },
  icon: {
    width: 50,
    height: 50,
    marginRight: 10,
  },
  text: {
    fontSize: 18,
    color: "#000000ff",
    fontWeight: "500",
  },
  dashedBox: {
    width: "40%",
    height: "80%",
    borderWidth: 2,
    borderRadius: 10,
    borderStyle: "dashed",
    borderColor: "#EA3F24",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF",
  },
  addPhotoText: {
    color: "#EA3F24",
    fontSize: 16,
    fontWeight: "500",
  },
  preview: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 5,
    color: "#333",
  },
  input: {
    height: 40,
    backgroundColor: "transparent",
    paddingHorizontal: 0,
    fontSize: 16,
    borderWidth: 0,
  },
  inputInline: {
    flex: 1,
    height: 35,
    backgroundColor: "transparent",
    paddingHorizontal: 5,
    fontSize: 16,
    marginLeft: 10,
    borderWidth: 0,
  },
  smallIcon: {
    width: 25,
    height: 25,
    marginRight: 10,
    resizeMode: "contain",
  },
  columnText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginRight: 10,
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "97%",
    marginTop: 10,
  },
  saveButton: {
    flex: 1,
    borderWidth: 2,
    borderColor: "#EA3F24",
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingVertical: 12,
    marginRight: 8,
    alignItems: "center",
  },
  saveText: {
    color: "#EA3F24",
    fontSize: 16,
    fontWeight: "600",
  },
  publishButton: {
    flex: 1,
    backgroundColor: "#EA3F24",
    borderRadius: 10,
    paddingVertical: 12,
    marginLeft: 8,
    alignItems: "center",
  },
  publishText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  helpText: {
    marginTop: 8,
    color: "#666",
    fontSize: 14,
  },
});
