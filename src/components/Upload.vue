<template>
  <input type="file" name="file" @change="change"/>
  <input type="button" value="Upload" @click="upload"/>
</template>

<script lang="ts" setup>
import { useStore } from "../store";
import { Ref, ref } from 'vue';

const store = useStore();

const file: Ref<File | null> = ref(null);

const change = (e: any) => {
  var files = e.target.files || e.dataTransfer.files;
  if (!files.length) return;
  file.value = files[0];
};

const upload = async () => {
  if (!file.value) return;
  console.log('uploading');
  const uuid = await store.dispatch('user/upload', file.value);
  if (uuid) {
    console.log(`uploaded to ${uuid}`);
  } else {
    console.log('failed to upload');
  }
}
</script>