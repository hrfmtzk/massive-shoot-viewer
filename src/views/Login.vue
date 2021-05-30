<template>
  <div class="login">
    <LineLogin :loginUrl="state.loginUrl" />
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, reactive } from "vue";
import { useRoute } from "vue-router";
import { useStore } from "vuex";
import { AuthAction } from "@/store/modules/auth";
import LineLogin from "@/components/LineLogin.vue";

type State = {
  loginUrl: string;
};

export default defineComponent({
  name: "Login",
  components: {
    LineLogin,
  },
  setup() {
    const state = reactive<State>({
      loginUrl: "",
    });
    const store = useStore();
    const route = useRoute();

    onMounted(async () => {
      const url = await store.dispatch(
        "auth/" + AuthAction.GENERATE_LOGIN_URL,
        route.query.redirect || "/"
      );
      state.loginUrl = url;
    });

    return {
      state,
    };
  },
});
</script>
