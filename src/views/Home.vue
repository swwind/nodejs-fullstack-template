<template>
  <h1>Hello {{ user.username }}!</h1>
  <p>
    And you email is <a :href="'mailto:' + user.email">{{ user.email }}</a>
  </p>
</template>

<script lang="ts" setup>
import { toRefs } from "@vue/reactivity";
import { useStore } from "vuex";
import { MyStore } from "../store";

const store = useStore() as unknown as MyStore;

const { user } = toRefs(store.state);
</script>
