import { ArgumentedActionContext as Context } from "..";
import { API } from "../../api";

export type State = {
  username: string;
  email: string;
}

export type Mutations<S = State> = {
  "user/update"(state: S, payload: { username: string, email: string }): void;
}

export type Actions<S = State> = {
  "user/whoami"(actx: Context<S>): Promise<boolean>;
  "user/signin"(actx: Context<S>, payload: {
    username: string;
    password: string;
  }): Promise<boolean>;
  "user/signup"(actx: Context<S>, payload: {
    username: string;
    password: string;
    email: string;
  }): Promise<boolean>;
}

export function createUserModule(api: API) {
  
  const state = (): State => ({
    username: "",
    email: "",
  });
  
  const mutations: Mutations = {
    "user/update"(state, payload) {
      state.username = payload.username;
      state.email = payload.email;
    }
  }

  const actions: Actions = {
    async "user/whoami"({ commit }) {
      const res = await api.user.whoami();
      if (res.status === 200) {
        commit('user/update', {
          username: res.data.username,
          email: res.data.email,
        });
        return true;
      } else {
        return false;
      }
    },

    async "user/signin"({ commit }, payload) {
      const res = await api.user.signIn(payload.username, payload.password);
      if (res.status === 200) {
        commit('user/update', {
          username: payload.username,
          email: res.data.email,
        });
        return true;
      } else {
        return false;
      }
    },

    async "user/signup"({ commit }, payload) {
      const res = await api.user.signUp(payload.username, payload.password, payload.email);
      if (res.status === 200) {
        commit('user/update', {
          username: payload.username,
          email: payload.email,
        });
        return true;
      } else {
        return false;
      }
    }
  }
  
  return {
    state,
    mutations,
    actions,
  }
}