import { View, Text, Button, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import Login from './components/entrar/login'
import EcraParticipantes from './participantes'


export default function Index() {
  const router = useRouter();

  return (
    <>
      <View style={styles.container}>
       <Login />
       {/* <EcraParticipantes /> */}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#D2E9FF",
  },

  buttonSpacing: {
    marginBottom: 10,
  },
});
