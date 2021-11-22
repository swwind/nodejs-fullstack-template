import { MongoClient } from "mongodb";
import config from "./config";
import logger from "./logger";

const d = logger("mongodb");

const mongourl = `mongodb://${config.mongo.username}${
  config.mongo.password && `:${encodeURIComponent(config.mongo.password)}`
}${config.mongo.username || config.mongo.password ? "@" : ""}${
  config.mongo.host
}:${config.mongo.port}/${process.env.MONGO_AUTH_SOURCE ?? config.mongo.dbname}`;

let client: MongoClient;

try {
  client = await MongoClient.connect(mongourl);
} catch (e) {
  d.error("Error while connecting to MongoDB");
  d.error(String(e));
  process.exit(1);
}

const db = client.db(config.mongo.dbname);

d.info("mongodb connected");

/**
 * for testing only
 */
export async function dropDatabase() {
  if (!process.env.TESTING) {
    throw new Error("You should not drop database here!");
  }
  return await db.dropDatabase();
}

export async function stopMongoDB() {
  await client.close();
}

export default db;
