
import { Link } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";
import ImagemApp from './assets/imagem.png';
import { globalStyles } from "./styles/globalStyles";

export default function Index() {
  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.title}>O que você deseja?</Text>

      <Link href="/loginUser" asChild>
      <TouchableOpacity style={globalStyles.button}>
        <Text style={globalStyles.buttonText}> Buscar produtos</Text>
      </TouchableOpacity>
      </Link>

      <Text style={{ marginVertical: 10 }}>ou</Text>

      <Link href="/loginVend" asChild>
      <TouchableOpacity style={globalStyles.button2}>
        <Text style={globalStyles.buttonText2}>Anunciar produtos</Text>
      </TouchableOpacity>
      </Link>

       <Image 
        source={ImagemApp} 
        style={globalStyles.logo} 
      />
      
    </View>
  );
}

