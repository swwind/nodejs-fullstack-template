import { API } from "../api";
import { ActionContext, createStore as createVuexStore, Store } from "vuex";
import {
  createModules,
  ModuleState as RootState,
  ModuleActions as RootActions,
  ModuleMutations as RootMutations,
} from "./modules";

export const createStore = (api: API) =>
  createVuexStore<RootState>({
    modules: createModules(api),
  });

type OptionalSpread<T> = T extends undefined ? [] : [T];

export type ArgumentedActionContext<S = RootState> = Omit<
  ActionContext<S, RootState>,
  "commit" | "dispatch" | "state" | "rootState"
> & {
  commit<K extends keyof RootMutations>(
    type: K,
    ...payload: OptionalSpread<Parameters<RootMutations[K]>[1]>
  ): ReturnType<RootMutations[K]>;
  dispatch<K extends keyof RootActions>(
    type: K,
    ...payload: OptionalSpread<Parameters<RootActions[K]>[1]>
  ): ReturnType<RootActions[K]>;
  state: S;
  rootState: RootState;
};

export type MyStore = Omit<Store<RootState>, "commit" | "dispatch"> & {
  commit<K extends keyof RootMutations>(
    type: K,
    ...payload: OptionalSpread<Parameters<RootMutations[K]>[1]>
  ): ReturnType<RootMutations[K]>;
  dispatch<K extends keyof RootActions>(
    type: K,
    ...payload: OptionalSpread<Parameters<RootActions[K]>[1]>
  ): ReturnType<RootActions[K]>;
};
