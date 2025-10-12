import { StyleSheet } from "react-native";

export const globalStyles = StyleSheet.create({
  container: {
    flex:1,
    justifyContent:'center',
    alignItems:'center',
    backgroundColor:'#ffffffff',
  },
  title: {
    fontSize: 40,
    fontWeight:'bold',
    color:'#333',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#EA3F24',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    marginVertical: 5,
     width: 250,
  },
  button2: {
    backgroundColor: '#ffffffff',
    borderColor: '#EA3F24',
    borderWidth: 2,
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    marginVertical: 5,
     width: 250,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  buttonText2: {
    color: '#EA3F24',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
   logo: {
    width: 400,       // largura
    height: 400,      // altura
    resizeMode: 'contain', // mantém proporção
    marginBottom: 20, // distância do texto
  }
});
