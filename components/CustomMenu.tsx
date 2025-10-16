// components/CustomMenu.tsx
import { getCustomizationsForMenu } from "@/lib/appwrite"; // adjust import
import { Customization } from "@/type";
import cn from "clsx";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const emojiForName = (name: string) => {
  const n = (name ?? "").toLowerCase();
  if (n.includes("tomato")) return "🍅";
  if (n.includes("onion")) return "🧅";
  if (n.includes("cheese")) return "🧀";
  if (n.includes("bacon")) return "🥓";
  if (n.includes("fries")) return "🍟";
  if (n.includes("salad")) return "🥗";
  if (n.includes("coleslaw")) return "🥬";
  if (n.includes("pringles")) return "🥨";
  return "🍽️";
};

export default function MenuCustomizations({
  menuId,
  onSelectionChange,
}: {
  menuId: string;
  onSelectionChange?: (
    selectedMap: Record<string, string[]>,
    selectedItems: Customization[],
    selectedTotal: number
  ) => void;
}) {
  const [loading, setLoading] = useState(true);
  const [customizations, setCustomizations] = useState<Customization[]>([]);
  const [selected, setSelected] = useState<Record<string, string[]>>({});

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!menuId) {
        setCustomizations([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const res = await getCustomizationsForMenu(menuId);
        if (!mounted) return;
        console.log(
          "[MenuCustomizations] loaded",
          res.length,
          "items for menuId",
          menuId
        );
        setCustomizations(res);
      } catch (err) {
        console.error(
          "[MenuCustomizations] Failed to load customizations:",
          err
        );
        if (!mounted) return;
        setCustomizations([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [menuId]);

  // group items by `group` (fallback to "default")
  const grouped = useMemo(() => {
    const map: Record<string, Customization[]> = {};
    for (const c of customizations) {
      const g = c.group ?? "default";
      if (!map[g]) map[g] = [];
      map[g].push(c);
    }
    console.log("[MenuCustomizations] grouped keys:", Object.keys(map));
    return map;
  }, [customizations]);

  const emitSelection = (nextSelected: Record<string, string[]>) => {
    const selectedIds = Object.values(nextSelected).flat();
    const selectedItems = customizations.filter((c) =>
      selectedIds.includes(c.$id)
    );
    const selectedTotal = selectedItems.reduce(
      (s, it) => s + (it.price ?? 0),
      0
    );
    onSelectionChange?.(nextSelected, selectedItems, selectedTotal);
  };

  const toggleSelection = (group: string, item: Customization) => {
    const choiceType = item.choiceType ?? "multiple";
    const current = selected[group] ?? [];

    let next: Record<string, string[]>;
    if (choiceType === "single") {
      next = { ...selected, [group]: [item.$id] };
      setSelected(next);
      emitSelection(next);
      return;
    }

    const exists = current.includes(item.$id);
    const nextGroup = exists
      ? current.filter((id) => id !== item.$id)
      : [...current, item.$id];
    next = { ...selected, [group]: nextGroup };
    setSelected(next);
    emitSelection(next);
  };

  const selectedPrice = () => {
    let total = 0;
    for (const grp of Object.keys(selected)) {
      const ids = selected[grp];
      for (const id of ids) {
        const it = customizations.find((c) => c.$id === id);
        if (it && typeof it.price === "number") total += it.price;
      }
    }
    return total;
  };

  if (loading) {
    return (
      <View className="px-6 mt-6">
        <ActivityIndicator size="small" color="#F97316" />
      </View>
    );
  }

  // If no customizations found show fallback (so you notice)
  if (!customizations || customizations.length === 0) {
    return (
      <View className="px-6 mt-6">
        <Text className="text-sm text-gray-500">
          No customization options available
        </Text>
      </View>
    );
  }

  return (
    <View>
      {Object.entries(grouped).map(([group, items]) => (
        <View key={group} className="px-6 mt-6">
          <Text className="text-base font-semibold mb-3">
            {group === "topping"
              ? "Toppings"
              : group === "side"
                ? "Side options"
                : group}
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="pb-6"
          >
            {items.map((it, index) => {
              const key = `${group}-${it.$id}-${index}`;
              const isSelected = (selected[group] ?? []).includes(it.$id);
              return (
                <TouchableOpacity
                  key={key}
                  onPress={() => toggleSelection(group, it)}
                  className={cn(
                    "mr-3 rounded-2xl items-center justify-center p-3",
                    isSelected ? " border-2 border-[#FE8C00]" : "bg-white"
                  )}
                  style={{ width: 92 }}
                >
                  <View className="w-14 h-14 rounded-lg bg-[#FE8C000D] items-center justify-center mb-2">
                    <Text>{emojiForName(it.name)}</Text>
                  </View>

                  <Text
                    className="text-sm text-gray-700 text-center"
                    numberOfLines={2}
                  >
                    {it.name}
                  </Text>
                  {typeof it.price === "number" && it.price > 0 && (
                    <Text className="text-xs text-gray-500 mt-1">
                      + ₹{it.price}
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      ))}

      <View className="px-6 mt-4">
        <Text className="text-lg  text-gray-600">
          Selected extra: ₹{selectedPrice()}
        </Text>
      </View>
    </View>
  );
}
