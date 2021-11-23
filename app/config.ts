import fs from "fs/promises";
import { constants } from "fs";
import path from "path";
import logger from "./logger";
import * as yup from "yup";

const d = logger("config");

const configScheme = yup.object({
  mongo: yup
    .object({
      host: yup.string().default("localhost").required(),
      port: yup.number().integer().min(1).max(65525).default(27017).required(),
      dbname: yup.string().default("example").required(),
      username: yup.string().default("username").required(),
      password: yup.string().default("password").required(),
    })
    .required(),
  minio: yup
    .object({
      host: yup.string().default("localhost").required(),
      port: yup.number().integer().min(1).max(65525).default(9000).required(),
      root_user: yup.string().default("rootadmin").required(),
      root_password: yup.string().default("rootadmin").required(),
      bucket: yup.string().default("example").required(),
      region: yup.string().default("cn-sd-1").required(),
    })
    .required(),
  port: yup.number().integer().min(1).max(65525).default(8080).required(),
  https: yup
    .object({
      enable: yup.boolean().default(false).required(),
      hsts: yup.boolean().default(true).required(),
      redirect: yup.boolean().default(true).required(),
      key: yup.string().default("localhost-key.pem").required(),
      cert: yup.string().default("localhost.pem").required(),
    })
    .required(),
  cors: yup
    .object({
      enable: yup.boolean().default(true).required(),
      host: yup.string().default("http://localhost:8080").required(),
    })
    .required(),
  csp: yup.boolean().default(true).required(),
  maxFileSize: yup.number().integer().positive().default(20000000).required(),
});

export type Config = yup.Asserts<typeof configScheme>;

let defaultPath = "config.json";
const pos = process.argv.indexOf("-c");
if (pos > -1 && pos + 1 < process.argv.length) {
  defaultPath = process.argv[pos + 1];
}

const configPath = path.resolve(process.cwd(), defaultPath);

let myconfig: Config;

async function generateDefaultConfig() {
  d.info(`Generating default config file to ${configPath}`);

  try {
    await fs.access(configPath, constants.R_OK);
    d.error("File already exists, overriding is unpermitted");
    process.exit(1);
  } catch (e) {
    // ignore
  }

  try {
    await fs.writeFile(
      configPath,
      JSON.stringify(configScheme.getDefault(), null, 2)
    );
    d.info(`Successfully written to file, please edit it`);
  } catch (e) {
    d.error(`Unable to write, please check your permission`);
    process.exit(1);
  }
}

if (process.argv.indexOf("--generate") > -1) {
  await generateDefaultConfig();
  process.exit(0);
}

try {
  await fs.access(configPath, constants.R_OK);
} catch (e) {
  d.error(`Could not found config file in ${configPath}`);
  d.error("To generate a default one, please consider using --generate");

  process.exit(1);
}

d.info(`Reading config file from ${configPath}`);

try {
  const config = JSON.parse(await fs.readFile(configPath, "utf8"));
  myconfig = await configScheme.validate(config, { strict: true });
} catch (e) {
  if (e instanceof yup.ValidationError) {
    d.error(`Config file validation failed: ${e.message}`);
  } else {
    d.error("Error while reading config file");
    d.error(String(e));
  }
  process.exit(1);
}

if (process.env.TESTING) {
  d.info("Running in Testing mode");
  myconfig.mongo.dbname = "testing";
  myconfig.minio.bucket = "testing";
}

export default myconfig;
