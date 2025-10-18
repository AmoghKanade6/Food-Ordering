import CartItem from "@/components/CartItem";
import CustomButton from "@/components/CustomButton";
import CustomHeader from "@/components/CustomHeader";
import { useCartStore } from "@/store/cart.store";
import { PaymentInfoStripeProps } from "@/type";
import cn from "clsx";
import { useMemo, useState } from "react";
import { FlatList, Modal, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const PaymentInfoStripe = ({
  label,
  value,
  labelStyle,
  valueStyle,
}: PaymentInfoStripeProps) => (
  <View className="flex-between flex-row my-1">
    <Text className={cn("paragraph-medium text-gray-200", labelStyle)}>
      {label}
    </Text>
    <Text className={cn("paragraph-bold text-dark-100", valueStyle)}>
      {value}
    </Text>
  </View>
);

const Cart = () => {
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const [showOrderModal, setShowOrderModal] = useState(false);

  const { totalItems, totalPrice } = useMemo(() => {
    const ti = items.reduce((sum, it) => sum + (it.quantity ?? 0), 0);
    const tp = items.reduce((sum, it) => {
      const perItem = it.price ?? 0;
      return sum + (it.quantity ?? 0) * perItem;
    }, 0);
    return { totalItems: ti, totalPrice: tp };
  }, [items]);

  const handleOrderNow = () => {
    if (totalItems <= 0) return;
    setShowOrderModal(true);
    setTimeout(() => {
      clearCart();
      setShowOrderModal(false);
    }, 3000);
  };

  return (
    <SafeAreaView className="bg-white h-full">
      <FlatList
        data={items}
        renderItem={({ item }) => <CartItem item={item} />}
        keyExtractor={(item) => item.id}
        contentContainerClassName="pb-28 px-5 pt-5"
        ListHeaderComponent={() => <CustomHeader title="Your Cart" />}
        ListEmptyComponent={() => (
          <Text className="text-center text-gray-500">Cart Empty</Text>
        )}
        ListFooterComponent={() =>
          totalItems > 0 && (
            <View className="gap-5">
              <View className="mt-6 border border-gray-200 p-5 rounded-2xl">
                <Text className="h3-bold text-dark-100 mb-5">
                  Payment Summary
                </Text>

                <PaymentInfoStripe
                  label={`Total Items (${totalItems})`}
                  value={`$${totalPrice.toFixed(2)}`}
                />
                <PaymentInfoStripe label={`Delivery Fee`} value={`$5.00`} />
                <PaymentInfoStripe
                  label={`Discount`}
                  value={`- $0.50`}
                  valueStyle="!text-success"
                />
                <View className="border-t border-gray-300 my-2" />
                <PaymentInfoStripe
                  label={`Total`}
                  value={`$${(totalPrice + 5 - 0.5).toFixed(2)}`}
                  labelStyle="base-bold !text-dark-100"
                  valueStyle="base-bold !text-dark-100 !text-right"
                />
              </View>
              <CustomButton title="Order Now" onPress={handleOrderNow} />
            </View>
          )
        }
      />

      {/* Simple order placed modal */}
      <Modal visible={showOrderModal} transparent animationType="fade">
        <View className="flex-1 bg-black/40 justify-center items-center p-5">
          <View className="w-full max-w-md bg-white rounded-2xl p-8 items-center shadow-lg">
            <View className="w-24 h-24 bg-green-100 rounded-full justify-center items-center mb-6">
              <Text className="text-5xl text-green-600 font-bold">✓</Text>
            </View>
            <Text className="text-2xl font-bold text-gray-900 mb-2">
              Order Placed!
            </Text>
            <Text className="text-center text-gray-500 text-base">
              Your delicious food is on its way. Thank you for ordering with us!
            </Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Cart;
