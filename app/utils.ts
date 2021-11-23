import crypto from "crypto";
import { Errors } from "./errors";

export class HTTPError {
  status: number;
  error: Errors | "";
  constructor(status: number, error?: Errors) {
    this.status = status;
    this.error = error ?? "";
  }
}

export function randomString(length: number) {
  return crypto.randomBytes(length).toString("hex");
}

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent
 */
export function encodeRFC5987ValueChars(str: string) {
  return (
    encodeURIComponent(str)
      // Note that although RFC3986 reserves "!", RFC5987 does not,
      // so we do not need to escape it
      .replace(/['()]/g, escape) // i.e., %27 %28 %29
      .replace(/\*/g, "%2A")
      // The following are not required for percent-encoding per RFC5987,
      // so we can allow for a little better readability over the wire: |`^
      .replace(/%(?:7C|60|5E)/g, unescape)
  );
}

export const languages = ["en-US", "zh-CN"];

/**
 * Asserts and throw internal server error
 */
export function assert<T>(check: T): asserts check {
  if (!check) {
    throw new HTTPError(500, "core/internal_server_error");
  }
}
