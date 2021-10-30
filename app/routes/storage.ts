import Router, { RouterContext } from "koa-router";
import { Storage } from "../modules/storage";
import type { State, Tools } from "../router";
import { encodeRFC5987ValueChars, Types } from "../utils";
import path from "path";

const router = new Router<State, Tools>();

async function sendFile(ctx: RouterContext<State, Tools>, filename: string) {
  const stat = await Storage.statFile(filename);
  if (!stat.ok) return ctx.fail(stat.error);

  const stream = await Storage.readFile(filename);
  if (!stream.ok) return ctx.fail(stream.error);

  const contentType =
    stat.result.metaData.contenttype || "application/octet-stream";

  ctx.response.set("Content-Type", contentType);
  ctx.response.set(
    "Content-Disposition",
    "inline; filename*=UTF-8''" +
      encodeRFC5987ValueChars(
        stat.result.metaData.filename || path.basename(filename)
      )
  );
  ctx.response.status = 200;
  ctx.response.body = stream.result;
}

router.get("/user/:username/:uuid", async (ctx) => {
  if (!ctx.state.username) {
    return ctx.fail("user/login_required");
  }
  const username = ctx.data.param("username", Types.String) ?? "";
  const uuid = ctx.data.param("uuid", Types.String) ?? "";

  if (!username || !uuid) {
    return ctx.fail("common/wrong_arguments");
  }

  if (username !== ctx.state.username) {
    return ctx.fail("storage/permission_denied");
  }

  const filename = `/user/${username}/${uuid}`;

  await sendFile(ctx, filename);
});

export default router;
