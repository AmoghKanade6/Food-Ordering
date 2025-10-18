import { images } from "@/constants";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = {
  visible: boolean;
  onClose: () => void;
  user: any;
  onSave: (payload: { name?: string; avatar?: string }) => Promise<void>;
};

const EditModal: React.FC<Props> = ({ visible, onClose, user, onSave }) => {
  const [name, setName] = useState(user?.name ?? "");
  const [avatar, setAvatar] = useState<string | undefined>(user?.avatar);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      setName(user?.name ?? "");
      setAvatar(user?.avatar);
    }
  }, [visible, user]);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      alert("Permission to access gallery is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      setAvatar(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: any = { name, avatar };
      await onSave(payload);
      onClose();
    } catch (e) {
      console.error("Failed to update profile", e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/40 justify-center items-center px-5">
        <SafeAreaView className="w-full max-w-md">
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
            <View className="bg-white-100 rounded-2xl p-6 shadow-lg">
              {/* Header with Close */}
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-lg font-semibold">Edit Profile</Text>
                <TouchableOpacity onPress={onClose} className="p-2">
                  <Image className="rotate-45 size-6" source={images.plus} />
                </TouchableOpacity>
              </View>

              {/* Avatar picker */}
              <TouchableOpacity
                onPress={pickImage}
                className="items-center mb-4"
              >
                <Image
                  source={{ uri: avatar }}
                  style={{ width: 92, height: 92, borderRadius: 9999 }}
                  className="bg-gray-200"
                />
                <Text className="text-gray-500 mt-2">Tap to change avatar</Text>
              </TouchableOpacity>

              {/* Name input */}
              <Text className="text-sm font-medium mb-1">Full Name</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Your full name"
                className="border border-gray-200 rounded-md p-3 mb-4 bg-white"
              />

              {/* Save button */}
              <TouchableOpacity
                onPress={handleSave}
                disabled={saving}
                className="h-12 rounded-full bg-orange-500 justify-center items-center"
              >
                <Text className="text-white font-semibold">
                  {saving ? "Saving..." : "Save"}
                </Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

export default EditModal;
