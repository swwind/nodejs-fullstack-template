/* eslint-disable @typescript-eslint/no-explicit-any */
import Router from "koa-router";
import type { File } from "formidable";
import { Users } from "./modules/user";
import { HTTPError } from "./utils";

import user from "./routes/user";
import storage from "./routes/storage";
import { ValidationError } from "yup";

export type State = {
  username: string;
};

export type { File };

export type Tools = {
  /**
   * End the request and return the following data
   */
  end<T>(status: number, data?: T): void;
  /**
   * Get one file from 'file' field
   */
  file(): File;
  /**
   * Get all files from 'file' field
   */
  files(): File[];
};

const router = new Router<State, Tools>();

router.use("/", async (ctx, next) => {
  ctx.state.username = "";

  const auth = ctx.cookies.get("auth");
  if (typeof auth === "string") {
    const username = await Users.findSession(auth);
    if (typeof username === "string") {
      ctx.state.username = username;
    }
  }

  ctx.end = <T>(status: number, data?: T) => {
    ctx.response.status = status;
    if (undefined === data) {
      ctx.response.set("Content-Type", "text/plain");
      ctx.response.body = "";
    } else {
      ctx.response.set("Content-Type", "application/json");
      ctx.response.body = JSON.stringify(data);
    }
  };

  ctx.file = () => {
    const file = ctx.request.files?.["file"];
    if (!file) {
      throw new HTTPError(400, "common/file_missing");
    }
    return Array.isArray(file) ? file[0] : file;
  };

  ctx.files = () => {
    const file = ctx.request.files?.["file"];
    if (!file) {
      throw new HTTPError(400, "common/file_missing");
    }
    return Array.isArray(file) ? file : [file];
  };

  try {
    await next();
  } catch (e) {
    if (e instanceof HTTPError) {
      ctx.end(e.status, e.error ? { error: e.error } : undefined);
      return;
    }

    if (e instanceof ValidationError) {
      ctx.end(400, { error: "common/wrong_arguments", message: e.message });
      return;
    }

    ctx.end(500, { error: "core/internal_server_error" });
  }
});

router.use("/api/user", user.routes(), user.allowedMethods());
router.use("/fs", storage.routes(), storage.allowedMethods());

export default router;
