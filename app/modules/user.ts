import db from "../db";
import { EmptyResult, randomString, Result } from "../utils";

export type UserPasswordDoc = {
  username: string;
  password: string;
};

export type UserProfileDoc = {
  username: string;
  email: string;
};

export type UserSessionDoc = {
  username: string;
  cookie: string;
  expires: Date;
};

const collPassword = db.collection<UserPasswordDoc>("user/password");
const collProfile = db.collection<UserProfileDoc>("user/profile");
const collSession = db.collection<UserSessionDoc>("user/session");

export class Users {
  static async addUser(
    username: string,
    password: string,
    email: string
  ): Promise<Result<UserProfileDoc>> {
    const find = await collPassword.findOne({ username });
    if (find) return "user/exist";

    const result1 = await collPassword.insertOne({ username, password });
    if (!result1.insertedId) return "core/database_panicked";

    const profile = { username, email };
    const result2 = await collProfile.insertOne(profile);
    if (!result2.insertedId) return "core/database_panicked";

    return profile;
  }

  static async getUserProfile(
    username: string
  ): Promise<Result<UserProfileDoc>> {
    const result = await collProfile.findOne({ username });
    if (!result) return "core/database_panicked";

    return result;
  }

  static async verifyUser(
    username: string,
    password: string
  ): Promise<Result<UserProfileDoc>> {
    const find = await collPassword.findOne({ username });
    if (!find) return "user/not_exist";

    if (find.password !== password) return "user/password_wrong";

    return this.getUserProfile(username);
  }

  static async deleteUser(username: string): Promise<EmptyResult> {
    await collPassword.deleteOne({ username });
    await collProfile.deleteOne({ username });
    await collSession.deleteOne({ username });

    return;
  }

  static async findCookie(cookie: string): Promise<string | undefined> {
    const find = await collSession.findOne({ cookie });
    if (!find) return;

    if (find.expires < new Date()) {
      await collSession.deleteOne(find);
      return;
    }

    return find.username;
  }

  static async issueCookie(
    username: string,
    expires: Date
  ): Promise<string | undefined> {
    const cookie = randomString(36);

    const result = await collSession.findOneAndUpdate(
      { username },
      {
        $set: { expires, cookie },
      },
      { upsert: true }
    );

    if (!result.ok) return;

    return cookie;
  }
}
