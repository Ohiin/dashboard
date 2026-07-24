import { openDB, type DBSchema, type IDBPDatabase } from "idb";

interface FileRecord {
  id: string; // `${widgetId}:${fileName}:${timestamp}`
  widgetId: string;
  name: string;
  type: string;
  blob: Blob;
  createdAt: number;
}

interface DashboardDB extends DBSchema {
  files: {
    key: string;
    value: FileRecord;
    indexes: { "by-widget": string };
  };
}

let dbPromise: Promise<IDBPDatabase<DashboardDB>> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<DashboardDB>("dashboard-db", 1, {
      upgrade(db) {
        const store = db.createObjectStore("files", { keyPath: "id" });
        store.createIndex("by-widget", "widgetId");
      },
    });
  }
  return dbPromise;
}

export async function saveFile(widgetId: string, name: string, blob: Blob): Promise<string> {
  const db = await getDB();
  const id = `${widgetId}:${name}:${Date.now()}`;
  await db.put("files", {
    id,
    widgetId,
    name,
    type: blob.type,
    blob,
    createdAt: Date.now(),
  });
  return id;
}

export async function getFile(id: string): Promise<FileRecord | undefined> {
  const db = await getDB();
  return db.get("files", id);
}

export async function getFilesForWidget(widgetId: string): Promise<FileRecord[]> {
  const db = await getDB();
  return db.getAllFromIndex("files", "by-widget", widgetId);
}

export async function deleteFile(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("files", id);
}

// Purge ALL files belonging to a widget — called whenever a widget is removed
// from the grid so IndexedDB never accumulates orphaned blobs.
export async function purgeWidgetFiles(widgetId: string): Promise<void> {
  const db = await getDB();
  const tx = db.transaction("files", "readwrite");
  const index = tx.store.index("by-widget");
  let cursor = await index.openCursor(IDBKeyRange.only(widgetId));
  while (cursor) {
    await cursor.delete();
    cursor = await cursor.continue();
  }
  await tx.done;
}
