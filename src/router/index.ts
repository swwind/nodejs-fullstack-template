import {
  RouteRecordRaw,
  createRouter as _createRouter,
  createMemoryHistory,
  createWebHistory,
} from "vue-router";

import Home from "../views/Home.vue";
import NotFound from "../views/NotFound.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/signin",
    name: "SignIn",
    component: () => import("../components/SignIn.vue"),
  },
  {
    path: "/signup",
    name: "SignUp",
    component: () => import("../components/SignUp.vue"),
  },
  {
    path: "/files",
    name: "Files",
    component: () => import("../views/Files.vue"),
  },
  {
    path: "/sessions",
    name: "Sessions",
    component: () => import("../views/Sessions.vue"),
  },
  {
    path: "/:a(.*)",
    name: "NotFound",
    component: NotFound,
  },
];

export function createRouter() {
  return _createRouter({
    history: import.meta.env.SSR ? createMemoryHistory() : createWebHistory(),
    routes,
  });
}
