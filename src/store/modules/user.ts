import { AbstractGetter, ArgumentedActionContext as ActionContext } from "..";
import {
  UserFileDoc,
  UserProfileDoc,
  UserProfileMutableData,
  UserSessionDoc,
} from "../../../app/modules/user";
import { API } from "../../api";

export type State = {
  profile: UserProfileDoc | null;
  files: UserFileDoc[] | null;
  sessions: UserSessionDoc[] | null;
  upload_progress: number;
};

export type Getters<S = State> = {
  username(state: S): string | null;
};

export type Mutations<S = State> = {
  "user/update_profile"(state: S, payload: UserProfileDoc | null): void;
  "user/update_file"(state: S, payload: UserFileDoc[] | null): void;
  "user/delete_file"(state: S, payload: string): void;
  "user/insert_file"(state: S, payload: UserFileDoc): void;
  "user/update_session"(state: S, payload: UserSessionDoc[] | null): void;
  "user/delete_session"(state: S, payload: string): void;
  "user/upload_progress"(state: S, payload: number): void;
};

export type Actions<S = State, G extends AbstractGetter = Getters> = {
  "user/whoami"(actx: ActionContext<S, G>): Promise<boolean>;
  "user/signin"(
    actx: ActionContext<S, G>,
    payload: {
      username: string;
      password: string;
    }
  ): Promise<boolean>;
  "user/signup"(
    actx: ActionContext<S, G>,
    payload: {
      username: string;
      password: string;
    }
  ): Promise<boolean>;
  "user/fetch_files"(actx: ActionContext<S, G>): Promise<boolean>;
  "user/upload_file"(actx: ActionContext<S, G>, file: File): Promise<boolean>;
  "user/update_profile"(
    actx: ActionContext<S, G>,
    payload: UserProfileMutableData
  ): Promise<boolean>;
  "user/delete_file"(
    actx: ActionContext<S, G>,
    payload: string
  ): Promise<boolean>;
  "user/fetch_sessions"(actx: ActionContext<S, G>): Promise<boolean>;
  "user/delete_session"(
    actx: ActionContext<S, G>,
    session: string
  ): Promise<boolean>;
  "user/signout"(actx: ActionContext<S, G>): Promise<boolean>;
};

export function createUserModule(api: API) {
  const state = (): State => ({
    profile: null,
    files: null,
    sessions: null,
    upload_progress: 0,
  });

  const getters: Getters = {
    username(state) {
      return state.profile ? state.profile._id : null;
    },
  };

  const mutations: Mutations = {
    "user/update_profile"(state, payload) {
      state.profile = payload;
    },
    "user/update_file"(state, payload) {
      state.files = payload;
    },
    "user/delete_file"(state, payload) {
      if (state.files) {
        state.files = state.files.filter((file) => file.filename !== payload);
      }
    },
    "user/insert_file"(state, payload) {
      state.files?.unshift(payload);
    },
    "user/update_session"(state, payload) {
      state.sessions = payload;
    },
    "user/delete_session"(state, payload) {
      if (state.sessions) {
        state.sessions = state.sessions.filter(
          (session) => session._id !== payload
        );
      }
    },
    "user/upload_progress"(state, payload) {
      state.upload_progress = payload;
    },
  };

  const actions: Actions = {
    async "user/whoami"({ commit }) {
      const res = await api.user.getProfile();
      if (res.status === 200 && res.data) {
        commit("user/update_profile", res.data);
      }
      return res.status === 200;
    },

    async "user/signin"({ commit }, payload) {
      const res = await api.user.signIn(payload.username, payload.password);
      if (res.status === 200) {
        commit("user/update_profile", res.data);
      }
      return res.status === 200;
    },

    async "user/signup"({ commit }, payload) {
      const res = await api.user.signUp(payload.username, payload.password);
      if (res.status === 200) {
        commit("user/update_profile", res.data);
      }
      return res.status === 200;
    },

    async "user/update_profile"({ commit }, payload) {
      const res = await api.user.modifyProfile(payload);
      if (res.status === 200) {
        commit("user/update_profile", res.data);
      }
      return res.status === 200;
    },

    async "user/fetch_files"({ commit }) {
      const res = await api.user.getAllFiles();
      if (res.status === 200) {
        commit("user/update_file", res.data);
      }
      return res.status === 200;
    },

    async "user/upload_file"({ commit }, file) {
      const res = await api.user.uploadFile(file.name, file, (e) => {
        commit("user/upload_progress", e.loaded / e.total);
      });

      if (res.status === 200) {
        commit("user/delete_file", res.data.filename);
        commit("user/insert_file", res.data);
      }

      return res.status === 200;
    },

    async "user/delete_file"({ commit }, filename) {
      const res = await api.user.removeFile(filename);
      if (res.status === 204) {
        commit("user/delete_file", filename);
      }
      return res.status === 204;
    },

    async "user/fetch_sessions"({ commit }) {
      const res = await api.user.getAllSessions();
      if (res.status === 200) {
        commit("user/update_session", res.data);
      }
      return res.status === 200;
    },

    async "user/delete_session"({ commit }, session) {
      const res = await api.user.deleteSession(session);
      if (res.status === 204) {
        commit("user/delete_session", session);
      }
      return res.status === 204;
    },

    async "user/signout"({ commit }) {
      const res = await api.user.signOut();
      if (res.status === 204) {
        commit("user/update_profile", null);
      }
      return res.status === 204;
    },
  };

  return {
    state,
    getters,
    mutations,
    actions,
  };
}
