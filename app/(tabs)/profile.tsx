import CustomHeader from "@/components/CustomHeader";
import EditModal from "@/components/EditModal";
import InfoRow from "@/components/InfoRow";
import { images } from "@/constants";
import { signOut, updateUser } from "@/lib/appwrite";
import useAuthStore from "@/store/auth.store";
import { User } from "@/type";
import { router } from "expo-router";
import React, { useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Models } from "react-native-appwrite";
import { SafeAreaView } from "react-native-safe-area-context";

const Profile = () => {
  const { user, setIsAuthenticated, setUser } = useAuthStore();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);

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

  const handleOpenEdit = () => setIsEditOpen(true);

  const mapDocumentToUser = (doc: Models.Document): User => ({
    $id: doc.$id,
    $collectionId: doc.$collectionId,
    $databaseId: doc.$databaseId,
    $createdAt: doc.$createdAt,
    $updatedAt: doc.$updatedAt,
    $permissions: doc.$permissions ?? [],
    $sequence: doc.$sequence ?? 0,
    name: (doc as any).name ?? "",
    email: (doc as any).email ?? "",
    avatar: (doc as any).avatar ?? "",
  });

  const handleSaveProfile = async (payload: {
    name?: string;
    avatar?: string;
  }) => {
    if (!user) return;
    setLoadingSave(true);
    try {
      const updatedDoc = await updateUser(user.$id, payload);
      const updatedUser = mapDocumentToUser(updatedDoc);
      setUser(updatedUser);
    } catch (e) {
      console.error("Failed to update user:", e);
    } finally {
      setLoadingSave(false);
      setIsEditOpen(false);
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
          onPress={handleOpenEdit}
          activeOpacity={0.85}
          className="h-14 rounded-full justify-center items-center mb-4 border-2 border-orange-300"
        >
          <Text className="text-orange-500 font-semibold">Edit Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleLogout}
          activeOpacity={0.85}
          className="h-14 rounded-full justify-center items-center mb-6 border-2 border-red-400"
          style={{ backgroundColor: "transparent" }}
        >
          <Text className="text-red-600 font-semibold">Logout</Text>
        </TouchableOpacity>
      </ScrollView>
      <EditModal
        visible={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        user={user}
        onSave={async (payload) => {
          await handleSaveProfile(payload);
        }}
      />
    </SafeAreaView>
  );
};

export default Profile;
