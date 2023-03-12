<template>
<button class="btn" :class="{clicked: isClicked}" @click="toggle">
  <slot name="default"></slot>
  <slot v-if="!isClicked" name="firstState"></slot>
  <slot v-else name="secondState"></slot>
</button>
</template>

<script setup>

import {ref} from "vue";

const props = defineProps({
  isOn: {
    type: Boolean,
    required: false,
    default: false,
  }
});

const emit = defineEmits(['on', 'off']);
const isClicked = ref(props.isOn);

function toggle() {
  isClicked.value = !isClicked.value;

  emit(isClicked.value ? 'on' : 'off');
}
</script>

<style scoped>
.btn {
  padding: 12px 16px;
  border-radius: 8px;
  outline: none;
  font-weight: 500;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  background: rgba(91, 58, 239, 0.1);
  color: #5B3AEF;
  transition: background-color .2s ease, color .2s ease, opacity .2s ease;
}
.btn:hover {
  opacity: .85;
}
.btn.clicked {
  background-color: #5B3AEF;
  color: #fff;
}
</style>