<template>
  <div v-if="files">
    <div>
      <label for="file"><translate text="please_select_file" /></label>
      <input type="file" @change="changeFile" id="file" />
    </div>
    <div>
      <button :disabled="uploading" @click="uploadFile">
        <translate text="upload_file" />
      </button>
      <span v-if="uploading">
        {{ progress }}
      </span>
    </div>
    <table v-if="files.length">
      <thead>
        <tr>
          <td><translate text="file_name" /></td>
          <td><translate text="file_size" /></td>
          <td><translate text="file_upload_time" /></td>
          <td><translate text="file_actions" /></td>
        </tr>
      </thead>
      <tbody>
        <tr v-for="file in files" :key="file.filename">
          <td>
            <a
              :href="`/fs/user/${username}/${encodeURIComponent(
                file.filename
              )}`"
              target="_blank"
            >
              {{ file.filename }}
            </a>
          </td>
          <td>
            {{ file.size }}
          </td>
          <td>
            {{ new Date(file.created).toLocaleString() }}
          </td>
          <td>
            <button @click="deleteFile(file.filename)">
              <translate text="file_delete" />
            </button>
          </td>
        </tr>
      </tbody>
    </table>
    <div v-else>
      <translate text="no_file" />
    </div>
  </div>
  <div v-else>Loading...</div>
</template>

<style lang="less" scoped>
table {
  margin: 0 auto;
}
</style>

<script lang="ts" setup>
import { computed, onMounted, onServerPrefetch, onUnmounted, ref } from "vue";
import { useStore } from "../store";

const store = useStore();

const files = computed(() => store.state.user.files);

const fetchData = () => store.dispatch("user/fetch_files");

onServerPrefetch(fetchData);
onMounted(() => {
  if (!files.value) {
    fetchData();
  }
});
onUnmounted(() => {
  store.commit("user/update_file", null);
});

const selectingFile = ref(null as File | null);
const uploading = ref(false);
const progress = computed(
  () => (store.state.user.upload_progress * 100).toFixed(2) + "%"
);

const changeFile = (e: Event) => {
  const input = e.target as HTMLInputElement;
  if (input.files) {
    selectingFile.value = input.files.item(0);
  } else {
    selectingFile.value = null;
  }
};

const uploadFile = async () => {
  if (!selectingFile.value) {
    return;
  }
  uploading.value = true;
  await store.dispatch("user/upload_file", selectingFile.value);
  uploading.value = false;
};

const username = computed(() => store.getters.username);

const deleteFile = (filename: string) => {
  if (confirm("Are you sure to remove?")) {
    store.dispatch("user/delete_file", filename);
  }
};
</script>
