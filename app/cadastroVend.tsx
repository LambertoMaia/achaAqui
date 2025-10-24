// CadastroVend.tsx
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import IconeBuscar from "./assets/icons/Vector.png";
import apiRequest from "./services/apiService";
import { cadastroStyles } from "./styles/cadastro";


export default function CadastroVend() {
  const router = useRouter();

  const [nome, setNome] = useState("");
  const [cep, setCep] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [consentLgpd, setConsentLgpd] = useState(false);

  const [touched, setTouched] = useState({
    nome: false,
    cep: false,
    email: false,
    senha: false,
  });

  const [loading, setLoading] = useState(false);

  const handleCepChange = (text: string) => {
    const digits = text.replace(/\D/g, "").slice(0, 8);
    if (digits.length > 5) setCep(digits.slice(0, 5) + "-" + digits.slice(5));
    else setCep(digits);
  };

  const validateEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  const validateCep = (value: string) => /^\d{5}-\d{3}$/.test(value);
  const validateSenha = (value: string) => value.length >= 6;
  const validateNome = (value: string) => value.trim().length > 1;

  const isNomeValid = validateNome(nome);
  const isCepValid = validateCep(cep);
  const isEmailValid = validateEmail(email);
  const isSenhaValid = validateSenha(senha);

  const canSubmit = isNomeValid && isCepValid && isEmailValid && isSenhaValid && consentLgpd && !loading;
  const showFieldError = (fieldTouched: boolean, valid: boolean) => fieldTouched && !valid;

  const lgpdText = useMemo(
    () =>
      "Ao cadastrar, você concorda com o tratamento de seus dados pessoais conforme a nossa Política de Privacidade (LGPD).",
    []
  );

  const handleSubmit = async () => {
    setTouched({ nome: true, cep: true, email: true, senha: true });

    if (!consentLgpd) {
      Alert.alert("Consentimento necessário", "Você precisa aceitar as regras de privacidade (LGPD) para continuar.");
      return;
    }

    if (!canSubmit) {
      Alert.alert("Formulário inválido", "Preencha corretamente todos os campos obrigatórios.");
      return;
    }

    // fecha teclado e inicia loading
    Keyboard.dismiss();
    setLoading(true);

    const cadastroVendOperation = async () => {
      try {
        const payload = {
          nome: nome.trim(),
          email: email.trim().toLowerCase(),
          senha,
          cep,
          vendedor: 1
        };

        console.log(payload);
        const response = await apiRequest("POST", payload, "api/users");
              
        if (!response.success) {
          Alert.alert("Erro no cadastro", response.message);
          return;
        }

        Alert.alert("Cadastro concluído", `Bem-vindo(a), ${payload.nome}!`, [
          {
            text: "OK",
            onPress: () => {
              //router.replace("/loginVend");
            },
          },
        ]);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    }
    cadastroVendOperation()
  };

  return (
    <LinearGradient
      colors={["#4E0000", "#EA3F24"]}
      start={{ x: 0.5, y: 1 }}
      end={{ x: 0.5, y: 0 }}
      style={cadastroStyles.container}
    >
      <Image source={IconeBuscar} style={{ width: 80, height: 80, marginBottom: 30 }} />

      <View style={{ width: "90%", alignSelf: "center", alignItems: "center" }}>
        {/* Nome */}
        <View style={localStyles.inputWrapper}>
          <MaterialIcons name="person" size={20} color="#666" style={localStyles.inputIcon} />
          <TextInput
            placeholder="Nome"
            value={nome}
            onChangeText={setNome}
            onBlur={() => setTouched((s) => ({ ...s, nome: true }))}
            style={[cadastroStyles.input, localStyles.input]}
            placeholderTextColor="#666"
            editable={!loading}
          />
        </View>
        {showFieldError(touched.nome, isNomeValid) && <Text style={localStyles.errorText}>Informe seu nome completo.</Text>}

        {/* CEP */}
        <View style={localStyles.inputWrapper}>
          <MaterialIcons name="location-on" size={20} color="#666" style={localStyles.inputIcon} />
          <TextInput
            placeholder="CEP"
            value={cep}
            onChangeText={handleCepChange}
            onBlur={() => setTouched((s) => ({ ...s, cep: true }))}
            keyboardType="numeric"
            style={[cadastroStyles.input, localStyles.input]}
            placeholderTextColor="#666"
            editable={!loading}
          />
        </View>
        {showFieldError(touched.cep, isCepValid) && <Text style={localStyles.errorText}>CEP inválido. Formato: 00000-000</Text>}

        {/* Email */}
        <View style={localStyles.inputWrapper}>
          <MaterialIcons name="email" size={20} color="#666" style={localStyles.inputIcon} />
          <TextInput
            placeholder="E-mail"
            value={email}
            onChangeText={setEmail}
            onBlur={() => setTouched((s) => ({ ...s, email: true }))}
            keyboardType="email-address"
            autoCapitalize="none"
            style={[cadastroStyles.input, localStyles.input]}
            placeholderTextColor="#666"
            editable={!loading}
          />
        </View>
        {showFieldError(touched.email, isEmailValid) && <Text style={localStyles.errorText}>E-mail inválido.</Text>}

        {/* Senha */}
        <View style={localStyles.inputWrapper}>
          <MaterialIcons name="lock" size={20} color="#666" style={localStyles.inputIcon} />
          <TextInput
            placeholder="Senha (mín. 6 caracteres)"
            value={senha}
            onChangeText={setSenha}
            onBlur={() => setTouched((s) => ({ ...s, senha: true }))}
            secureTextEntry
            style={[cadastroStyles.input, localStyles.input]}
            placeholderTextColor="#666"
            editable={!loading}
          />
        </View>
        {showFieldError(touched.senha, isSenhaValid) && <Text style={localStyles.errorText}>Senha muito curta.</Text>}

        {/* LGPD */}
        <TouchableOpacity activeOpacity={0.8} onPress={() => setConsentLgpd((v) => !v)} style={localStyles.consentRow}>
          <View style={[localStyles.checkbox, consentLgpd ? localStyles.checkboxChecked : null]}>
            {consentLgpd && <Text style={localStyles.checkboxTick}>✓</Text>}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={localStyles.lgpdTitle}>Autorizo o tratamento dos meus dados (LGPD)</Text>
            <Text style={localStyles.lgpdText} numberOfLines={3}>{lgpdText}</Text>
            <TouchableOpacity onPress={() => router.push("/cadastroVend")}>
              <Text style={localStyles.linkText}>Ler política de privacidade</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>

        {/* Botão cadastrar */}
        <TouchableOpacity
          style={[cadastroStyles.button, !canSubmit ? { opacity: 0.5 } : null]}
          disabled={!canSubmit}
          onPress={handleSubmit}
        >
          {loading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={cadastroStyles.buttonText}>Cadastrar</Text>}
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const localStyles = StyleSheet.create({
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, height: 40, textAlignVertical: "center", paddingVertical: 0, color: "#000" },
  errorText: { color: "#ff3333", marginBottom: 8, marginLeft: 6 },
  consentRow: { flexDirection: "row", alignItems: "flex-start", gap: 12, marginVertical: 10 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, borderColor: "#ddd", justifyContent: "center", alignItems: "center", backgroundColor: "#fff", marginTop: 2 },
  checkboxChecked: { borderColor: "#EA3F24", backgroundColor: "#EA3F24" },
  checkboxTick: { color: "#fff", fontWeight: "700" },
  lgpdTitle: { color: "#e4e4e4ff", fontSize: 12, fontWeight: "700", marginBottom: 4 },
  lgpdText: { color: "#d4d4d4ff", fontSize: 10, marginBottom: 4 },
  linkText: { color: "#EA3F24", textDecorationLine: "underline", fontSize: 12, marginTop: 2 },
});
