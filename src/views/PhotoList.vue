<template>
  <div class="container">
    <div class="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4">
      <div class="col" v-for="(image, index) in state.images" :key="index">
        <AuthImage :imageUrl="image.url" :token="token" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from "vue";
import { useStore, mapGetters } from "vuex";
import axios from "axios";
import AuthImage from "@/components/AuthImage.vue";

type ImageResponse = {
  id: string;
  url: string;
  timestamp: string;
  user_id: string;
};

type ImageItem = {
  id: string;
  url: string;
  timestamp: Date;
  userId: string;
};

type State = {
  images: Array<ImageItem>;
};

export default defineComponent({
  name: "PhotoList",
  components: {
    AuthImage,
  },
  setup() {
    const state = reactive<State>({
      images: [],
    });
    const store = useStore();

    async function getImages() {
      try {
        const url = process.env.VUE_APP_MASSIVE_SHOOT_API + "images";
        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${store.getters["auth/accessToken"]}`,
          },
        });
        state.images = response.data.map((image: ImageResponse) => ({
          id: image.id,
          url: image.url,
          timestamp: new Date(image.timestamp),
          userId: image.user_id,
        }));
      } catch {
        return;
      }
    }

    getImages();

    return { state };
  },
  computed: {
    ...mapGetters({
      token: "auth/accessToken",
    }),
  },
});
</script>
