import { APICore } from "./utils";
import type { UserProfileDoc } from "../../app/modules/user";

export function createUserAPI(core: APICore) {
  return {
    whoami() {
      return core.makePOSTRequest<UserProfileDoc>("/whoami");
    },

    signIn(username: string, password: string) {
      return core.makePOSTRequest<UserProfileDoc>("/signin", {
        username,
        password,
      });
    },

    signUp(username: string, password: string, email: string) {
      return core.makePOSTRequest<UserProfileDoc>("/signup", {
        username,
        password,
        email,
      });
    },
  };
}
