import { IMiddleware } from "koa-router";
import { State, Tools } from "../router";
import { HTTPError } from "../utils";

/**
 * ensure the user is logged in
 */
export const ensureUser: IMiddleware<State, Tools> = async (ctx, next) => {
  if (!ctx.state.username) {
    throw new HTTPError(401, "user/login_required");
  }
  await next();
};

/**
 * ensure the user is not logged in
 */
export const ensureGuest: IMiddleware<State, Tools> = async (ctx, next) => {
  if (ctx.state.username) {
    throw new HTTPError(403, "user/logout_required");
  }
  await next();
};
