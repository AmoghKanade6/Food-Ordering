import CustomHeader from "@/components/CustomHeader";
import EditModal from "@/components/EditModal";
import InfoRow from "@/components/InfoRow";
import { images } from "@/constants";
import { signOut, updateUser } from "@/lib/appwrite";
import useAuthStore from "@/store/auth.store";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Profile = () => {
  const { user, setIsAuthenticated, setUser } = useAuthStore();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
      setUser(null);
      setIsAuthenticated(false);
      router.push("/sign-in");
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setShowLogoutConfirm(false);
    }
  };

  const handleOpenEdit = () => setIsEditOpen(true);

  const handleSaveProfile = async (payload: {
    name?: string;
    avatar?: string;
  }) => {
    if (!user) return;
    setLoadingSave(true);
    try {
      const updatedDoc = await updateUser(user.$id, payload);
      setUser(updatedDoc);
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
          onPress={() => setShowLogoutConfirm(true)}
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

      {/* Logout confirmation modal (NativeWind classes) */}
      <Modal
        visible={showLogoutConfirm}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLogoutConfirm(false)}
      >
        <View className="flex-1 bg-black/40 justify-center items-center p-5">
          <View className="w-full rounded-lg bg-white p-5 items-center shadow-lg">
            <Text className="text-lg font-semibold mb-2">Confirm logout</Text>
            <Text className="text-sm text-gray-500  mb-4">
              Are you sure you want to log out? You will need to sign in again
              to continue!.
            </Text>

            <View className="flex-row w-full space-x-3 gap-4">
              <Pressable
                onPress={() => setShowLogoutConfirm(false)}
                className="flex-1 py-3 rounded-lg border border-gray-200 items-center bg-white"
              >
                <Text className="text-gray-700 font-semibold">Cancel</Text>
              </Pressable>

              <Pressable
                onPress={handleLogout}
                className="flex-1 py-3 rounded-lg items-center bg-red-500"
              >
                <Text className="text-white font-semibold">Logout</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Profile;
