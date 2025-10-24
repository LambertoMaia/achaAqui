
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Path, Svg } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
}

interface Loja {
  nome: string;
  avaliacao: number;
  totalAvaliacoes: number;
  tempoResposta: number;
  produtos: number;
  logoColor: string;
  logoText: string;
  logoImagem: any;
}

const BackIcon: React.FC<IconProps> = ({ size = 20, color = '#E53935' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M15 18L9 12L15 6"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default function TelaDetalheLoja() {
  const loja: Loja = {
    nome: 'Assaí Atacadista',
    avaliacao: 4.7,
    totalAvaliacoes: 400,
    tempoResposta: 54,
    produtos: 1500,
    logoColor: '#1976D2',
    logoText: 'A',
    logoImagem: false,
  };

  return (
    <View style={styles.root}>
      <View style={styles.container}>
        <View style={styles.card}>
          <TouchableOpacity style={styles.backButton} onPress={() => console.log('Voltar')}>
            <BackIcon />
            <Text style={styles.backText}>Voltar para Perfil</Text>
          </TouchableOpacity>

          <View style={styles.identidade}>
            <View style={[styles.logo, { backgroundColor: loja.logoColor }]}>
              <Image source={loja.logoImagem} style={styles.logoImg} />
            </View>
            <Text style={styles.nome}>{loja.nome}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.label}>Avaliação</Text>
            <Text style={styles.value}>
              <Text style={styles.bold}>{loja.avaliacao}</Text> de 5{' '}
              <Text style={styles.sub}>({loja.totalAvaliacoes} avaliações)</Text>
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Tempo de Resposta</Text>
            <Text style={styles.value}>
              <Text style={styles.bold}>{loja.tempoResposta}%</Text>{' '}
              <Text style={styles.sub}>(Dentro de horas)</Text>
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Produtos</Text>
            <Text style={styles.value}>
              <Text style={styles.bold}>{loja.produtos}</Text>
            </Text>
          </View>

          <TouchableOpacity style={styles.ctaButton}>
            <Text style={styles.ctaText}>Ver todos os produtos</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 20,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    marginLeft: 8,
    color: '#E53935',
    fontSize: 16,
    fontWeight: '500',
  },
  identidade: {
    alignItems: 'center',
    marginVertical: 20,
  },
  logo: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  logoImg: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  nome: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#EEE',
    marginVertical: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  label: {
    fontWeight: '500',
    color: '#555',
  },
  value: {
    color: '#333',
  },
  bold: {
    fontWeight: 'bold',
  },
  sub: {
    color: '#888',
    fontSize: 12,
  },
  ctaButton: {
    backgroundColor: '#1976D2',
    borderRadius: 12,
    paddingVertical: 10,
    marginTop: 20,
    alignItems: 'center',
  },
  ctaText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
