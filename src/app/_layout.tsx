import { ClerkProvider, useAuth } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { useFonts } from "expo-font";
import { SplashScreen, Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { Text, View } from "react-native";
import "../../global.css";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "sans-regular": require("../../assets/fonts/PlusJakartaSans-Regular.ttf"),
    "sans-bold": require("../../assets/fonts/PlusJakartaSans-Bold.ttf"),
    "sans-medium": require("../../assets/fonts/PlusJakartaSans-Medium.ttf"),
    "sans-semiBold": require("../../assets/fonts/PlusJakartaSans-SemiBold.ttf"),
    "sans-extraBold": require("../../assets/fonts/PlusJakartaSans-ExtraBold.ttf"),
    "sans-light": require("../../assets/fonts/PlusJakartaSans-Light.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (!fontsLoaded) return null;
  if (!publishableKey) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-8">
        <Text className="text-center text-base font-sans-semibold text-primary">
          Sign-in is temporarily unavailable. Please check the app
          configuration.
        </Text>
      </View>
    );
  }

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <AppNavigator />
    </ClerkProvider>
  );
}

function AppNavigator() {
  const { isLoaded, isSignedIn } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  // useEffect(() => {
  //   if (!isLoaded) return;
  //   const inAuthGroup = segments[0] === "(auth)";
  //   // if (!isSignedIn && !inAuthGroup) router.replace("/(auth)/sign-in");
  //   // if (isSignedIn && inAuthGroup) router.replace("/(tabs)");
  // }, [isLoaded, isSignedIn, router, segments]);

  // if (!isLoaded) {
  //   return (
  //     <View className="flex-1 items-center justify-center bg-background">
  //       <ActivityIndicator color="#ea7a53" />
  //     </View>
  //   );
  // }

  return <Stack screenOptions={{ headerShown: false }} />;
}
