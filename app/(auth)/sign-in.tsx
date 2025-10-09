import { router } from "expo-router";
import { Button, Text, View } from "react-native";

const SignIn = () => {
  return (
    <View>
      <Text>Sign Up</Text>
      <Button title="Sign Up" onPress={() => router.push("/sign-up")} />
    </View>
  );
};

export default SignIn;
