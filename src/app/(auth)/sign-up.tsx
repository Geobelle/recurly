import { Link } from "expo-router";
import { Text, View } from "react-native";

export default function SignUp() {
  return (
    <View className="bg-background flex-1 justify-center items-center">
      <Text className="text-xl font-bold text-success">signup</Text>
      <Link
        href="/(auth)/sign-in"
        className=" mt-4 rounded bg-primary text-accent p-4"
      >
        {" "}
        Sign In
      </Link>
    </View>
  );
}
