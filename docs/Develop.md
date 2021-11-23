# Develop

Development tools should be your powerful helpers, but not spend a whole day on making your Webpack to build your Vue SFC code without errors.

So we solved most of the problems you might face to on building your web apps, and provided some effective solutions to some really frustrated and hair-falling problems.

It is better for you to have a read of this articles before you start to modify our code.

## Server Side Rendering

Server side rendering is a major problem in full-stack projects. The most complicated part is how we fetch user's data on server and preventing it to be fetched twice on client.

Vue.js has given an official solution for [Data Pre-Fetching and State](https://ssr.vuejs.org/guide/data.html). We followed this solution and you can see it in `src/views/Files.vue`.

```ts
// Create a reference to state (which should be nullable)
// files: Computed<UserFileDoc[] | null>
const files = computed(() => store.state.user.files);

// Define a function to fetch all the data we need to render this page
const fetchData = () => store.dispatch("user/files");

// Register it on server-side render
// Backend will fetch these data before start render the page
onServerPrefetch(fetchData);

// On client side, we have two situations
//
// 1. The data was already fetched and rendered on server.
//    Then we can skip fetch data step and do nothing.
//
// 2. The data was not prepared and we need to fetch it.
//    Simply invoke fetchData() once, and don't forget
//    to show a loading page.
onMounted(() => {
  if (!files.value) {
    fetchData();
  }
});

// When we leave the page, we need to remove data in order not to
// skip the fetch-data step the next time we enter this page.
onUnmounted(() => {
  store.commit("user/set_files", null);
});
```

## Build

By default, our build script (`vite` and `webpack`) does **NOT** check any TypeScript Type Errors during compile time. This is intended to minimize the build time because you can check Type Errors through your IDE (or `yarn dev` server) before start the build.

If you need a script to check TypeScript Type Errors, we provided `yarn build:check` to check TypeScript Type Errors manually. But it is very slow, and we didn't know why.
