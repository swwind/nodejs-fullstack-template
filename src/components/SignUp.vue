<template>
  <div class="signup">
    <input type="text" v-model="username" />
    <input type="password" v-model="password1" />
    <input type="password" v-model="password2" />
    <input type="email" v-model="email" />
    <button @click="submit">sign up</button>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import { MyStore } from "../store";

const store = useStore() as MyStore;
const router = useRouter();

const username = ref("");
const password1 = ref("");
const password2 = ref("");
const email = ref("");

const submit = async () => {
  if (password1.value !== password2.value) {
    return;
  }

  const success = await store.dispatch("user/signup", {
    username: username.value,
    password: password1.value,
    email: email.value,
  });

  if (success) {
    router.push("/");
  }
};
</script>

<style lang="less" scoped>
.signup {
  width: 200px;
  margin: 100px auto;
}
</style>
