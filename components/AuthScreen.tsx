import type { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

type AuthScreenProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

export function AuthScreen({ title, subtitle, children }: AuthScreenProps) {
  return (
    <SafeAreaView
      edges={["top", "bottom"]}
      style={{ flex: 1 }}
      className="auth-safe-area"
    >
      <KeyboardAvoidingView
        className="flex flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          className="auth-scroll"
          contentContainerClassName="grow-1 justify-center px-5 py-8"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="auth-brand-block">
            <View className="auth-logo-wrap">
              <View className="auth-logo-mark">
                <Text className="auth-logo-mark-text">R</Text>
              </View>
              <View>
                <Text className="auth-wordmark">Recurly</Text>
                <Text className="auth-wordmark-sub">Smart billing</Text>
              </View>
            </View>
            <Text className="auth-title">{title}</Text>
            <Text className="auth-subtitle">{subtitle}</Text>
          </View>
          <View className="auth-card">{children}</View>
          <Text className="auth-trust">
            Your subscriptions, organized with care.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
