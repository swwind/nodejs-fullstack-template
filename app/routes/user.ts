import Router from "koa-router";
import { Users } from "../modules/user";
import { State, Tools } from "../router";

const router = new Router<State, Tools>();

router.post("/whoami", async (ctx) => {
  if (!ctx.state.username) return ctx.fail("user/login_required");

  const profile = await Users.getUserProfile(ctx.state.username);
  if (typeof profile === "string") return ctx.fail(profile);

  ctx.end(200, profile);
});

router.post("/signin", async (ctx) => {
  if (ctx.state.username) return ctx.fail("user/logout_required");

  const { username, password } = ctx.getBody({
    username: "",
    password: "",
  });

  if (!username || !password) return ctx.fail("common/wrong_arguments");

  const profile = await Users.verifyUser(username, password);
  if (typeof profile === "string") return ctx.fail(profile);

  // issue a cookie for a month
  const expires = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
  const cookie = await Users.issueCookie(username, expires);
  if (!cookie) return ctx.fail("core/database_panicked");
  ctx.cookies.set("auth", cookie, {
    httpOnly: true,
    expires,
  });

  ctx.end(200, profile);
});

router.post("/signup", async (ctx) => {
  if (ctx.state.username) return ctx.fail("user/logout_required");

  const { username, password, email } = ctx.getBody({
    username: "",
    password: "",
    email: "",
  });

  if (!username || !password || !email)
    return ctx.fail("common/wrong_arguments");

  const profile = await Users.addUser(username, password, email);
  if (typeof profile === "string") return ctx.fail(profile);

  // issue a cookie for a month
  const expires = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
  const cookie = await Users.issueCookie(username, expires);
  if (!cookie) return ctx.fail("core/database_panicked");
  ctx.cookies.set("auth", cookie, {
    httpOnly: true,
    expires,
  });

  ctx.end(200, profile);
});

export default router;
