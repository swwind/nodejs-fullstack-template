<template>
  {{ translated }}
</template>

<script lang="ts" setup>
import { computed, watchEffect } from "vue";
import { useStore } from "../store";
import { TranslateKeys } from "../locale";
import { ref } from "vue";

const props = defineProps({
  text: {
    type: String,
    required: true,
  },
  args: {
    type: Array,
    required: false,
  },
});

const store = useStore();

const translation = computed(() => store.state.locale.translation);
const key = computed(() => props.text);
const args = computed(() =>
  Array.isArray(props.args) ? props.args.map(String) : []
);

const translateText = () => {
  const k = key.value;
  const t = translation.value;
  const v = t[k as TranslateKeys];
  if (!v) {
    console.warn(`Translation for ${k} was not found`);
    return "???";
  }
  return v.replace(/\{(\d+)\}/g, (_, i) => args.value[i]);
};

const translated = ref("");

watchEffect(() => {
  translated.value = translateText();
});
</script>
