<template>
  <div class="container">
    <template v-if="state.loading">
      <div class="spinner-border text-secondary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </template>
    <template v-else>
      <template v-if="state.error">
        {{ error }}
      </template>
      <template v-else>
        <div class="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4">
          <div
            class="col gx-0"
            v-for="(image, index) in state.images"
            :key="index"
          >
            <AuthImage
              :imageUrl="image.url + '?thumbnail=true'"
              :token="token"
              class="img-fluid img-thumbnail"
              style="object-fit: cover; width: 100%; height: 250px"
            />
          </div>
        </div>
      </template>
    </template>
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
  loading: boolean;
  error: string;
};

export default defineComponent({
  name: "PhotoList",
  components: {
    AuthImage,
  },
  setup() {
    const state = reactive<State>({
      images: [],
      loading: true,
      error: "",
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
        state.loading = false;
      } catch {
        state.loading = false;
        state.error = "image list load error";
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
