<template>
  <img :src="state.objectUrl" />
</template>

<script lang="ts">
import { defineComponent, onUnmounted, reactive } from "vue";
import axios from "axios";

type State = {
  objectUrl: string;
};

export default defineComponent({
  name: "AuthImage",
  props: {
    imageUrl: {
      type: String,
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const state = reactive<State>({
      objectUrl: "",
    });

    onUnmounted(() => {
      if (state.objectUrl) {
        URL.revokeObjectURL(state.objectUrl);
      }
    });

    async function getImage() {
      try {
        const response = await axios.get(props.imageUrl, {
          headers: {
            Authorization: `Bearer ${props.token}`,
          },
          responseType: "arraybuffer",
        });

        const data = new Blob([response.data]);
        state.objectUrl = URL.createObjectURL(data);
      } catch {
        return;
      }
    }

    getImage();

    return { state };
  },
});
</script>
