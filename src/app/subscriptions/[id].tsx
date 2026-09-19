import { Link, useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";

export default function SubscriptionsDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <View className="bg-background flex-1 justify-center items-center">
      <Text className="text-xl font-bold text-success">
        subscription details {id}
      </Text>
      <Link href={"/"}> go back</Link>
    </View>
  );
}
