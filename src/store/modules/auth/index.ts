// eslint-disable-next-line @typescript-eslint/no-var-requires
const crypto = require("crypto");
import { Module } from "vuex";
import axios from "axios";
import { RootState } from "@/store";
import { base64UrlEncode, randomString } from "@/utils";

export type AuthState = {
  accessToken: string;
  refreshToken: string;
  userId: string;
  displayName: string;
  pictureUrl: string;
  authzState: string;
  authzNonce: string;
  authzCodeVerifier: string;
};

export enum AuthMutation {
  GENERATE_AUTHZ_INFO = "GENERATE_AUTHZ_INFO",
  SET_TOKENS = "SET_TOKENS",
  SET_PROFILE = "SET_PROFILE",
  SET_AUTHZ_INFO = "SET_AUTHZ_INFO",
  CLEAR_AUTHZ_INFO = "CLEAR_AUTHZ_INFO",
  CLEAR_ALL_INFO = "CLEAR_ALL_INFO",
}

export enum AuthAction {
  COMPLETE_LOGIN_PROCESS = "COMPLETE_LOGINPROCESS",
  REVOKE_TOKEN = "REVOKE_TOKEN",
}

export type SetTokensType = {
  accessToken?: string;
  refreshToken?: string;
};

export type SetProfileType = {
  userId: string;
  displayName: string;
  pictureUrl: string;
};

export type SetAuthzInfoType = {
  authzState: string;
  authzNonce: string;
  authzCodeVerifier: string;
};

export type authzStateObjectType = {
  state: string;
  redirectUrl: string;
};

function convertCodeChallenge(verifier: string): string {
  return base64UrlEncode(
    crypto.createHash("sha256").update(verifier).digest("base64")
  );
}

export const authModule: Module<AuthState, RootState> = {
  namespaced: true,
  state: (): AuthState => ({
    accessToken: "",
    refreshToken: "",
    userId: "",
    displayName: "",
    pictureUrl: "",
    authzState: "",
    authzNonce: "",
    authzCodeVerifier: "",
  }),
  getters: {
    stateReady: (state) => {
      return (
        (state.accessToken && state.refreshToken && state.userId) ||
        (state.authzState && state.authzNonce && state.authzCodeVerifier)
      );
    },
    loggedIn: (state) => {
      return state.accessToken !== "";
    },
    userId: (state) => state.userId,
    displayName: (state) => state.displayName,
    pictureUrl: (state) => state.pictureUrl,
    pictureUrlSmall: (state) => state.pictureUrl + "/small",
    pictureUrlLarge: (state) => state.pictureUrl + "/large",
    getLoginUrl: (state) => (redirectUrl?: string) => {
      const authzState = JSON.stringify({
        state: state.authzState,
        redirectUrl: redirectUrl || "/",
      });
      const url = new URL(process.env.VUE_APP_LINE_LOGIN_AUTHZ_URL);
      url.searchParams.append("response_type", "code");
      url.searchParams.append(
        "client_id",
        process.env.VUE_APP_LINE_LOGIN_CHANNEL_ID
      );
      url.searchParams.append(
        "redirect_uri",
        process.env.VUE_APP_LINE_LOGIN_REDIRECT_URL
      );
      url.searchParams.append("state", authzState);
      url.searchParams.append("scope", "profile");
      url.searchParams.append("nonce", state.authzNonce);
      url.searchParams.append("bot_prompt", "aggressive");
      url.searchParams.append(
        "code_challenge",
        convertCodeChallenge(state.authzCodeVerifier)
      );
      url.searchParams.append("code_challenge_method", "S256");
      return url.href;
    },
  },
  mutations: {
    [AuthMutation.GENERATE_AUTHZ_INFO](state: AuthState) {
      state.authzState = randomString(16);
      state.authzNonce = randomString(16);
      state.authzCodeVerifier = randomString(43);
    },
    [AuthMutation.SET_TOKENS](state: AuthState, payload: SetTokensType) {
      if (payload.accessToken) {
        state.accessToken = payload.accessToken;
      }
      if (payload.refreshToken) {
        state.refreshToken = payload.refreshToken;
      }
    },
    [AuthMutation.SET_PROFILE](state: AuthState, payload: SetProfileType) {
      state.userId = payload.userId;
      state.displayName = payload.displayName;
      state.pictureUrl = payload.pictureUrl;
    },
    [AuthMutation.SET_AUTHZ_INFO](state: AuthState, payload: SetAuthzInfoType) {
      state.authzState = payload.authzState;
      state.authzNonce = payload.authzNonce;
      state.authzCodeVerifier = payload.authzCodeVerifier;
    },
    [AuthMutation.CLEAR_AUTHZ_INFO](state: AuthState) {
      state.authzState = "";
      state.authzNonce = "";
      state.authzCodeVerifier = "";
    },
    [AuthMutation.CLEAR_ALL_INFO](state: AuthState) {
      state.accessToken = "";
      state.refreshToken = "";
      state.userId = "";
      state.displayName = "";
      state.pictureUrl = "";
      state.authzState = "";
      state.authzNonce = "";
      state.authzCodeVerifier = "";
    },
  },
  actions: {
    async [AuthAction.COMPLETE_LOGIN_PROCESS]({ commit, state }, code: string) {
      const tokenRequestParams = new URLSearchParams();
      tokenRequestParams.append("grant_type", "authorization_code");
      tokenRequestParams.append("code", code);
      tokenRequestParams.append(
        "redirect_uri",
        process.env.VUE_APP_LINE_LOGIN_REDIRECT_URL
      );
      tokenRequestParams.append(
        "client_id",
        process.env.VUE_APP_LINE_LOGIN_CHANNEL_ID
      );
      tokenRequestParams.append(
        "client_secret",
        process.env.VUE_APP_LINE_LOGIN_CHANNEL_SECRET
      );
      tokenRequestParams.append("code_verifier", state.authzCodeVerifier);
      try {
        const tokenResponse = await axios.post(
          process.env.VUE_APP_LINE_LOGIN_TOKEN_API,
          tokenRequestParams
        );
        commit(AuthMutation.SET_TOKENS, {
          accessToken: tokenResponse.data.access_token,
          refreshToken: tokenResponse.data.refresh_token,
        });
      } catch {
        return;
      }

      try {
        const profileResponse = await axios.get(
          process.env.VUE_APP_LINE_LOGIN_PROFILE_API,
          {
            headers: {
              Authorization: `Bearer ${state.accessToken}`,
            },
          }
        );
        commit(AuthMutation.SET_PROFILE, {
          userId: profileResponse.data.userId,
          displayName: profileResponse.data.displayName,
          pictureUrl: profileResponse.data.pictureUrl,
        });
      } catch {
        return;
      }

      commit(AuthMutation.CLEAR_AUTHZ_INFO);
    },
    async [AuthAction.REVOKE_TOKEN]({ commit, state }) {
      try {
        const revokeRequestParams = new URLSearchParams();
        revokeRequestParams.append("access_token", state.accessToken);
        revokeRequestParams.append(
          "client_id",
          process.env.VUE_APP_LINE_LOGIN_CHANNEL_ID
        );
        revokeRequestParams.append(
          "client_secret",
          process.env.VUE_APP_LINE_LOGIN_CHANNEL_SECRET
        );
        await axios.post(
          process.env.VUE_APP_LINE_LOGIN_REVOKE_API,
          revokeRequestParams
        );
      } catch {
        return;
      }
      commit(AuthMutation.CLEAR_ALL_INFO);
      commit(AuthMutation.GENERATE_AUTHZ_INFO);
    },
  },
};
