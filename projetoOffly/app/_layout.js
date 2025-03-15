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
    </Stack>
  );
}
