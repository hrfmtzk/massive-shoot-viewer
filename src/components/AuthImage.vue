<template>
  <img
    :src="state.objectUrl"
    :style="state.loading ? { display: 'none' } : {}"
  />
</template>

<script lang="ts">
import { defineComponent, onUnmounted, reactive } from "vue";
import axios from "axios";

type State = {
  objectUrl: string;
  loading: boolean;
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
      loading: true,
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
        state.loading = false;
      } catch {
        return;
      }
    }

    getImage();

    return { state };
  },
});
</script>
