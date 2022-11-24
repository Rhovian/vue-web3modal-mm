<script setup lang="ts">
import { store } from "@/store";

const connect = async () => {
  await store.connect();
};
</script>

<template>
  <div id="connect-wrap">
    <button v-if="!store.isConnected" @click="connect">Connect</button>
    <button v-if="store.isConnected">
      {{ store.activeAccount }}
    </button>
  </div>
</template>
