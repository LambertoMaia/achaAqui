import { LinearGradient } from "expo-linear-gradient";
import { Link } from "expo-router";
import { Image, Text, TextInput, TouchableOpacity } from "react-native";
import IconeBuscar from "./assets/icons/Vector.png";
import { cadastroStyles } from "./styles/cadastro";

export default function CadastroUser() {
  return (
    <LinearGradient
      colors={["#4E0000","#EA3F24"]} // gradiente de baixo (vermelho) pra cima (branco)
      start={{ x: 0.5, y: 1 }}
      end={{ x: 0.5, y: 0 }}
      style={cadastroStyles.container}
    >
      
      <Image
      source={IconeBuscar}
      style={{ width: 80, height: 80, marginBottom: 50 }}
    />
      
      
      <TextInput style={cadastroStyles.input} placeholder="Nome" />
      <TextInput style={cadastroStyles.input} placeholder="CEP" />
      <TextInput style={cadastroStyles.input} placeholder="E-mail" />
      <TextInput style={cadastroStyles.input} placeholder="Senha" secureTextEntry />

      <Link href="/home" asChild>
      <TouchableOpacity style={cadastroStyles.button}>
        <Text style={cadastroStyles.buttonText}>Cadastrar</Text>
      </TouchableOpacity>
      </Link>
    </LinearGradient>
  );
}
