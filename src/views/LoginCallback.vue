<template>
  <div v-if="state.errorCode">
    {{ state.errorMessage }} ({{ state.errorCode }})
  </div>
  <div v-else>redirecting...</div>
</template>

<script lang="ts">
import { defineComponent, reactive } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
import { queryToStringStrict } from "@/utils";
import { AuthAction, authzStateObjectType } from "@/store/modules/auth";

type State = {
  errorCode: string;
  errorMessage: string;
};

export default defineComponent({
  name: "LoginCallback",
  setup() {
    const state = reactive<State>({
      errorCode: "",
      errorMessage: "",
    });
    const store = useStore();
    const route = useRoute();
    const router = useRouter();

    if (route.query.error) {
      state.errorCode = queryToStringStrict(route.query.error);
      try {
        state.errorMessage = queryToStringStrict(route.query.error_description);
      } catch {
        state.errorMessage = "Unknown error.";
      }
      return { state };
    }

    let authzCode = "";
    let authzState = "";
    try {
      authzCode = queryToStringStrict(route.query.code);
      authzState = queryToStringStrict(route.query.state);
    } catch {
      state.errorCode = "0";
      state.errorMessage = "Invalid query.";
      return { state };
    }

    if (authzState !== store.state.auth.authzState) {
      state.errorCode = "0";
      state.errorMessage = "Invalid state.";
      return { state };
    }

    async function getToken() {
      const stateObject: authzStateObjectType = JSON.parse(authzState);
      await store.dispatch(
        "auth/" + AuthAction.COMPLETE_LOGIN_PROCESS,
        authzCode
      );
      router.push(stateObject.redirectUrl);
    }

    getToken();

    return { state };
  },
});
</script>
