import { BucketItem, BucketItemStat, Client } from "minio";
import config from "./config";
import { Readable } from "stream";
import logger from "./logger";

const d = logger("minio");

const minioClient = new Client({
  endPoint: config.minio.host,
  port: config.minio.port,
  useSSL: false,
  accessKey: config.minio.root_user,
  secretKey: config.minio.root_password,
});

try {
  const exists = await minioClient.bucketExists(config.minio.bucket);
  if (!exists) {
    d.warn(
      `bucket \`${config.minio.bucket}' does not exist, trying to create one`
    );
    await minioClient.makeBucket(config.minio.bucket, config.minio.region);
    d.warn(`new bucket \`${config.minio.bucket}' created`);
  }

  d.info("minio connected");
} catch (e) {
  d.error("Error while initializing MinIO");
  d.error(String(e));
  process.exit(1);
}

export type IMetadata = Partial<{
  contenttype: string;
}>;

/**
 * Write a file into storage
 */
export function writeFile(
  filename: string,
  file: string | Buffer | Readable,
  meta: IMetadata = {}
) {
  d.debug(`write file ${filename}`);
  if (typeof file === "string") {
    return minioClient.fPutObject(config.minio.bucket, filename, file, meta);
  }
  return minioClient.putObject(config.minio.bucket, filename, file, meta);
}

/**
 * Returns a file into storage
 */
export function readFile(filename: string) {
  d.debug(`read file ${filename}`);
  return minioClient.getObject(config.minio.bucket, filename);
}

export type MyBucketItem = Omit<BucketItemStat, "metaData"> & {
  metaData: IMetadata;
};

/**
 * Stat a file in storage
 */
export function statFile(filename: string): Promise<MyBucketItem> {
  d.debug(`stat file ${filename}`);
  return minioClient.statObject(config.minio.bucket, filename);
}

/**
 * Remove file(s) in storage
 */
export function removeFile(filename: string | string[]) {
  if (Array.isArray(filename)) {
    d.debug(`remove file [${filename.join(", ")}]`);
    return minioClient.removeObjects(config.minio.bucket, filename);
  } else {
    d.debug(`remove file ${filename}`);
    return minioClient.removeObject(config.minio.bucket, filename);
  }
}

/**
 * Read partial file
 */
export function readFilePartial(
  filename: string,
  start: number,
  length: number
) {
  d.debug(`read file ${filename} from ${start} to ${start + length - 1}`);
  return minioClient.getPartialObject(
    config.minio.bucket,
    filename,
    start,
    length
  );
}

export async function clearBucket() {
  if (!process.env.TESTING) {
    throw new Error("Can not remove bucket without Testing mode");
  }
  const items = await new Promise<BucketItem[]>((resolve) => {
    const stream = minioClient.listObjectsV2(config.minio.bucket, "", true, "");
    const result: BucketItem[] = [];
    stream.on("data", (obj) => result.push(obj));
    stream.on("end", () => resolve(result));
  });
  await minioClient.removeObjects(
    config.minio.bucket,
    items.map((item) => item.name)
  );
}
