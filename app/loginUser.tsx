// LoginUser.tsx
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import IconeBuscar from "./assets/icons/Vector.png";
import apiRequest from "./services/apiService";
import { cadastroStyles } from "./styles/cadastro";
//import { login } from "./services/authService"; // ajuste o caminho se necessário
export default function LoginUser() {
  const router = useRouter();

  // Redirect
  const redir = async () => {
    const resp = await apiRequest("GET", {}, "api/users/last")

    if(resp.data.success) {
      console.log("🏠 Redirecting to home");
      console.log(resp)
      router.replace("/home")
      return
    }
  }

  redir()

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [touched, setTouched] = useState({ email: false, senha: false });
  const [loading, setLoading] = useState(false);

  const validateEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  const validateSenha = (value: string) => value.length >= 6;

  const isEmailValid = validateEmail(email);
  const isSenhaValid = validateSenha(senha);

  const canSubmit = isEmailValid && isSenhaValid && !loading;

  const showFieldError = (fieldTouched: boolean, valid: boolean) => fieldTouched && !valid;

  const handleSubmit = async () => {
    setTouched({ email: true, senha: true });

    if (!canSubmit) return;

    setLoading(true);
    
    const loginOperation = async () => {
      try {
      // tenta login via authService (backend primeiro, fallback local se configurado)
      const response = await apiRequest("POST", { email: email.trim().toLowerCase(), senha }, "api/users/login");

      console.log(response);
      if (!response.success) {
        Alert.alert("Error ao autenticar", response.data.message);
        setLoading(false);
        return;
      }

      Alert.alert("Login bem-sucedido", `Bem Vindo de Volta!`, [
        { text: "OK", onPress: () => router.replace("/home") },
      ]);

      //   // resp contém { token, user }
      //   Alert.alert("Login bem-sucedido", `Bem Vindo(a)!`, [
      //     { text: "OK", onPress: () => router.replace("/home") },
      //   ]);
      // } catch (err: any) {
      //   console.warn("login error:", err);
      //   Alert.alert("Erro ao autenticar", String(err.message ?? err));
      // } finally {
      //   setLoading(false);
      } catch (err: any) {
        console.warn("login error:", err);
        Alert.alert("Erro ao autenticar", String(err.message ?? err));
      } finally {
        setLoading(false);
      }
    }
    loginOperation();
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
        {/* E-mail */}
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
        {showFieldError(touched.email, isEmailValid) && (
          <Text style={localStyles.errorText}>E-mail inválido.</Text>
        )}

        {/* Senha */}
        <View style={localStyles.inputWrapper}>
          <MaterialIcons name="lock" size={20} color="#666" style={localStyles.inputIcon} />
          <TextInput
            placeholder="Senha"
            value={senha}
            onChangeText={setSenha}
            onBlur={() => setTouched((s) => ({ ...s, senha: true }))}
            secureTextEntry
            style={[cadastroStyles.input, localStyles.input]}
            placeholderTextColor="#666"
            editable={!loading}
          />
        </View>
        {showFieldError(touched.senha, isSenhaValid) && (
          <Text style={localStyles.errorText}>Senha muito curta.</Text>
        )}

        {/* Link para cadastro */}
        <TouchableOpacity onPress={() => router.push("/cadastroUser")} disabled={loading}>
          <Text style={localStyles.loginLink}>Não tem conta? | Cadastre-se</Text>
        </TouchableOpacity>

        {/* Botão login */}
        <TouchableOpacity
          style={[cadastroStyles.button, !canSubmit ? { opacity: 0.5 } : null]}
          disabled={!canSubmit}
          onPress={handleSubmit}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={cadastroStyles.buttonText}>Entrar</Text>
          )}
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
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 48,
    color: "#000",
    textAlignVertical: "center",
    paddingVertical: 0,
  },
  errorText: {
    color: "#ffccccff",
    marginBottom: 8,
    marginLeft: 6,
  },
  loginLink: {
    color: "#fff",
    fontSize: 12,
    marginVertical: 12,
    textAlign: "center",
    textDecorationLine: "underline",
  },
});
