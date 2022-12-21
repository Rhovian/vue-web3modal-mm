<script setup lang="ts">
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { web3modal } from "@/utils/web3Modal";
</script>
<template>
  <div id="connect-wrap">
    <button @click="web3modal.openModal()">Connect</button>
  </div>
</template>
