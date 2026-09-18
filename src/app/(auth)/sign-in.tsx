import { Link } from "expo-router";
import { Text, View } from "react-native";

export default function SignIn() {
  return (
    <View className="bg-background flex-1 justify-center items-center">
      <Text className="text-xl font-bold text-success">signin</Text>
      <Link
        href="/(auth)/sign-up"
        className=" mt-4 rounded bg-primary text-accent p-4"
      >
        {" "}
        create Account
      </Link>
    </View>
  );
}
