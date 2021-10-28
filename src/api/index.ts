import { createAPICore } from "./utils";
import { createUserAPI } from "./user";

export function createAPI(cookie?: string, host?: string) {
  const core = createAPICore(cookie, host);

  return {
    user: createUserAPI(core),
  };
}

export type API = ReturnType<typeof createAPI>;
