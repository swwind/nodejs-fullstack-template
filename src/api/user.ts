import { APICore } from "./utils";
import type {
  UserFileDoc,
  UserProfileDoc,
  UserProfileMutableData,
  UserSessionDoc,
} from "../../app/modules/user";

export function createUserAPI(core: APICore) {
  return {
    signIn(username: string, password: string) {
      return core.makePOSTRequest<UserProfileDoc>("/user/signin", {
        username,
        password,
      });
    },

    signUp(username: string, password: string) {
      return core.makePOSTRequest<UserProfileDoc>("/user/signup", {
        username,
        password,
      });
    },

    getAllSessions() {
      return core.makeGETRequest<UserSessionDoc[]>("/user/session");
    },

    deleteSession(session: string) {
      return core.makeDELETERequest(`/user/session/${session}`);
    },

    signOut() {
      return core.makeDELETERequest("/user/signout");
    },

    getProfile() {
      return core.makeGETRequest<UserProfileDoc | null>("/user/profile");
    },

    getUserProfile(username: string) {
      return core.makeGETRequest<UserProfileDoc>(`/user/profile/${username}`);
    },

    modifyProfile(data: UserProfileMutableData) {
      return core.makePATCHRequest<UserProfileDoc>("/user/profile", data);
    },

    uploadFile(filename: string, file: File, callback: (e: any) => void) {
      const formdata = new FormData();
      formdata.append("file", file);
      return core.makeMultipartRequest<UserFileDoc>(
        `/user/file/${encodeURIComponent(filename)}`,
        formdata,
        callback,
        "PUT"
      );
    },

    removeFile(filename: string) {
      return core.makeDELETERequest(
        `/user/file/${encodeURIComponent(filename)}`
      );
    },

    modifyFilePrivacy(filename: string, priv: boolean) {
      return core.makePATCHRequest<UserFileDoc>(
        `/user/file/${encodeURIComponent(filename)}`,
        {
          private: priv,
        }
      );
    },

    getAllFiles() {
      return core.makeGETRequest<UserFileDoc[]>(`/user/file`);
    },
  };
}
