import { ID, Query } from "react-native-appwrite";
import { appwriteConfig, storage, tablesDB } from "./appwrite";
import dummyData from "./data";

interface Category {
  name: string;
  description: string;
}

interface Customization {
  name: string;
  price: number;
  type: "topping" | "side" | "size" | "crust" | string;
}

interface MenuItem {
  name: string;
  description: string;
  image_url: string;
  price: number;
  rating: number;
  calories: number;
  protein: number;
  category_name: string;
  customizations: string[];
}

interface DummyData {
  categories: Category[];
  customizations: Customization[];
  menu: MenuItem[];
}

const data = dummyData as DummyData;

// ------------------ Clear all rows ------------------
async function clearAll(tableId: string): Promise<void> {
  const PAGE = 100;
  let offset = 0;

  while (true) {
    const res: any = await tablesDB.listRows({
      databaseId: appwriteConfig.databaseId,
      tableId,
      queries: [Query.limit(PAGE), Query.offset(offset)],
    });

    const rows = res.rows ?? [];
    if (!rows.length) break;

    await Promise.all(
      rows.map((r: any) =>
        tablesDB.deleteRow({
          databaseId: appwriteConfig.databaseId,
          tableId,
          rowId: r.$id,
        })
      )
    );

    if (rows.length < PAGE) break;
    offset += rows.length;
  }
}

// ------------------ Clear storage ------------------
async function clearStorage(): Promise<void> {
  const PAGE = 100;
  let offset = 0;

  while (true) {
    const list: any = await storage.listFiles({
      bucketId: appwriteConfig.bucketId,
      queries: [Query.limit(PAGE), Query.offset(offset)],
    });

    const files = list.files ?? [];
    if (!files.length) break;

    await Promise.all(
      files.map((f: any) =>
        storage.deleteFile({ bucketId: appwriteConfig.bucketId, fileId: f.$id })
      )
    );

    if (files.length < PAGE) break;
    offset += files.length;
  }
}

// ------------------ Upload image ------------------
export async function uploadImageToStorage(imageUrl: string) {
  // Fetch remote image as blob
  const response = await fetch(imageUrl);
  const blob = await response.blob();

  // Extract filename
  const filename = imageUrl.split("/").pop() || `file-${Date.now()}.jpg`;

  // Create Appwrite file object
  const fileForUpload = {
    file: blob, // raw blob works in RN SDK
    name: filename,
    uri: imageUrl,
    size: blob.size, // required
    type: blob.type || "image/jpeg",
  };

  // Upload to Appwrite Storage
  const fileResponse: any = await storage.createFile({
    bucketId: appwriteConfig.bucketId,
    fileId: ID.unique(),
    file: fileForUpload,
  });

  // Get view URL
  const viewUrl = `${appwriteConfig.endpoint.replace(/\/v1$/, "")}/v1/storage/buckets/${appwriteConfig.bucketId}/files/${fileResponse.$id}/view?project=${appwriteConfig.projectId}`;

  return { fileId: fileResponse.$id, url: viewUrl };
}

// ------------------ Seed ------------------
export default async function seed(): Promise<void> {
  console.log("🧹 Clearing tables and storage...");
  await clearAll(appwriteConfig.categoriesId);
  await clearAll(appwriteConfig.customizationsId);
  await clearAll(appwriteConfig.menuId);
  await clearAll(appwriteConfig.menuCustomizationsId);
  await clearStorage();

  // ------------------ Create categories ------------------
  const categoryMap: Record<string, string> = {};
  for (const cat of data.categories) {
    const res: any = await tablesDB.createRow({
      databaseId: appwriteConfig.databaseId,
      tableId: appwriteConfig.categoriesId,
      rowId: ID.unique(),
      data: { name: cat.name, description: cat.description },
    });
    categoryMap[cat.name] = res.$id;
  }

  // ------------------ Create customizations ------------------
  const customizationMap: Record<string, string> = {};
  for (const cus of data.customizations) {
    const res: any = await tablesDB.createRow({
      databaseId: appwriteConfig.databaseId,
      tableId: appwriteConfig.customizationsId,
      rowId: ID.unique(),
      data: { name: cus.name, price: cus.price, type: cus.type },
    });
    customizationMap[cus.name] = res.$id;
  }

  // ------------------ Create menu items ------------------
  const menuMap: Record<string, string> = {};
  for (const item of data.menu) {
    const uploaded = await uploadImageToStorage(item.image_url);
    const categoryId = categoryMap[item.category_name];
    if (!categoryId) {
      console.warn(
        `Category "${item.category_name}" not found for menu item "${item.name}". Skipping item.`
      );
      continue;
    }

    const res: any = await tablesDB.createRow({
      databaseId: appwriteConfig.databaseId,
      tableId: appwriteConfig.menuId,
      rowId: ID.unique(),
      data: {
        name: item.name,
        description: item.description,
        image_url: uploaded.url,
        price: item.price,
        rating: item.rating,
        calories: item.calories,
        protein: item.protein,
        categories: categoryMap[item.category_name],
      },
    });

    menuMap[item.name] = res.$id;

    // ------------------ Menu customizations ------------------
    for (const cusName of item.customizations) {
      const cusId = customizationMap[cusName];
      if (!cusId) {
        console.warn(
          `Skipping customization "${cusName}" — not found in customizationMap.`
        );
        continue;
      }

      try {
        await tablesDB.createRow({
          databaseId: appwriteConfig.databaseId,
          tableId: appwriteConfig.menuCustomizationsId,
          rowId: ID.unique(),
          data: {
            menu: res.$id,
            customizations: cusId,
          },
        });
      } catch (err) {
        console.error(
          `Failed to create menu_customization for ${item.name} -> ${cusName}:`,
          err
        );
      }
    }
  }

  console.log("✅ Seeding complete.");
}
