import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import Home from "@/views/Home.vue";
import Login from "@/views/Login.vue";
import LoginCallback from "@/views/LoginCallback.vue";
import store from "@/store";
import { AuthMutation } from "@/store/modules/auth";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/about",
    name: "About",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/About.vue"),
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/login/callback",
    name: "LoginCallback",
    component: LoginCallback,
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

router.beforeEach((to, from, next) => {
  if (!store.getters["auth/stateReady"]) {
    store.commit("auth/" + AuthMutation.GENERATE_AUTHZ_INFO);
  }
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (!store.getters["auth/loggedIn"]) {
      const loginUrl = store.getters["auth/getLoginUrl"](to.fullPath);
      window.location.href = loginUrl;
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;
