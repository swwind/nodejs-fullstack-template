import {
  writeFile as _writeFile,
  statFile as _statFile,
  readFile as _readFile,
  removeFile as _removeFile,
  readFilePartial as _readFilePartial,
  MyBucketItem,
  IMetadata,
} from "../minio";
import type { Readable } from "stream";

export class Storage {
  /**
   * Write file into storage
   */
  static async writeFile(
    filepath: string,
    file: string | Buffer | Readable,
    meta: IMetadata
  ): Promise<void> {
    await _writeFile(filepath, file, meta);
  }

  /**
   *
   * @param filepath
   */
  static async removeFile(filepath: string): Promise<void> {
    await _removeFile(filepath);
  }

  /**
   * Stat a file in storage
   */
  static async statFile(filepath: string): Promise<MyBucketItem> {
    return await _statFile(filepath);
  }

  /**
   * Read a file from storage, you must make sure it exists
   */
  static async readFile(filepath: string): Promise<Readable> {
    return await _readFile(filepath);
  }

  static async readFilePartial(
    filepath: string,
    start: number,
    length: number
  ): Promise<Readable> {
    return await _readFilePartial(filepath, start, length);
  }
}
