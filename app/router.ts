/* eslint-disable @typescript-eslint/no-explicit-any */
import Router from "koa-router";
import { Errors } from "./errors";
import { Users } from "./modules/user";
import { getStatus } from "./utils";

import user from "./routes/user";

export type State = {
  username: string;
};

const and = <T> (f: (t: T) => boolean, g: (t: T) => boolean) => (t: T) => f(t) && g(t);
const not = <T> (fn: (t: T) => boolean) => (x: T) => !fn(x);
const is = (type: string) => (x: any) => typeof x === type;
const any = <T> (fn: (t: T) => boolean) => (a: T[]) => a.filter(fn).length > 0;

export enum Types {
  String,
  Number,
  StringArray,
  NumberArray,
}

function validator(type: Types) {
  switch (type) {
    case Types.String: return is('string');
    case Types.Number: return is('number');
    case Types.StringArray: return and(Array.isArray, not(any(not(is('string')))));
    case Types.NumberArray: return and(Array.isArray, not(any(not(is('number')))));
  }
}

export type Tools = {
  end<T extends Record<string, unknown>>(status: number, data: T): void;
  fail(error: Errors): void;
  data: {
    param(name: string, type: Types.String): string | undefined;
    param(name: string, type: Types.Number): number | undefined;
    param(name: string, type: Types.StringArray): string[] | undefined;
    param(name: string, type: Types.NumberArray): number[] | undefined;
    query(name: string, type: Types.String): string | undefined;
    query(name: string, type: Types.Number): number | undefined;
    query(name: string, type: Types.StringArray): string[] | undefined;
    query(name: string, type: Types.NumberArray): number[] | undefined;
    body(name: string, type: Types.String): string | undefined;
    body(name: string, type: Types.Number): number | undefined;
    body(name: string, type: Types.StringArray): string[] | undefined;
    body(name: string, type: Types.NumberArray): number[] | undefined;
  }
};

const router = new Router<State, Tools>();


router.use("/", async (ctx, next) => {
  ctx.state.username = "";

  const auth = ctx.cookies.get("auth");
  if (typeof auth === "string") {
    const username = await Users.findCookie(auth);
    if (typeof username === "string") {
      ctx.state.username = username;
    }
  }

  ctx.end = <T>(status: number, data: T) => {
    ctx.response.status = status;
    ctx.response.set("Content-Type", "application/json");
    ctx.response.body = JSON.stringify(data);
  };

  ctx.fail = (error: Errors) => {
    ctx.response.status = getStatus(error);
    ctx.response.set("Content-Type", "text/plain");
    ctx.response.body = error;
  };

  function parse(body: any) {
    return (name: string, type: Types) => {
      const value = body?.[name];
      if (validator(type)(value)) {
        return value;        
      }
    }
  }

  ctx.data = {
    param: parse(ctx.params),
    query: parse(ctx.request.query),
    body: parse(ctx.request.body),
  };

  await next();
});

router.use("/api", user.routes(), user.allowedMethods());

export default router;
