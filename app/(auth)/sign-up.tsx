import CustomButton from "@/components/CustomButton";
import CustomInput from "@/components/CustomInput";
import { createUser } from "@/lib/appwrite";
import useAuthStore from "@/store/auth.store";
import { Link, router } from "expo-router";
import { useState } from "react";
import { Alert, Text, View } from "react-native";

const SignUp = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const { setIsAuthenticated, setUser } = useAuthStore();

  const submit = async () => {
    const { name, email, password } = form;

    if (!name || !email || !password)
      return Alert.alert(
        "Error",
        "Please enter valid email address & password."
      );

    setIsSubmitting(true);

    try {
      const user = await createUser({ email, password, name });
      setUser(user);
      setIsAuthenticated(true);
      router.replace("/");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="gap-10 bg-white rounded-lg p-5 mt-5">
      <CustomInput
        placeholder="Enter full name"
        value={form.name}
        onChangeText={(text) => setForm((prev) => ({ ...prev, name: text }))}
        label="Full Name"
      />
      <CustomInput
        placeholder="Enter your email"
        value={form.email}
        onChangeText={(text) => setForm((prev) => ({ ...prev, email: text }))}
        label="Email"
        keyboardType="email-address"
      />
      <CustomInput
        placeholder="Enter your password"
        value={form.password}
        onChangeText={(text) =>
          setForm((prev) => ({ ...prev, password: text }))
        }
        label="Password"
        secureTextEntry={true}
      />
      <CustomButton title="Sign Up" isLoading={isSubmitting} onPress={submit} />
      <View className="flex justify-center mt-5 flex-row gap-2">
        <Text className="base-regular text-gray-100">
          Already have an account?
        </Text>
        <Link href="/sign-in" className="base-bold text-primary">
          Sign In
        </Link>
      </View>
    </View>
  );
};

export default SignUp;
