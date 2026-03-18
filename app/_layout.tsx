import { Stack } from "expo-router";
import { useState } from "react";
import { useColorScheme } from "react-native";
import SplashAnimation from "../src/components/SplashAnimation";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [showSplash, setShowSplash] = useState(true);

  return (
    <>
      {/* Splash — sirf pehli baar */}
      {showSplash && (
        <SplashAnimation onFinish={() => setShowSplash(false)} />
      )}

      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: isDark ? "#1a1a2e" : "#ffffff",
          },
          headerTintColor: isDark ? "#ffffff" : "#000000",
          headerTitleStyle: { fontWeight: "bold" },
        }}
      >
        <Stack.Screen
          name="index"
          options={{ title: "Pokedex" }}
        />
        <Stack.Screen
          name="details"
          options={{
            title: "Details",
            headerBackButtonDisplayMode: "minimal",
            presentation: "formSheet",
            sheetAllowedDetents: [0.75, 1.0],
            sheetGrabberVisible: true,
          }}
        />
      </Stack>
    </>
  );
}