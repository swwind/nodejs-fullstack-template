<template>
  <ul class="nav">
    <li><router-link to="/">Home</router-link></li>
    <li><router-link to="/signin">Sign In</router-link></li>
    <li><router-link to="/signup">Sign Up</router-link></li>
  </ul>
  <div class="content">
    <router-view />
  </div>
</template>

<script lang="ts" setup>
import { useStore } from "vuex";
import { MyStore } from "./store";

const store = useStore() as MyStore;

await store.dispatch('user/whoami');

store.commit('ssr/title', 'Hello world');

</script>

<style lang="less">
body, html {
  padding: 0;
  margin: 0;
}
</style>

<style lang="less" scoped>
.nav {
  width: 80%;
  text-align: center;
  margin: 0 auto;

  li {
    display: inline-block;
    margin: 0 10px;

    a {
      text-decoration: none;
      color: rgba(0, 0, 0, 0.9);
      padding: 10px 20px;
      height: 50px;
      line-height: 50px;
      background: rgba(0, 0, 0, 0.1);
      transition: background .2s;

      &:hover {
        background: rgba(0, 0, 0, 0.2);
      }
    }
  }
}

.content {
  text-align: center;
}
</style>
