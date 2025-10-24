// adicionarProduto.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, Image, Modal, Platform, TextInput as RNTextInput, ScrollView, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import { Button, Portal, TextInput } from "react-native-paper";
import apiRequest from "./services/apiService";

type Product = {
  image: string | null;
  name: string;
  category: string;
  price: string;
  description?: string;
  store?: string;
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
  const [description, setDescription] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Array<{id: number, name: string}>>([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  
  const [stores, setStores] = useState<Array<{id: number, name: string, image: string}>>([]);
  const [showStoreModal, setShowStoreModal] = useState(false);
  const [loadingStores, setLoadingStores] = useState(true);
  const [selectedStore, setSelectedStore] = useState<string>("");
  const [failedImages, setFailedImages] = useState<Set<number>>(new Set());


  const fallbackCategories = [
    { id: 1, name: "Eletrônicos" },
    { id: 2, name: "Roupas" },
    { id: 3, name: "Casa e Jardim" },
    { id: 4, name: "Esportes" },
    { id: 5, name: "Livros" },
    { id: 6, name: "Automóveis" },
    { id: 7, name: "Beleza" },
    { id: 8, name: "Alimentação" },
    { id: 9, name: "Brinquedos" },
    { id: 10, name: "Outros" }
  ];


  const fallbackStores = [
    { id: 1, name: "Carrefour", image: "" },
    { id: 2, name: "Extra", image: "" },
    { id: 3, name: "Pão de Açúcar", image: "" },
    { id: 4, name: "Walmart", image: "" },
    { id: 5, name: "Assaí", image: "" }
  ];

  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      console.log("🔍 Starting to fetch categories from API...");
      try {
        const response = await apiRequest("GET", {}, "api/categories");
        
        if (response.success && response.data && response.data.data && Array.isArray(response.data.data)) {
          console.log("✅ Using API categories:", response.data.data.length, "items");
          const apiCategories = response.data.data.map((cat: any) => ({
            id: cat.id,
            name: cat.nome
          }));
          setCategories(apiCategories);
        } else {
          setCategories(fallbackCategories);
        }
      } catch (error) {
        setCategories(fallbackCategories);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchStores = async () => {
      setLoadingStores(true);
      try {
        const response = await apiRequest("GET", {}, "api/stores");
        
        if (response.success && response.data && response.data.data && Array.isArray(response.data.data)) {
          const apiStores = response.data.data.map((store: any) => ({
            id: store.id,
            name: store.nome,
            image: store.imagem || ""
          }));
          setStores(apiStores);
        } else {
          setStores(fallbackStores);
        }
      } catch (error) {
        // Use fallback stores on error
        setStores(fallbackStores);
      } finally {
        setLoadingStores(false);
        console.log("🏁 Stores loading finished");
      }
    };

    fetchStores();
  }, []);

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

  const handlePriceChange = (text: string) => {
    const numericValue = text.replace(/\D/g, '');
    
    if (numericValue === '') {
      setPrice('');
      return;
    }
    
    const number = parseInt(numericValue, 10);
    const formattedPrice = (number / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    
    setPrice(formattedPrice);
  };

  const canPublish =
    !!image && productName.trim().length > 0 && category.trim().length > 0 && price.trim().length > 0 && selectedStore.trim().length > 0;

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

      const numericPrice = price.replace(/\D/g, '');
      const priceInCents = numericPrice ? (parseInt(numericPrice, 10) / 100).toFixed(2) : '0.00';

      const newProduct: Product = {
        image,
        name: productName.trim(),
        category: category.trim(),
        price: priceInCents,
        description: description.trim(),
        store: selectedStore.trim(),
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

      <View style={[styles.box, styles.largeBox]}>
        <View style={styles.row}>
          <Image source={require("./assets/icons/iconCateg.png")} style={styles.smallIcon} />
          <Text style={styles.columnText}>
            Categoria <Text style={{ color: "red" }}>*</Text>
          </Text>
          <TouchableOpacity 
            style={[styles.inputInline, { justifyContent: "center" }]} 
            onPress={() => setShowCategoryModal(true)}
          >
            <Text style={{ color: category ? "#000" : "#888" }}>
              {category || "Selecione uma categoria"}
            </Text>
          </TouchableOpacity>
          
          <Portal>
            <Modal
              visible={showCategoryModal}
              transparent={true}
              animationType="fade"
              onRequestClose={() => setShowCategoryModal(false)}
            >
              <View style={styles.modalOverlay}>
                <TouchableWithoutFeedback onPress={() => setShowCategoryModal(false)}>
                  <View style={styles.modalBackdrop} />
                </TouchableWithoutFeedback>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Selecione uma categoria</Text>
                  <ScrollView 
                    style={styles.categoriesList}
                    showsVerticalScrollIndicator={true}
                    bounces={false}
                    contentContainerStyle={styles.categoriesContainer}
                  >
                    {loadingCategories ? (
                      <View style={styles.loadingState}>
                        <Text style={styles.loadingText}>Carregando categorias...</Text>
                      </View>
                    ) : categories.length > 0 ? (
                      <>
                        {categories.map((cat) => (
                          <TouchableOpacity
                            key={cat.id}
                            style={[
                              styles.categoryItem,
                              category === cat.name && styles.selectedCategoryItem
                            ]}
                            onPress={() => {
                              setCategory(cat.name);
                              setShowCategoryModal(false);
                            }}
                          >
                            <Text style={[
                              styles.categoryText,
                              category === cat.name && styles.selectedCategoryText
                            ]}>
                              {cat.name}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </>
                    ) : (
                      <View style={styles.emptyState}>
                        <Text style={styles.emptyStateText}>
                          Nenhuma categoria disponível
                        </Text>
                      </View>
                    )}
                  </ScrollView>
                  <Button 
                    mode="contained" 
                    onPress={() => setShowCategoryModal(false)}
                    style={styles.cancelButton}
                    labelStyle={styles.cancelButtonText}
                  >
                    Cancelar
                  </Button>
                </View>
              </View>
            </Modal>
          </Portal>
        </View>

        <View style={styles.row}>
          <Image source={require("./assets/icons/preco.png")} style={styles.smallIcon} />
          <Text style={styles.columnText}>
            Preço <Text style={{ color: "red" }}>*</Text>
          </Text>
          <RNTextInput 
            placeholder="R$ 0,00" 
            value={price} 
            onChangeText={handlePriceChange} 
            keyboardType="decimal-pad" 
            style={[styles.inputInline, styles.priceInput]} 
            returnKeyType="done"
            selectTextOnFocus={true}
            autoCorrect={false}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.row}>
          <Image source={require("./assets/icons/descricao.png")} style={styles.smallIcon} />
          <Text style={styles.columnText}>Descrição</Text>
          <TextInput 
            mode="flat" 
            placeholder="Adicionar descrição" 
            value={description}
            onChangeText={setDescription}
            style={styles.inputInline} 
            underlineColor="transparent" 
            activeUnderlineColor="transparent" 
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.row}>
          <Image source={require("./assets/icons/iconCateg.png")} style={styles.smallIcon} />
          <Text style={styles.columnText}>
            Loja <Text style={{ color: "red" }}>*</Text>
          </Text>
          <TouchableOpacity 
            style={[styles.inputInline, { justifyContent: "center" }]} 
            onPress={() => setShowStoreModal(true)}
          >
            <Text style={{ color: selectedStore ? "#000" : "#888" }}>
              {selectedStore || "Selecione uma loja"}
            </Text>
          </TouchableOpacity>
          
          <Portal>
            <Modal
              visible={showStoreModal}
              transparent={true}
              animationType="fade"
              onRequestClose={() => setShowStoreModal(false)}
            >
              <View style={styles.modalOverlay}>
                <TouchableWithoutFeedback onPress={() => setShowStoreModal(false)}>
                  <View style={styles.modalBackdrop} />
                </TouchableWithoutFeedback>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Selecionar Loja</Text>
                  <ScrollView 
                    style={styles.categoriesList}
                    showsVerticalScrollIndicator={true}
                    bounces={false}
                    contentContainerStyle={styles.categoriesContainer}
                  >
                    {loadingStores ? (
                      <View style={styles.loadingState}>
                        <Text style={styles.loadingText}>Carregando lojas...</Text>
                      </View>
                    ) : stores.length > 0 ? (
                      <>
                        {stores.map((store) => (
                          <TouchableOpacity
                            key={store.id}
                            style={[
                              styles.categoryItem,
                              selectedStore === store.name && styles.selectedCategoryItem
                            ]}
                            onPress={() => {
                              setSelectedStore(store.name);
                              setShowStoreModal(false);
                            }}
                          >
                            <View style={styles.storeItem}>
                              {store.image && !failedImages.has(store.id) ? (
                                <Image 
                                  source={{ uri: store.image }} 
                                  style={styles.storeImage}
                                  resizeMode="contain"
                                  onError={() => {
                                    console.log("Image failed to load for store:", store.name, "URL:", store.image);
                                    setFailedImages(prev => new Set([...prev, store.id]));
                                  }}
                                />
                              ) : (
                                <View style={styles.storeImagePlaceholder}>
                                  <Text style={styles.storeImageText}>{store.name.charAt(0)}</Text>
                                </View>
                              )}
                              <Text style={[
                                styles.categoryText,
                                selectedStore === store.name && styles.selectedCategoryText
                              ]}>
                                {store.name}
                              </Text>
                            </View>
                          </TouchableOpacity>
                        ))}
                      </>
                    ) : (
                      <View style={styles.emptyState}>
                        <Text style={styles.emptyStateText}>
                          Nenhuma loja disponível
                        </Text>
                      </View>
                    )}
                  </ScrollView>
                  <Button 
                    mode="contained" 
                    onPress={() => setShowStoreModal(false)}
                    style={styles.cancelButton}
                    labelStyle={styles.cancelButtonText}
                  >
                    Cancelar
                  </Button>
                </View>
              </View>
            </Modal>
          </Portal>
        </View>
      </View>

      {/* Buttons */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity 
          style={styles.saveButton} 
          onPress={() => router.push("/anunciar")}
        >
          <Text style={styles.saveText}>Salvar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.publishButton, !canPublish && styles.disabledButton]} 
          onPress={handlePublish}
          disabled={!canPublish || loading}
        >
          <Text style={styles.publishText}>
            {loading ? "Publicando..." : "Publicar"}
          </Text>
        </TouchableOpacity>
      </View>

      {!canPublish && (
        <Text style={styles.helpText}>
          * Preencha todos os campos obrigatórios para publicar
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f2f2",
    padding: 15,
  },
  box: {
    width: "97%",
    height: 80,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginVertical: 5,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  largeBox: {
    height: 'auto',
    padding: 15,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  icon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  smallIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  text: {
    fontSize: 18,
    fontWeight: '600',
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
    height: 40,
    paddingHorizontal: 10,
  },
  inputInline: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
    height: 40,
    paddingHorizontal: 10,
    marginLeft: 10,
    justifyContent: 'center',
  },
  priceInput: {
    fontSize: 16,
    color: '#333',
    textAlign: 'left',
  },
  columnText: {
    fontSize: 14,
    color: '#666',
    width: 100,
  },
  dashedBox: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#999',
    borderRadius: 8,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  addPhotoText: {
    color: '#999',
    fontSize: 14,
  },
  preview: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  modalContent: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 12,
    padding: 20,
    maxHeight: '70%',
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  categoriesList: {
    maxHeight: 300,
    marginBottom: 20,
  },
  categoriesContainer: {
    paddingVertical: 5,
  },
  categoryItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fafafa',
    marginBottom: 2,
    borderRadius: 8,
    minHeight: 50,
    justifyContent: 'center',
  },
  selectedCategoryItem: {
    backgroundColor: '#EA3F24',
    borderBottomColor: '#EA3F24',
  },
  categoryText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  selectedCategoryText: {
    color: '#fff',
    fontWeight: '600',
  },
  loadingState: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  cancelButton: {
    marginTop: 10,
    backgroundColor: '#E53935',
    borderRadius: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '97%',
    marginTop: 20,
    paddingHorizontal: 15,
  },
  saveButton: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#EA3F24',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 12,
    marginRight: 8,
    alignItems: 'center',
  },
  saveText: {
    color: '#EA3F24',
    fontSize: 16,
    fontWeight: '600',
  },
  publishButton: {
    flex: 1,
    backgroundColor: '#EA3F24',
    borderRadius: 10,
    paddingVertical: 12,
    marginLeft: 8,
    alignItems: 'center',
  },
  publishText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  helpText: {
    marginTop: 8,
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 15,
  },
  storeItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  storeImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  storeImagePlaceholder: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
    backgroundColor: '#EA3F24',
    justifyContent: 'center',
    alignItems: 'center',
  },
  storeImageText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
