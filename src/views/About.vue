<template>
  <div class="about">
    <h1>This is an about page</h1>
  </div>
  <button v-on:click="logout">Logout</button>
  <div>
    <div>
      <img :src="pictureUrlSmall" />
    </div>
    <div>{{ displayName }}</div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { mapActions, mapGetters } from "vuex";
import { AuthAction } from "@/store/modules/auth";

export default defineComponent({
  name: "About",
  computed: {
    ...mapGetters({
      userId: "auth/userId",
      displayName: "auth/displayName",
      pictureUrlSmall: "auth/pictureUrlSmall",
    }),
  },
  methods: {
    ...mapActions({
      revokeToken: "auth/" + AuthAction.REVOKE_TOKEN,
    }),
    async logout() {
      await this.revokeToken();
      this.$router.push("/");
    },
  },
});
</script>
