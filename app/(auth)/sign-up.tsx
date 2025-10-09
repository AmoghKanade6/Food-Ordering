import { router } from "expo-router";
import { Button, Text, View } from "react-native";

const SignUp = () => {
  return (
    <View>
      <Text>SignIn</Text>
      <Button title="Sign In" onPress={() => router.push("/sign-in")} />
    </View>
  );
};

export default SignUp;
