import { APICore } from "./utils";

export function createUserAPI(core: APICore) {

  return {

    whoami() {
      return core.makePOSTRequest<{}, {
        username: string;
        email: string;
      }>('/whoami');
    },

    signIn(username: string, password: string) {
      return core.makePOSTRequest<{
        username: string;
        password: string;
      }, {
        username: string;
        email: string;
      }>('/signin', { username, password });
    },

    signUp(username: string, password: string, email: string) {
      return core.makePOSTRequest<{
        username: string;
        password: string;
        email: string;
      }, {
        username: string;
        email: string;
      }>('/signup', { username, password, email });
    }
  }

}