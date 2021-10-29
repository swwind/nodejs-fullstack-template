/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prettier/prettier */
import { Errors } from "./errors";
import crypto from "crypto";

export type Err = { error: Errors; ok: false };
export type Result<T> = Err | { result: T; ok: true };
export type EmptyResult = Err | undefined;

export function ok<T>(result: T): Result<T> {
  return { result, ok: true };
}
export function err(error: Errors): Err {
  return { error, ok: false };
}

export function randomString(length: number) {
  return crypto.randomBytes(length).toString("hex");
}

export const and = <T> (f: (t: T) => boolean, g: (t: T) => boolean) => (t: T) => f(t) && g(t);
export const not = <T> (fn: (t: T) => boolean) => (x: T) => !fn(x);
export const is = (type: string) => (x: any) => typeof x === type;
export const any = <T> (fn: (t: T) => boolean) => (a: T[]) => a.filter(fn).length > 0;

export enum Types {
  String,
  Number,
  StringArray,
  NumberArray,
}

export function validator(type: Types) {
  switch (type) {
    case Types.String:      return is("string");
    case Types.Number:      return is("number");
    case Types.StringArray: return and(Array.isArray, not(any(not(is("string")))));
    case Types.NumberArray: return and(Array.isArray, not(any(not(is("number")))));
  }
}

export function getStatus(error: Errors): number {
  switch (error) {
    case "core/database_panicked":     return 500;
    case "core/internal_server_error": return 500;
    case "common/wrong_arguments":     return 400;
    case "user/not_exist":             return 403;
    case "user/exist":                 return 403;
    case "user/login_required":        return 401;
    case "user/logout_required":       return 403;
    case "user/password_wrong":        return 403;
    case "user/permission_denied":     return 403;
  }
}
