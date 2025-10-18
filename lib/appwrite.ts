import {
  CreateUserPrams,
  Customization,
  GetMenuParams,
  SignInParams,
  User,
} from "@/type";
import {
  Account,
  Avatars,
  Client,
  Databases,
  ID,
  Models,
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

export const mapDocumentToUser = (doc: Models.Document): User => {
  const raw: any = doc as any;
  return {
    $id: doc.$id,
    $collectionId: doc.$collectionId ?? "",
    $databaseId: doc.$databaseId ?? "",
    $createdAt: doc.$createdAt ?? "",
    $updatedAt: doc.$updatedAt ?? "",
    $permissions: (doc as any).$permissions ?? [],
    $sequence: (doc as any).$sequence ?? 0,
    name: raw.name ?? "",
    email: raw.email ?? "",
    avatar: raw.avatar
      ? String(raw.avatar)
      : avatars.getInitialsURL(raw.name ?? "User").toString(),
  } as User;
};

export const createUser = async ({
  email,
  password,
  name,
}: CreateUserPrams): Promise<User> => {
  const newAccount = await account.create(ID.unique(), email, password, name);
  try {
    await (account as any).createEmailSession(email, password);
  } catch {
    await (account as any).createEmailPasswordSession?.(email, password);
  }

  const avatarUrl = avatars.getInitialsURL(name).toString();

  const createdDoc = await databases.createDocument(
    appwriteConfig.databaseId,
    appwriteConfig.userCollectionId,
    ID.unique(),
    { email, name, accountId: newAccount.$id, avatar: avatarUrl }
  );

  return mapDocumentToUser(createdDoc);
};

export const signIn = async ({
  email,
  password,
}: SignInParams): Promise<User> => {
  try {
    try {
      await (account as any).createEmailSession(email, password);
    } catch {
      await (account as any).createEmailPasswordSession?.(email, password);
    }
    // fetch and return the typed user
    const u = await getCurrentUser();
    if (!u) throw new Error("Failed to fetch user after sign in");
    return u;
  } catch (e: any) {
    throw new Error(e?.message ?? String(e));
  }
};

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const currentAccount = await account.get();
    if (!currentAccount) return null;

    const res = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.equal("accountId", currentAccount.$id)]
    );

    const doc = res.documents?.[0];
    if (!doc) return null;
    return mapDocumentToUser(doc);
  } catch (e: any) {
    console.warn("getCurrentUser error", e?.message ?? e);
    return null;
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
): Promise<User> => {
  const updatedDoc = await databases.updateDocument(
    appwriteConfig.databaseId,
    appwriteConfig.userCollectionId,
    documentId,
    payload
  );
  return mapDocumentToUser(updatedDoc);
};
