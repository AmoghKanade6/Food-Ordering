import CartButton from "@/components/CartButton";
import Filter from "@/components/Filter";
import MenuCard from "@/components/MenuCard";
import Searchbar from "@/components/SearchBar";
import { getCategories, getMenu } from "@/lib/appwrite";
import useAppwrite from "@/lib/useAppwrite";
import { Category, MenuItem } from "@/type";
import cn from "clsx";
import { useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Search = () => {
  const { category, query } = useLocalSearchParams<{
    query: string;
    category: string;
  }>();

  const {
    data,
    refetch,
    loading: dataLoading,
  } = useAppwrite({
    fn: getMenu,
    params: { category, query, limit: 6 },
  });
  const { data: categories, loading: categoriesLoading } = useAppwrite({
    fn: getCategories,
  });

  const categoryItems: Category[] =
    categories?.map((doc) => ({
      ...doc,
      name: doc.name!,
      description: doc.description!,
    })) ?? [];

  useEffect(() => {
    refetch({ category, query, limit: 6 });
  }, [category, query]);

  return (
    <SafeAreaView className="bg-white h-full">
      <FlatList
        data={data}
        renderItem={({ item, index }) => {
          const isFirstRightColItem = index % 2 === 0;

          return (
            <View
              className={cn(
                "flex-1 max-w-[48%]",
                !isFirstRightColItem ? "mt-8" : "mt-0"
              )}
            >
              <MenuCard item={item as any as MenuItem} />
            </View>
          );
        }}
        keyExtractor={(item) => item.$id}
        numColumns={2}
        columnWrapperClassName="gap-7"
        contentContainerClassName="gap-7 px-5 pb-32"
        ListHeaderComponent={() => (
          <View className="my-5 gap-5">
            <View className="flex-between flex-row w-full">
              <View className="flex-start">
                <Text className="small-bold uppercase text-primary">
                  Search
                </Text>
                <View className="flex-start flex-row gap-x-1 mt-0.5">
                  <Text className="paragraph-semibold text-dark-100">
                    Find your favorite food
                  </Text>
                </View>
              </View>

              <CartButton />
            </View>

            <Searchbar />

            <Filter categories={categoryItems} />
          </View>
        )}
        ListEmptyComponent={() => {
          if (dataLoading || categoriesLoading) {
            return (
              <View className="flex-1 w-full items-center justify-center py-20">
                <ActivityIndicator size="large" color="#F97316" />
              </View>
            );
          } else
            return (
              <Text className="text-center text-gray-500">No results</Text>
            );
        }}
      />
    </SafeAreaView>
  );
};

export default Search;
