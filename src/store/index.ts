import { createStore } from "vuex";
import createPersistedState from "vuex-persistedstate";

import { authModule as auth, AuthState } from "@/store/modules/auth";

export type RootState = {
  auth: AuthState;
};

export default createStore({
  strict: process.env.NODE_ENV !== "production",
  modules: {
    auth,
  },
  plugins: [createPersistedState()],
});
