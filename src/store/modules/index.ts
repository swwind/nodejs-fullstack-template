import {
  State as UserState,
  Getters as UserGetters,
  Mutations as UserMutations,
  Actions as UserActions,
  createUserModule,
} from "./user";

import {
  State as SSRState,
  Getters as SSRGetters,
  Mutations as SSRMutations,
  Actions as SSRActions,
  createSSRModule,
} from "./ssr";

import {
  State as LocaleState,
  Getters as LocaleGetters,
  Mutations as LocaleMutations,
  Actions as LocaleActions,
  createLocaleModule,
} from "./locale";

import { API } from "../../api";

export const createModules = (api: API) => {
  return {
    user: createUserModule(api),
    ssr: createSSRModule(api),
    locale: createLocaleModule(api),
  };
};

export type ModuleState = {
  user: UserState;
  ssr: SSRState;
  locale: LocaleState;
};

export type ModuleGetters = UserGetters & SSRGetters & LocaleGetters;
export type ModuleMutations = UserMutations & SSRMutations & LocaleMutations;
export type ModuleActions = UserActions & SSRActions & LocaleActions;
