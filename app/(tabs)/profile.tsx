import CustomHeader from "@/components/CustomHeader";
import InfoRow from "@/components/InfoRow";
import { images } from "@/constants";
import { signOut } from "@/lib/appwrite";
import useAuthStore from "@/store/auth.store";
import { router } from "expo-router";
import React from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Profile = () => {
  const { user, setIsAuthenticated, setUser } = useAuthStore();

  const handleLogout = async () => {
    try {
      await signOut();
      setUser(null);
      setIsAuthenticated(false);
      router.push("/sign-in");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white px-5 pt-5">
      <CustomHeader title="Profile" />
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* avatar + header */}
        <View className="items-center mt-6 mb-4">
          <View className="relative">
            <Image
              source={{ uri: user?.avatar }}
              style={{
                width: 96,
                height: 96,
                borderRadius: 9999,
                borderWidth: 3,
                borderColor: "#fff",
              }}
              className="bg-gray-200"
            />
          </View>
        </View>

        <View
          className="bg-white rounded-2xl p-6 mb-6"
          style={{
            shadowColor: "rgba(0,0,0,0.06)",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 1,
            shadowRadius: 20,
            elevation: 3,
          }}
        >
          <InfoRow icon={images.user} title="Full Name" value={user?.name} />
          <InfoRow
            icon={images.envelope}
            title="Email"
            value={user?.email}
            className="mt-4"
          />
        </View>

        {/* Buttons */}
        <TouchableOpacity
          onPress={() => {}}
          activeOpacity={0.85}
          className="h-14 rounded-full justify-center items-center mb-4 border-2 border-orange-300"
        >
          <Text className="text-orange-500 font-semibold">Edit Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleLogout}
          activeOpacity={0.85}
          className="h-14 rounded-full justify-center items-center mb-6 border-2 border-red-200"
          style={{ backgroundColor: "transparent" }}
        >
          <Text className="text-red-500 font-semibold">Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;
