<script setup lang="ts">
import { BIconCoin, BIconGithub, BIconGlobe } from "bootstrap-icons-vue";
import { onMounted, ref } from "vue";

const version = ref("");
window.appInteractor.version().then((v) => {
  version.value = v;
});

const onLinkClicked = (url: string) => {
  window.appInteractor.open(url);
};

const darkMode = ref(false);
onMounted(() => {
  if (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    darkMode.value = true;
  }
});
</script>

<template>
  <div class="flex flex-col w-full text-neutral-800 dark:text-neutral-300">
    <img
      src="../../assets/logo-dark.png"
      class="w-8 mb-2 ml-1"
      v-if="darkMode"
    />
    <img src="../../assets/logo-light.png" class="w-8 mb-2 ml-1" v-else />
    <div class="text-base font-semibold mb-4">Paperlib</div>
    <div class="text-xs mb-4">
      created by Future Scholars, a simple academic paper management tool.
    </div>
    <div class="text-xs mb-4">Version {{ version }}</div>
    <div class="flex space-x-2">
      <div
        class="flex space-x-2 text-base mb-4 bg-neutral-200 dark:bg-neutral-600 w-20 justify-center p-2 rounded-md hover:bg-neutral-300 hover:dark:bg-neutral-500 cursor-pointer"
        @click="onLinkClicked('https://github.com/Future-Scholars/paperlib')"
      >
        <BIconGithub class="my-auto" />
        <span class="my-auto text-xs">Github</span>
      </div>
      <div
        class="flex space-x-2 text-base mb-4 bg-neutral-200 dark:bg-neutral-600 w-30 justify-center p-2 rounded-md hover:bg-neutral-300 hover:dark:bg-neutral-500 cursor-pointer"
        @click="onLinkClicked('https://paperlib.app/en/')"
      >
        <BIconGlobe class="my-auto" />
        <span class="my-auto text-xs">Home Page</span>
      </div>
      <div
        class="flex space-x-2 text-base mb-4 bg-neutral-200 dark:bg-neutral-600 w-30 justify-center p-2 rounded-md hover:bg-neutral-300 hover:dark:bg-neutral-500 cursor-pointer"
        @click="onLinkClicked('https://paperlib.app/en/#donate')"
      >
        <BIconCoin class="my-auto" />
        <span class="my-auto text-xs">Donate</span>
      </div>
    </div>
  </div>
</template>
