<template>
  <header class="p-3 mb-3 border-bottom">
    <div class="container">
      <div
        class="
          d-flex
          flex-wrap
          align-items-center
          justify-content-center justify-content-lg-start
        "
      >
        <router-link
          to="/"
          class="
            d-flex
            align-items-center
            mb-2 mb-lg-0
            text-dark text-decoration-none
          "
        >
          <img
            class="header-logo"
            alt="Vue logo"
            src="@/assets/logo.png"
            height="32"
          />
        </router-link>

        <ul
          class="
            nav
            col-12 col-lg-auto
            me-lg-auto
            mb-2
            justify-content-center
            mb-md-0
          "
        >
          <li v-for="(path, index) in menuRoutePaths" :key="index">
            <router-link
              :to="path"
              custom
              v-slot="{ href, navigate, route, isActive }"
            >
              <a
                class="nav-link px-2"
                :class="[isActive ? 'link-secondary' : 'link-dark']"
                :href="href"
                @click="navigate"
                >{{ route.name }}</a
              >
            </router-link>
          </li>
        </ul>

        <template v-if="loggedIn">
          <div class="dropdown text-end">
            <a
              href="#"
              class="d-block link-dark text-decoration-none dropdown-toggle"
              id="dropdownUser1"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <img
                :src="pictureUrlSmall"
                :alt="displayName"
                width="32"
                height="32"
                class="rounded-circle"
              />
            </a>
            <ul
              class="dropdown-menu text-small"
              aria-labelledby="dropdownUser1"
            >
              <li><a class="dropdown-item" href="#">New project...</a></li>
              <li><a class="dropdown-item" href="#">Settings</a></li>
              <li><a class="dropdown-item" href="#">Profile</a></li>
              <li><hr class="dropdown-divider" /></li>
              <li>
                <a class="dropdown-item" href="#" @click="logout">Logout</a>
              </li>
            </ul>
          </div>
        </template>
        <template v-else>
          <a type="button" class="btn btn-outline-primary" :href="loginUrl">
            Login
          </a>
        </template>
      </div>
    </div>
  </header>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { mapActions, mapGetters } from "vuex";
import { AuthAction } from "@/store/modules/auth";

export default defineComponent({
  name: "Header",
  data() {
    return {
      menuRoutePaths: ["/", "/about"],
    };
  },
  computed: {
    ...mapGetters({
      loggedIn: "auth/loggedIn",
      getLoginUrl: "auth/getLoginUrl",
      displayName: "auth/displayName",
      pictureUrlSmall: "auth/pictureUrlSmall",
    }),
    loginUrl(): string {
      return this.getLoginUrl(this.$route.fullPath);
    },
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
