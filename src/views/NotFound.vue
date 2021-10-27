<template>
  <h1>404 NOT FOUND</h1>
</template>

<script lang="ts" setup>
import { useStore } from "vuex";
import { MyStore } from "../store";

const store = useStore() as MyStore;

store.commit('ssr/status', 404);
store.commit('ssr/title', '404 NOT FOUND');

</script>
