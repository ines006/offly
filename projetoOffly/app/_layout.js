import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="components/entrar/login"
        options={{
          title: "Página de inicio de sessão",
        }}
      />
      <Stack.Screen
        name="components/entrar/registo"
        options={{
          title: "Página de registo",
        }}
      />
      <Stack.Screen
        name="components/desafio/desafioSemanal"
        options={{
          title: "Desafio Semanal",
        }}
      />
      <Stack.Screen
        name="components/desafio/descobrirDesafio"
        options={{
          title: "Descobrir Desafio Semanal",
        }}
      />
      <Stack.Screen
        name="components/desafio/verificarDesafio"
        options={{
          title: "Verificar Desafio Semanal",
        }}
      />
      <Stack.Screen
        name="components/caderneta/caderneta"
        options={{
          title: "Caderneta da equipa",
        }}
      />
      <Stack.Screen
        name="components/leaderboard/detalhesEquipa"
        options={{
          title: "Detalhes da Equipa",
        }}
      />
      <Stack.Screen
        name="components/leaderboard/pontuacaoEquipa"
        options={{
          title: "Tabela de classificação",
        }}
      />
      <Stack.Screen
        name="components/pag-principal-lg/pag-principal-lg"
        options={{
          title: "Página Principal",
        }}
      />
      <Stack.Screen
        name="components/shake/cartas"
        options={{
          title: "Cartas Shake",
        }}
      />
      <Stack.Screen
        name="components/shake/cartaSelecionada"
        options={{
          title: "Carta Selecionada",
        }}
      />
      <Stack.Screen
        name="components/shake/cartaSelecionada2"
        options={{
          title: "Carta Selecionada 2",
        }}
      />
      <Stack.Screen
        name="components/shake/shake"
        options={{
          title: "Página do Shake",
        }}
      />
      <Stack.Screen
        name="components/shake/shakeScreen"
        options={{
          title: "Página do Shake",
        }}
      />
      <Stack.Screen
        name="components/shake/uploadDesafio"
        options={{
          title: "Upload do desafio diário",
        }}
      />
      <Stack.Screen
        name="components/uploadScreenTime/UploadScreen"
        options={{
          title: "Upload do tempo de ecrã",
        }}
      />
      <Stack.Screen
        name="components/Equipas"
        options={{
          title: "Lista de Equipas",
        }}
      />
      <Stack.Screen
        name="components/UploadScreenTime"
        options={{
          title: "Upload do Tempo de Ecrã 2",
        }}
      />
      <Stack.Screen
        name="questionario"
        options={{
          title: "Questionário",
        }}
      />
      <Stack.Screen
        name="perfil"
        options={{
          title: "Perfil",
        }}
      />
      <Stack.Screen
        name="onboarding"
        options={{
          title: "Onboarding",
        }}
      />
    </Stack>
  );
}
