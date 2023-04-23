<template>
  <div>
    <ModalWindow ref="popup" size="l" :is-confirm="true">
      <h2>Пожалуйста, введите gmail почту</h2>
      <input v-model="email" type="text" class="input" placeholder="example@gmail.com">
    </ModalWindow>
    <a ref="a" href="#" class="link" id="link">link</a>
  </div>
</template>

<script setup>
import {API_KEY, CLIENT_ID} from "@/consts";
import {onMounted, ref} from "vue";
import ModalWindow from "../modal/ModalWindow.vue";
import {sendForm} from "@emailjs/browser";

const email = ref('');
const popup = ref(null);
const a = ref(null);

async function send(type, name, chunk) {
  console.log(type);
  console.log(name);
  console.log(chunk);
  sendForm()
}

defineExpose({
  send,
})
</script>

<style scoped>
h2 {
  margin-bottom: 10px;
}

.input {
  width: 100%;
  border-radius: 6px;
  padding: .7rem 1.4rem;
  outline: none;
  border: none;
  background-color: #e5e5f8;
  transition: box-shadow .2s ease;
}

.input:focus {
  box-shadow: 0 0 0 2px rgba(91, 58, 239, 0.8);
}

#link {
  display: none;
}
</style>