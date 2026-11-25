import { MongoClient, Db, Collection } from "mongodb";

// Configure DNS to use public DNS servers if running in Node.js
// This prevents Windows local DNS querySrv ECONNREFUSED issues on mongodb+srv://
if (typeof window === "undefined") {
  try {
    const dns = require("dns");
    if (typeof dns.setServers === "function") {
      dns.setServers(["8.8.8.8", "1.1.1.1", "8.8.4.4"]);
    }
  } catch (e) {
    // ignore if running in edge or non-node
  }
}

const DEFAULT_URI =
  "mongodb+srv://shivamudhiraj2610_db_user:shiva1275@master-application-proc.nycldq6.mongodb.net/gvk_masters?retryWrites=true&w=majority";

const uri = process.env.MONGODB_URI || DEFAULT_URI;
const dbName = process.env.MONGODB_DB || "gvk_masters";

const options = {
  maxPoolSize: 10,
  minPoolSize: 2,
  serverSelectionTimeoutMS: 8000,
  connectTimeoutMS: 10000,
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

/**
 * Returns the connected MongoDB client instance.
 */
export async function getMongoClient(): Promise<MongoClient> {
  return clientPromise;
}

/**
 * Returns the database instance.
 */
export async function getDb(name: string = dbName): Promise<Db> {
  const client = await clientPromise;
  return client.db(name);
}

/**
 * Returns a typed collection from the database.
 */
export async function getCollection<T extends Document = any>(
  collectionName: string,
  databaseName: string = dbName
): Promise<Collection<any>> {
  const db = await getDb(databaseName);
  return db.collection(collectionName);
}

export default clientPromise;
