// MenuDetails.tsx
import CustomHeader from "@/components/CustomHeader";
import MenuCustomizations from "@/components/CustomMenu";
import { getMenuById } from "@/lib/appwrite";
import { useCartStore } from "@/store/cart.store";
import { Customization, MenuItem } from "@/type";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MenuDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const items = useCartStore((s) => s.items);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [doc, setDoc] = useState<any | null>(null);
  const [selected, setSelected] = useState<{
    map: Record<string, string[]>;
    items: Customization[];
    total: number;
  }>({ map: {}, items: [], total: 0 });

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const res = await getMenuById(id);
        if (!mounted) return;
        setDoc(res);
      } catch (e: any) {
        console.error("MenuDetails error:", e);
        if (!mounted) return;
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [id]);

  const item: MenuItem | null = useMemo(() => {
    if (!doc) return null;
    return {
      $id: doc.$id,
      $collectionId: doc.$collectionId,
      $databaseId: doc.$databaseId,
      $createdAt: doc.$createdAt,
      $updatedAt: doc.$updatedAt,
      $permissions: doc.$permissions,
      $sequence: doc.$sequence,
      name: doc.name ?? "Unknown",
      price: typeof doc.price === "number" ? doc.price : Number(doc.price ?? 0),
      image_url: doc.image_url ?? "",
      description: doc.description ?? "",
      calories: Number(doc.calories ?? 0),
      protein: Number(doc.protein ?? 0),
      rating: Number(doc.rating ?? 0),
      type: doc.type ?? "Regular",
    };
  }, [doc]);

  const cartItem = item ? items.find((i) => i.id === item.$id) : undefined;
  const [localQty, setLocalQty] = useState(cartItem?.quantity ?? 1);

  useEffect(() => {
    if (cartItem) setLocalQty(cartItem.quantity);
  }, [cartItem]);

  const handleIncrease = () => setLocalQty((prev) => prev + 1);
  const handleDecrease = () => setLocalQty((prev) => (prev > 1 ? prev - 1 : 1));

  const handleAddToCart = () => {
    if (!item) return;
    const perItemTotal = item.price + selected.total;

    addItem({
      id: item.$id,
      name: item.name,
      price: perItemTotal,
      image_url: item.image_url,
      customizations: selected.items.map((c) => ({
        id: c.$id,
        name: c.name,
        price: c.price ?? 0,
        type: c.group ?? "default",
      })),
      quantity: localQty,
    });

    router.push("/cart");
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#F97316" />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !item) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-lg text-gray-700 mb-2">
            {error ?? "Item not found"}
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="mt-4 px-6 py-3 rounded-full bg-primary"
          >
            <Text className="text-white font-semibold">Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const imageUri = encodeURI(item.image_url);

  return (
    <SafeAreaView className="flex-1 bg-white ">
      <View className="px-5 pt-5">
        <CustomHeader />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 140 }}>
        {/* Item info */}
        <View className="px-6 mt-2" style={{ minHeight: 240 }}>
          <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
            <View style={{ flex: 2, marginRight: 16 }}>
              <Text className="text-2xl font-extrabold text-[#111827]">
                {item.name}
              </Text>
              <Text className="text-sm text-gray-400 mt-1">{item.type}</Text>
              <View className="flex-row items-center align-center mt-3">
                <Text className="text-orange-400 mr-2">★★★★★</Text>
                <Text className="text-sm text-gray-500">
                  {item.rating?.toFixed(1) ?? "0"}/5
                </Text>
              </View>
              <Text className="text-2xl font-extrabold mt-3">
                ${item.price.toFixed(2)}
              </Text>

              {/* stats: Calories, Protein, Bun Type */}
              <View className="flex-column justify-start items-start gap-4 mt-4">
                <View>
                  <Text className="text-xs text-gray-400">Calories</Text>
                  <Text className="text-sm text-gray-800 font-semibold">
                    {item.calories} Cal
                  </Text>
                </View>
                <View>
                  <Text className="text-xs text-gray-400">Protein</Text>
                  <Text className="text-sm text-gray-800 font-semibold">
                    {item.protein}g
                  </Text>
                </View>
                <View>
                  <Text className="text-xs text-gray-400">Bun Type</Text>
                  <Text className="text-sm text-gray-800 font-semibold">
                    {item.type || "Whole Wheat"}
                  </Text>
                </View>
              </View>
            </View>

            <View style={{ flex: 1, alignItems: "flex-end" }}>
              <Image
                source={{ uri: imageUri }}
                resizeMode="cover"
                className="size-52 mt-14"
              />
            </View>
          </View>
        </View>

        {/* Description */}
        <View className="px-6 mt-5">
          <Text className="text-gray-600 leading-7">{item.description}</Text>
        </View>

        {/* Customizations */}
        <MenuCustomizations
          menuId={item.$id}
          onSelectionChange={(map, items, total) => {
            setSelected({ map, items, total });
          }}
        />
      </ScrollView>

      {/* Bottom bar */}
      <View style={styles.bottomBar}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <TouchableOpacity onPress={handleDecrease} style={styles.qtyBtn}>
            <Text className="text-2xl">−</Text>
          </TouchableOpacity>
          <Text className="text-lg font-semibold">{localQty}</Text>
          <TouchableOpacity onPress={handleIncrease} style={styles.qtyBtn}>
            <Text className="text-2xl">+</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={handleAddToCart} style={styles.addBtn}>
          <Text className="text-white font-semibold">
            Add to cart ${((item.price + selected.total) * localQty).toFixed(2)}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  bottomBar: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 70,
    height: 70,
    borderRadius: 999,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 6,
  },
  qtyBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#eee",
    alignItems: "center",
    justifyContent: "center",
  },
  addBtn: {
    backgroundColor: "#F97316",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
  },
});
