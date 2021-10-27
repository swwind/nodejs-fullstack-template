import { createSSRApp } from 'vue';
import App from './AsyncApp.vue';
import { createRouter } from './router';
import { createStore } from './store';
import { createAPI } from './api';

export function createApp(cookie?: string, host?: string) {
  const app = createSSRApp(App);
  const router = createRouter();
  const api = createAPI(cookie, host);
  const store = createStore(api);
  app.use(store);
  app.use(router);

  return { app, router, store };
}
