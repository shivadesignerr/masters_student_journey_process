import { getDb } from "../src/lib/mongodb";

async function main() {
  try {
    const db = await getDb();
    console.log("Connected to MongoDB:", db.databaseName);
    const collections = await db.listCollections().toArray();
    console.log("Collections:", collections.map((c) => c.name));
    process.exit(0);
  } catch (err) {
    console.error("Connection failed:", err);
    process.exit(1);
  }
}

main();
