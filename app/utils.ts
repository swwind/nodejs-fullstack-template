import { Errors } from "./errors";
import crypto from 'crypto';

export type Result<T> = Errors | T;
export type EmptyResult = Errors | undefined;

export function randomString(length: number) {
  return crypto.randomBytes(length).toString('hex');
}

export function getStatus(error: Errors) {
  switch (error) {
    case "core/database_panicked": return 500;
    case "core/internal_server_error": return 500;
    case "common/wrong_arguments": return 400;
    case "user/not_exist":         return 403;
    case "user/exist":             return 403;
    case "user/login_required":    return 401;
    case "user/logout_required":   return 403;
    case "user/password_wrong":    return 403;
    case "user/permission_denied": return 403;
  }
  return 500;
}