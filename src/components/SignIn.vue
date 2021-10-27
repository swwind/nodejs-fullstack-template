<template>
  <div class="signin">
    <input type="text" v-model="username"/>
    <input type="password" v-model="password"/>
    <button @click="submit">sign in</button>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { MyStore } from '../store';

const store = useStore() as MyStore;
const router = useRouter();

const username = ref('');
const password = ref('');

const submit = async () => {
  const success = await store.dispatch('user/signin', {
    username: username.value,
    password: password.value,
  });

  if (success) {
    router.push('/');
  }
}
</script>

<style lang="less" scoped>
.signin {
  width: 200px;
  margin: 100px auto;
}
</style>
