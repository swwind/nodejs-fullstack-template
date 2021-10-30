<template>
  <table>
    <thead>
      <tr>
        <td>Filename</td>
        <td>Filesize</td>
        <td>UUID</td>
      </tr>
    </thead>
    <tbody>
      <tr v-for="file in files" :key="file.uuid">
        <td>
          <a :href="`/fs/user/${file.username}/${file.uuid}`">{{
            file.filename
          }}</a>
        </td>
        <td>{{ file.size }}</td>
        <td>{{ file.uuid }}</td>
      </tr>
    </tbody>
  </table>
</template>

<script lang="ts" setup>
import { computed, onMounted, onServerPrefetch } from "vue";
import { useStore } from "../store";

const store = useStore();

const files = computed(() => store.state.user.files);

const fetchData = async () => {
  await store.dispatch("user/files");
};

onServerPrefetch(fetchData);
onMounted(() => {
  if (!files.value.length) {
    fetchData();
  }
});
</script>
