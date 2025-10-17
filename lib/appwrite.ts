import {
  CreateUserPrams,
  Customization,
  GetMenuParams,
  SignInParams,
} from "@/type";
import {
  Account,
  Avatars,
  Client,
  Databases,
  ID,
  Query,
  Storage,
  TablesDB,
} from "react-native-appwrite";

export const appwriteConfig = {
  endpoint: "https://fra.cloud.appwrite.io/v1",
  platform: "com.ak.food_ordering",
  projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID,
  databaseId: "68e78b3a0002bf5d1d56",
  bucketId: "68e8fbf0000a4b4c88b3",
  userCollectionId: "user",
  categoriesId: "categories",
  menuId: "menu",
  customizationsId: "customizations",
  menuCustomizationsId: "menu_customizations",
};

export const client = new Client();

client
  .setEndpoint(appwriteConfig.endpoint!)
  .setProject(appwriteConfig.projectId!)
  .setPlatform(appwriteConfig.platform);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const tablesDB = new TablesDB(client);
export const avatars = new Avatars(client);

export const createUser = async ({
  email,
  password,
  name,
}: CreateUserPrams) => {
  try {
    const newAccount = await account.create(ID.unique(), email, password, name);
    if (!newAccount) throw Error;

    await signIn({ email, password });

    const avatarUrl = avatars.getInitialsURL(name);

    return await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      ID.unique(),
      { email, name, accountId: newAccount.$id, avatar: avatarUrl }
    );
  } catch (error) {
    throw new Error(error as string);
  }
};

export const signIn = async ({ email, password }: SignInParams) => {
  try {
    const session = await account.createEmailPasswordSession(email, password);
    return session;
  } catch (e) {
    throw new Error(e as string);
  }
};

export const getCurrentUser = async () => {
  try {
    const currentAccount = await account.get();
    if (!currentAccount) throw Error;

    const currentUser = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.equal("accountId", currentAccount.$id)]
    );

    if (!currentUser) throw Error;

    return currentUser.documents[0];
  } catch (e) {
    console.log(e);
    throw new Error(e as string);
  }
};

export const signOut = async () => {
  try {
    await account.deleteSession("current");
    console.log("User signed out successfully");
  } catch (e) {
    console.error("Error signing out:", e);
    throw new Error(e as string);
  }
};

export const getMenu = async ({ category, query }: GetMenuParams) => {
  try {
    const queries: string[] = [];

    if (category) queries.push(Query.equal("categories", category));
    if (query) queries.push(Query.search("name", query));

    const menus = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.menuId,
      queries
    );

    return menus.documents;
  } catch (e) {
    throw new Error(e as string);
  }
};

export const getCategories = async () => {
  try {
    const categories = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.categoriesId
    );

    return categories.documents;
  } catch (e) {
    throw new Error(e as string);
  }
};

export const getMenuById = async (id: string) => {
  try {
    const item = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.menuId,
      id
    );
    return item;
  } catch (e) {
    throw new Error((e as any)?.message ?? String(e));
  }
};

export const getCustomizationsForMenu = async (
  menuId: string
): Promise<Customization[]> => {
  try {
    const rows = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.menuCustomizationsId,
      [Query.equal("menu", menuId)]
    );

    const customizationIds = rows.documents
      .map((row) => row.customizations)
      .filter(Boolean) as string[];

    if (!customizationIds.length) return [];

    const docs = await Promise.all(
      customizationIds.map(async (id) => {
        try {
          const c = await databases.getDocument(
            appwriteConfig.databaseId,
            appwriteConfig.customizationsId,
            id
          );
          return {
            $id: c.$id,
            name: c.name,
            price: Number(c.price ?? 0),
            group: c.type ?? "default",
            choiceType: "single",
          };
        } catch (e) {
          console.log("customizationIds error", e);
          return null;
        }
      })
    );
    return docs.filter(Boolean) as Customization[];
  } catch (e) {
    console.error("getCustomizationsForMenu error", e);
    return [];
  }
};

export const updateUser = async (
  documentId: string,
  payload: { name?: string; avatar?: string }
) => {
  try {
    const data: Record<string, any> = {};
    if (payload.name !== undefined) data.name = payload.name;
    if (payload.avatar !== undefined) data.avatar = payload.avatar;

    const updated = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      documentId,
      data
    );

    return updated;
  } catch (e) {
    console.error("updateUser error", e);
    throw new Error((e as any)?.message ?? String(e));
  }
};
