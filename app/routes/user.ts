import Router from "koa-router";
import { HTTPError } from "../utils";
import { Users } from "../modules/user";
import type { State, Tools } from "../router";
import { ensureGuest, ensureUser } from "./utils";
import * as yup from "yup";

const router = new Router<State, Tools>();

export const usernameScheme = yup.string().min(2).matches(/^\w+$/);
export const passwordScheme = yup.string().min(8).max(64);

const signinScheme = yup.object({
  username: usernameScheme.required(),
  password: passwordScheme.required(),
});

router.post("/signin", ensureGuest, async (ctx) => {
  const { username, password } = await signinScheme.validate(ctx.request.body);

  const userAgent = ctx.request.get("User-Agent");

  await Users.verifyUser(username, password);

  // issue a cookie for a month
  const expires = Date.now() + 1000 * 60 * 60 * 24 * 30;
  const cookie = await Users.startSession(username, expires, userAgent);
  ctx.cookies.set("auth", cookie, {
    httpOnly: true,
    expires: new Date(expires),
  });

  const profile = await Users.getUserProfile(username);

  ctx.end(200, profile);
});

const signupScheme = yup.object({
  username: usernameScheme.required(),
  password: passwordScheme.required(),
});

router.post("/signup", ensureGuest, async (ctx) => {
  const { username, password } = await signupScheme.validate(ctx.request.body);

  const userAgent = ctx.request.get("User-Agent");

  const profile = await Users.addUser(username, password);

  // issue a cookie for a month
  const expires = Date.now() + 1000 * 60 * 60 * 24 * 30;
  const cookie = await Users.startSession(username, expires, userAgent);
  ctx.cookies.set("auth", cookie, {
    httpOnly: true,
    expires: new Date(expires),
  });

  ctx.end(200, profile);
});

router.get("/session", ensureUser, async (ctx) => {
  const result = await Users.getAllSessions(ctx.state.username);

  ctx.end(200, result);
});

export const sessionScheme = yup.string().matches(/^[a-z0-9]{64}$/);

const deleteSessionScheme = yup.object({
  session: sessionScheme.required(),
});

router.delete("/session/:session", ensureUser, async (ctx) => {
  const { session } = await deleteSessionScheme.validate(ctx.params);

  const user = await Users.findSession(session);

  if (!user) {
    throw new HTTPError(404, "user/session_not_found");
  }

  if (user !== ctx.state.username) {
    throw new HTTPError(403, "user/permission_denied");
  }

  await Users.deleteSession(session);

  ctx.end(204);
});

router.delete("/signout", ensureUser, async (ctx) => {
  const session = ctx.cookies.get("auth") as string;

  await Users.deleteSession(session);

  ctx.end(204);
});

const getProfileScheme = yup.object({
  username: usernameScheme.required(),
});

router.get("/profile/:username", async (ctx) => {
  const { username } = await getProfileScheme.validate(ctx.params);

  const result = await Users.getUserProfile(username);

  ctx.end(200, result);
});

router.get("/profile", async (ctx) => {
  if (!ctx.state.username) {
    return ctx.end(200, null);
  }

  const profile = await Users.getUserProfile(ctx.state.username);

  ctx.end(200, profile);
});

export const emailScheme = yup.string().email();
export const nicknameScheme = yup.string();
export const avatarScheme = yup.string().url();

const patchProfileScheme = yup.object({
  email: emailScheme,
  nickname: nicknameScheme,
  avatar: avatarScheme,
});

router.patch("/profile", ensureUser, async (ctx) => {
  const data = patchProfileScheme.cast(ctx.request.body, {
    stripUnknown: true,
  });

  const profile = await Users.changeUserProfile(ctx.state.username, data);

  ctx.end(200, profile);
});

export const filenameScheme = yup.string();

const uploadFileScheme = yup.object({
  filename: filenameScheme.required(),
});

router.put("/file/:filename", ensureUser, async (ctx) => {
  const { filename: _filename } = await uploadFileScheme.validate(ctx.params);
  const filename = decodeURIComponent(_filename);

  const file = ctx.file();

  const result = await Users.createPrivateFile(
    ctx.state.username,
    filename,
    file
  );

  ctx.end(200, result);
});

export const privateScheme = yup.boolean();

const patchFileScheme = yup.object({
  private: privateScheme.required(),
});

router.patch("/file/:filename", ensureUser, async (ctx) => {
  const { filename: _filename } = await uploadFileScheme.validate(ctx.params);
  const filename = decodeURIComponent(_filename);

  const { private: priv } = await patchFileScheme.validate(ctx.request.body);

  const result = await Users.modifyPrivateFilePrivacy(
    ctx.state.username,
    filename,
    priv
  );

  ctx.end(200, result);
});

router.delete("/file/:filename", ensureUser, async (ctx) => {
  const { filename: _filename } = await uploadFileScheme.validate(ctx.params);
  const filename = decodeURIComponent(_filename);

  await Users.removePrivateFile(ctx.state.username, filename);

  ctx.end(204);
});

router.get("/file", ensureUser, async (ctx) => {
  const result = await Users.getAllFiles(ctx.state.username);

  ctx.end(200, result);
});

export default router;
