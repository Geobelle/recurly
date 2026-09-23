import { Link } from "expo-router";
import { styled } from "nativewind";
import { Text } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
const SafeAreaView = styled(RNSafeAreaView);

export default function Index() {
  return (
    <SafeAreaView className="bg-background p-5 flex-1 ">
      <Text className="text-xl font-bold text-success">
        welcome to nativewind
      </Text>
      <Link
        href="/onboarding"
        className=" mt-4 rounded bg-primary text-accent p-4"
      >
        Go To Onboarding
      </Link>
      <Link
        href="/(auth)/sign-in"
        className=" mt-4 rounded bg-primary text-accent p-4"
      >
        Go To Sign In
      </Link>

      <Link
        href="/(auth)/sign-up"
        className=" mt-4 rounded bg-primary text-accent p-4"
      >
        Go To Sign Up
      </Link>

      <Link
        href="/subscriptions/spotify"
        className=" mt-4 rounded bg-primary text-accent p-4"
      >
        Spotify Subscription
      </Link>

      <Link
        href={{
          pathname: "/subscriptions/[id]",
          params: { id: "claude" },
        }}
        className=" mt-4 rounded bg-primary text-accent p-4"
      >
        Claude Max Subscription
      </Link>
    </SafeAreaView>
  );
}
