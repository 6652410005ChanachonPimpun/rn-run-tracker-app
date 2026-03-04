import {
  Kanit_400Regular,
  Kanit_700Bold,
  useFonts,
} from "@expo-google-fonts/kanit";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Kanit_400Regular,
    Kanit_700Bold,
  });

  useEffect(() => {
    SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerTitleStyle: {
          fontFamily: "Kanit_700Bold",
          fontSize: 20,
          color: "#ffffff",
        },
        headerStyle: {
          backgroundColor: "#0972af",
        },
        headerTitleAlign: "center",
        headerTintColor: "#ffffff",
        headerBackButtonDisplayMode: "minimal",
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="run" options={{ title: "Run Tracker" }} />
      <Stack.Screen name="add" options={{ title: "เพิ่มรายการวิ่ง" }} />
      <Stack.Screen name="[id]" options={{ title: "รายละเอียดการวิ่ง" }} />
    </Stack>
  );
}
