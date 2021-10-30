import {
  RouteRecordRaw,
  createRouter as createVueRouter,
  createMemoryHistory,
  createWebHistory,
} from "vue-router";

const SignIn = () => import("../components/SignIn.vue");
const SignUp = () => import("../components/SignUp.vue");

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
    component: SignIn,
  },
  {
    path: "/signup",
    name: "SignUp",
    component: SignUp,
  },
  {
    path: "/upload",
    name: "Upload",
    component: () => import("../components/Upload.vue"),
  },
  {
    path: "/:a(.*)",
    name: "NotFound",
    component: NotFound,
  },
];

export function createRouter() {
  return createVueRouter({
    history: import.meta.env.SSR ? createMemoryHistory() : createWebHistory(),
    routes,
  });
}
