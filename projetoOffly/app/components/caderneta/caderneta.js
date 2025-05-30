import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Svg, Circle, Path } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { baseurl } from '../../api-config/apiConfig';
import { AuthContext } from '../entrar/AuthContext';

const Caderneta = () => {
  const { user } = useContext(AuthContext);
  const [completedDaysSet, setCompletedDaysSet] = useState(new Set());
  const [participantIds, setParticipantIds] = useState([]);
  const [teamChallenges, setTeamChallenges] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchPassbookData = async () => {
      if (!user?.id) {
        console.log('❌ Utilizador não autenticado ou id inválido');
        return;
      }

      try {
        const response = await fetch(`${baseurl}/passbook?id=${user.id}`);
        const data = await response.json();

        if (!data.teamParticipants?.length) {
          console.log('❌ Participantes da equipa não encontrados');
          return;
        }

        const ids = data.teamParticipants.map(p => p.id);
        setParticipantIds(ids);
        setTeamChallenges(data.challenges);

        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        const completedDays = new Set();

        data.challenges.forEach(challenge => {
          if (challenge.completed_date) {
            const date = new Date(challenge.completed_date);
            if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
              completedDays.add(date.getDate());
            }
          }
        });

        setCompletedDaysSet(completedDays);
      } catch (error) {
        console.error('❌ Erro ao buscar dados do passbook:', error);
      }
    };

    fetchPassbookData();
  }, [user]);

  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

  return (
    <ScrollView contentContainerStyle={styles.scrollViewContent}>
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          accessibilityLabel="Voltar"
          accessibilityRole="button"
        >
          <Svg width={36} height={35} viewBox="0 0 36 35" fill="none">
            <Circle cx="18.1351" cy="17.1713" r="16.0177" stroke="#263A83" strokeWidth={2} />
            <Path
              d="M21.4043 9.06396L13.1994 16.2432C12.7441 16.6416 12.7441 17.3499 13.1994 17.7483L21.4043 24.9275"
              stroke="#263A83"
              strokeWidth={2}
              strokeLinecap="round"
            />
          </Svg>
        </TouchableOpacity>

        <Text style={styles.title}>Caderneta</Text>

        <View style={styles.viewcaderneta}>
          <Text style={styles.sectionTitle}>Desafios semanais</Text>
          <Text style={styles.subtitle}>Vê os desafios das semanas passadas</Text>
          <View style={styles.cardGrid}>
            {Array.from({ length: 4 }).map((_, idx) => (
              <View
                key={idx}
                style={[styles.card, styles.inactiveCard]}
                accessibilityLabel={`Desafio semanal ${idx + 1} ainda não disponível`}
              >
                <Text style={styles.cardNumber}>{idx + 1}</Text>
              </View>
            ))}
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Desafios diários</Text>
          <Text style={styles.subtitle}>Consulta os desafios dos teus colegas de equipa</Text>

          <View style={styles.cardGrid}>
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNumber = idx + 1;
              const isCompleted = completedDaysSet.has(dayNumber);

              if (!isCompleted) {
                return (
                  <View
                    key={dayNumber}
                    style={[styles.card, styles.inactiveCard]}
                  >
                    <View style={styles.cardContentContainer}>
                      <Text style={styles.cardPlaceholder}>?</Text>
                      <Text style={styles.cardNumber}>{dayNumber}</Text>
                    </View>
                  </View>
                );
              }

              const completionsThatDay = teamChallenges.filter(ch => {
                if (!ch.completed_date) return false;
                const date = new Date(ch.completed_date);
                return (
                  date.getDate() === dayNumber &&
                  date.getMonth() === today.getMonth() &&
                  date.getFullYear() === today.getFullYear()
                );
              });

              const totalParticipants = participantIds.length;
              const numCompleted = completionsThatDay.length;
              const percent = totalParticipants > 0 ? (numCompleted / totalParticipants) * 100 : 0;

              let imageSource = require('../../imagens/desafiodiario1.png');
              let borderColor = '#730687';

              if (percent === 100) {
                imageSource = require('../../imagens/desafiodiario3.png');
                borderColor = '#9E731A';
              } else if (percent >= 50) {
                imageSource = require('../../imagens/desafiodiario2.png');
                borderColor = '#263A83';
              }

              return (
                <View key={dayNumber} style={[styles.card, styles.activeCard]}>
                  <TouchableOpacity
                    onPress={() =>
                      router.push({
                        pathname: './detalhesDia',
                        params: {
                          dia: dayNumber,
                          participantIds: JSON.stringify([...participantIds]),
                        },
                      })
                    }
                  >
                    <View>
                      <Image
                        source={imageSource}
                        style={[styles.cardImage, { borderColor }]}
                        resizeMode="cover"
                      />
                      <Text style={[styles.dayNumberOverlay, { color: borderColor }]}>
                        {dayNumber}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollViewContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#F8F9FD',
    padding: 20,
    marginTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#263A83',
    top: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#263A83',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#263A83',
    marginBottom: 15,
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '22%',
    height: 120,
    borderRadius: 8,
    marginBottom: 15,
    elevation: 5,
  },
  activeCard: {
    backgroundColor: '#D8EAF8',
    borderRadius: 8,
    overflow: 'hidden',
  },
  inactiveCard: {
    backgroundColor: '#EDEDF1',
    borderColor: '#263A83',
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    borderWidth: 4,
    borderRadius: 11,
  },
  cardContentContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  cardPlaceholder: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#C5C6D0',
    textAlign: 'center',
  },
  cardNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2D2F45',
    position: 'absolute',
    left: 52,
    top: 92,
  },
  dayNumberOverlay: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    fontSize: 14,
    fontWeight: 'bold',
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  divider: {
    height: 3,
    backgroundColor: '#263A83',
    marginVertical: 20,
  },
  viewcaderneta: {
    top: 60,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    width: 40,
    height: 40,
    left: 25,
    borderRadius: 25,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
});

export default Caderneta;
