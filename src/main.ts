import { createSSRApp, createApp as createVueApp } from "vue";
import App from "./AsyncApp.vue";
import { createRouter } from "./router";
import { createStore } from "./store";
import { createAPI } from "./api";

export function createApp(cookie?: string, host?: string) {
  const app = import.meta.env.SSR ? createSSRApp(App) : createVueApp(App);
  const router = createRouter();
  const api = createAPI(cookie, host);
  const store = createStore(api);
  app.use(store);
  app.use(router);

  return { app, router, store };
}
