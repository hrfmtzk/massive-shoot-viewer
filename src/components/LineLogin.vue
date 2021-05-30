<template>
  <a v-bind:href="loginUrl">LINE Login</a>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "LineLogin",
  props: {
    loginUrl: String,
  },
});
</script>
