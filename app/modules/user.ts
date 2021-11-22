import db from "../db";
import { assert, HTTPError, randomString } from "../utils";
import type { File } from "formidable";
import { Storage } from "./storage";
import mimeTypes from "mime-types";

export type UserPasswordDoc = {
  _id: string;
  password: string;
};

export type UserProfileDoc = {
  _id: string;
  email: string;
  nickname: string;
  avatar: string;
};

export type UserProfileMutableData = Partial<
  Pick<UserProfileDoc, "email" | "avatar" | "nickname">
>;

export type UserSessionDoc = {
  _id: string;
  userId: string;
  expires: number;
  userAgent: string;
  lastActive: number;
};

export type UserFileDoc = {
  userId: string;
  filename: string;
  size: number;
  created: number;
  updated: number;
  private: boolean;
};

const collPassword = db.collection<UserPasswordDoc>("user/password");
const collProfile = db.collection<UserProfileDoc>("user/profile");
const collSession = db.collection<UserSessionDoc>("user/session");
const collFiles = db.collection<UserFileDoc>("user/files");

await collFiles.createIndex(
  {
    userId: 1,
    filename: 1,
  },
  {
    unique: true,
  }
);

/**
 * User abstractions
 */
export class Users {
  /**
   * Sign up a new user
   */
  static async addUser(
    username: string,
    password: string
  ): Promise<UserProfileDoc> {
    const find = await collPassword.findOne({ _id: username });
    if (find) {
      throw new HTTPError(400, "user/exist");
    }

    const result1 = await collPassword.insertOne({ _id: username, password });
    assert(result1.acknowledged);

    const profile: UserProfileDoc = {
      _id: username,
      email: "",
      nickname: "",
      avatar: "",
    };
    const result2 = await collProfile.insertOne(profile);
    assert(result2.acknowledged);

    return profile;
  }

  /**
   * Get a user's profile.
   */
  static async getUserProfile(username: string): Promise<UserProfileDoc> {
    const result = await collProfile.findOne({ _id: username });
    if (!result) {
      throw new HTTPError(404, "user/not_exist");
    }

    return result;
  }

  /**
   * Change user's profile
   */
  static async changeUserProfile(
    username: string,
    profile: UserProfileMutableData
  ): Promise<UserProfileDoc> {
    const result = await collProfile.findOneAndUpdate(
      { _id: username },
      { $set: profile },
      { returnDocument: "after" }
    );
    assert(result.ok && result.value);

    return result.value;
  }

  /**
   * Verify if the user's password is correct.
   */
  static async verifyUser(username: string, password: string): Promise<void> {
    const find = await collPassword.findOne({ _id: username });
    if (!find) {
      throw new HTTPError(404, "user/not_exist");
    }
    if (find.password !== password) {
      throw new HTTPError(400, "user/password_wrong");
    }
  }

  /**
   * Find if a cookie reflects to someone
   * @returns username or null
   */
  static async findSession(session: string): Promise<string | null> {
    const find = await collSession.findOneAndUpdate(
      {
        _id: session,
        expires: { $gte: Date.now() },
      },
      {
        $set: {
          lastActive: Date.now(),
        },
      },
      { upsert: false }
    );

    return find.ok && find.value ? find.value.userId : null;
  }

  /**
   * Start a new session of userId
   */
  static async startSession(
    userId: string,
    expires: number,
    userAgent: string
  ): Promise<string> {
    const session = randomString(32);

    const result = await collSession.insertOne({
      _id: session,
      userId,
      expires,
      userAgent,
      lastActive: Date.now(),
    });

    assert(result.acknowledged);

    return session;
  }

  /**
   * Get all sessions
   */
  static async getAllSessions(userId: string): Promise<UserSessionDoc[]> {
    return await collSession.find({ userId }).sort("lastActive", -1).toArray();
  }

  /**
   * delete one session (or just sign out)
   */
  static async deleteSession(session: string): Promise<void> {
    await collSession.deleteOne({ _id: session });
  }

  static getFilepath(userId: string, filename: string) {
    return `/user/${userId}/${filename}`;
  }

  /**
   * Modify a file (or create one if not exists)
   */
  static async createPrivateFile(userId: string, filename: string, file: File) {
    const filepath = this.getFilepath(userId, filename);
    const mimetype =
      file.type || mimeTypes.lookup(filename) || "application/octet-stream";

    await Storage.writeFile(filepath, file.path, {
      contenttype: mimetype,
    });

    const res = await collFiles.findOneAndUpdate(
      {
        userId,
        filename,
      },
      {
        $set: {
          size: file.size,
          updated: Date.now(),
        },
        $setOnInsert: {
          created: Date.now(),
          private: true,
        },
      },
      {
        upsert: true,
        returnDocument: "after",
      }
    );
    assert(res.ok && res.value);

    return res.value;
  }

  /**
   * Remove private file (throws if not exist)
   */
  static async removePrivateFile(userId: string, filename: string) {
    const result = await collFiles.findOneAndDelete({ userId, filename });
    assert(result.ok);

    if (!result.value) {
      throw new HTTPError(404, "user/file_not_found");
    }

    const filepath = this.getFilepath(
      result.value.userId,
      result.value.filename
    );
    await Storage.statFile(filepath);
    await Storage.removeFile(filepath);
  }

  /**
   * Get all files
   */
  static async getAllFiles(userId: string) {
    return await collFiles.find({ userId }).sort({ updated: -1 }).toArray();
  }

  /**
   * modify user file privacy
   */
  static async modifyPrivateFilePrivacy(
    userId: string,
    filename: string,
    priv: boolean
  ) {
    const result = await collFiles.findOneAndUpdate(
      {
        userId,
        filename,
      },
      {
        $set: {
          private: priv,
        },
      },
      {
        upsert: false,
        returnDocument: "after",
      }
    );

    assert(result.ok);

    if (!result.value) {
      throw new HTTPError(404, "user/file_not_found");
    }

    return result.value;
  }

  /**
   * Check a file is visible to target user
   */
  static async visibleToUser(
    userId: string,
    filename: string,
    targetUserId: string
  ) {
    const find = await collFiles.findOne({ userId, filename });
    if (!find) {
      throw new HTTPError(404);
    }

    if (targetUserId !== userId && find.private) {
      throw new HTTPError(403);
    }
  }
}
