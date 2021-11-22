<template>
  <div v-if="sessions">
    <div v-for="session in sessions" :key="session._id" class="session">
      <p>Last Active: {{ new Date(session.lastActive).toLocaleString() }}</p>
      <p>User Agent: {{ session.userAgent }}</p>
      <button @click="deleteSession(session._id)">
        <translate text="session_delete" />
      </button>
    </div>
  </div>
  <div v-else>Loading...</div>
</template>

<style lang="less" scoped>
.session {
  background: #0000000a;
  width: 500px;
  margin: 20px auto;
  padding: 20px 50px;
}
</style>

<script lang="ts" setup>
import { computed, onMounted, onServerPrefetch, onUnmounted } from "vue";
import { useStore } from "../store";

const store = useStore();

const sessions = computed(() => store.state.user.sessions);

const fetchData = () => store.dispatch("user/fetch_sessions");

onServerPrefetch(fetchData);
onMounted(() => {
  if (!sessions.value) {
    fetchData();
  }
});
onUnmounted(() => {
  store.commit("user/update_session", null);
});

const deleteSession = (session: string) => {
  if (confirm("Are you sure you want to remove this session?")) {
    store.dispatch("user/delete_session", session);
  }
};
</script>
