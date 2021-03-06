import Router, { RouterContext } from "koa-router";
import { Storage } from "../modules/storage";
import type { State, Tools } from "../router";
import { encodeRFC5987ValueChars } from "../utils";
import path from "path";
import * as yup from "yup";
import { filenameScheme, usernameScheme } from "./user";
import { Users } from "../modules/user";

const inlineWhiteList = ["application/pdf"];

async function sendFile(ctx: RouterContext<State, Tools>, filepath: string) {
  const stat = await Storage.statFile(filepath);
  const filename = path.basename(filepath);

  let contentType = stat.metaData.contenttype || "application/octet-stream";
  let disposition = "attachment";

  if (contentType.startsWith("text/")) contentType = "text/plain";

  if (
    contentType.startsWith("video/") ||
    contentType.startsWith("audio/") ||
    contentType.startsWith("image/") ||
    contentType.startsWith("text/") ||
    inlineWhiteList.indexOf(contentType) > -1
  ) {
    disposition = "inline";
  }

  const rg = ctx.request.get("Range");
  if (rg) {
    const range = [0, stat.size - 1, stat.size];
    if (rg && rg.startsWith("bytes=")) {
      const [st, ed] = rg.slice(6).split("-");
      if (st) range[0] = Number(st);
      if (ed) range[1] = Number(ed);
    }

    if (
      isNaN(range[0]) ||
      isNaN(range[1]) ||
      range[0] < 0 ||
      range[1] >= stat.size ||
      range[0] > range[1]
    ) {
      ctx.response.status = 416;
      ctx.response.set("Content-Range", `bytes */${range[2]}`);
      return;
    }

    const stream = await Storage.readFilePartial(
      filepath,
      range[0],
      range[1] - range[0] + 1
    );

    ctx.response.status = 206;
    ctx.set("Content-Type", contentType);
    ctx.set("Content-Length", String(range[1] - range[0] + 1));
    ctx.set("Accept-Ranges", "bytes");
    ctx.set("Cache-Control", "max-age=31536000");
    ctx.set("Content-Range", `bytes ${range[0]}-${range[1]}/${range[2]}`);
    ctx.response.body = stream;
  } else {
    const stream = await Storage.readFile(filepath);

    ctx.response.status = 200;
    ctx.response.set("Content-Type", contentType);
    ctx.response.set("Content-Length", String(stat.size));
    ctx.response.set("Accept-Ranges", "bytes");
    ctx.response.set("Cache-Control", "max-age=31536000");
    ctx.response.set(
      "Content-Disposition",
      disposition + "; filename*=UTF-8''" + encodeRFC5987ValueChars(filename)
    );
    ctx.response.body = stream;
  }
}

const router = new Router<State, Tools>();

const getUserFileScheme = yup.object({
  username: usernameScheme.required(),
  filename: filenameScheme.required(),
});

router.get("/user/:username/:filename", async (ctx) => {
  const { username, filename } = await getUserFileScheme.validate(ctx.params);

  await Users.visibleToUser(username, filename, ctx.state.username);

  await sendFile(ctx, Users.getFilepath(username, filename));
});

export default router;
