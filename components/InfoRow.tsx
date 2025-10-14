import { Image, Text, View } from "react-native";

const InfoRow: React.FC<{
  icon: any;
  title: any;
  value: any;
  className?: string;
}> = ({ icon, title, value, className }) => {
  return (
    <View className={`flex-row items-center ${className ?? ""}`}>
      <View
        className="w-12 h-12 rounded-full items-center justify-center bg-orange-50"
        style={{ borderWidth: 0.5, borderColor: "rgba(0,0,0,0.02)" }}
      >
        <Image source={icon} className="size-8" resizeMode="contain" />
      </View>
      <View className="ml-4 flex-1">
        <Text className="text-xs text-gray-400">{title}</Text>
        <Text className="text-sm text-gray-800 font-semibold mt-0.5">
          {value}
        </Text>
      </View>
    </View>
  );
};

export default InfoRow;
