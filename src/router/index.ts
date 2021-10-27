import {
  RouteRecordRaw,
  createRouter as createVueRouter,
  createMemoryHistory,
  createWebHistory
} from 'vue-router';

import SignIn from '../components/SignIn.vue';
import SignUp from '../components/SignUp.vue';

import Home from '../views/Home.vue';
import NotFound from '../views/NotFound.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  }, {
    path: '/signin',
    name: 'SignIn',
    component: SignIn,
  }, {
    path: '/signup',
    name: 'SignUp',
    component: SignUp,
  }, {
    path: '/:a(.*)',
    name: 'NotFound',
    component: NotFound,
  },
];

export function createRouter() {
  return createVueRouter({
    history: import.meta.env.SSR
      ? createMemoryHistory()
      : createWebHistory(),
    routes,
  });
}