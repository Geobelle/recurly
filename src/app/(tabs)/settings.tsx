import { useClerk, useUser } from "@clerk/expo";
import { useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Settings() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [error, setError] = useState("");

  async function handleSignOut() {
    setIsSigningOut(true);
    setError("");
    try {
      await signOut();
    } catch {
      setError("We couldn’t sign you out just now. Please try again.");
      setIsSigningOut(false);
    }
  }

  const displayName = user?.fullName || user?.primaryEmailAddress?.emailAddress || "Your account";

  return (
    <SafeAreaView className="flex-1 bg-background p-5" edges={["top", "bottom"]}>
      <Text className="text-3xl font-sans-bold text-primary">Settings</Text>
      <Text className="mt-2 text-base font-sans-medium text-muted-foreground">Manage your account and preferences.</Text>

      <View className="mt-8 rounded-3xl border border-border bg-card p-5">
        <Text className="text-xs font-sans-bold uppercase tracking-[1px] text-muted-foreground">Your account</Text>
        {!isLoaded ? (
          <ActivityIndicator className="mt-5 self-start" color="#ea7a53" />
        ) : (
          <>
            <Text className="mt-4 text-lg font-sans-bold text-primary">{displayName}</Text>
            {!!user?.primaryEmailAddress?.emailAddress && (
              <Text className="mt-1 text-sm font-sans-medium text-muted-foreground">{user.primaryEmailAddress.emailAddress}</Text>
            )}
            <View className="mt-5 h-px bg-border" />
            {error ? <Text accessibilityRole="alert" className="mt-4 text-sm font-sans-medium text-destructive">{error}</Text> : null}
            <Pressable
              className={`mt-5 items-center rounded-2xl border border-border py-4 ${isSigningOut ? "opacity-50" : ""}`}
              onPress={handleSignOut}
              disabled={isSigningOut}
              accessibilityRole="button"
            >
              {isSigningOut ? <ActivityIndicator color="#081126" /> : <Text className="text-base font-sans-bold text-primary">Sign out</Text>}
            </Pressable>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}
