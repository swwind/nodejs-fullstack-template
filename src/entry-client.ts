import { createApp } from "./main";

const { app, router, store } = createApp();

const initData = document.getElementById("init-data");
let isSSR = false;

if (initData && initData.textContent) {
  try {
    store.replaceState(JSON.parse(initData.textContent));
    isSSR = true;
  } catch (e) {
    console.error(e);
  }
}

router.isReady().then(() => {
  app.mount("#app", isSSR);
});
