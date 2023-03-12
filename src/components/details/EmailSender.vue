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
import {GoogleOAuthProvider} from 'google-oauth-gsi';
import {onMounted, ref} from "vue";
import ModalWindow from "../modal/ModalWindow.vue";

const email = ref('');
const popup = ref(null);
const a = ref(null);

onMounted(async () => {
  await init();

  if (localStorage.getItem('email')) {
    email.value = localStorage.getItem('email');
    return;
  }

  const result = await popup.value.open();

  localStorage.setItem('email', email.value);
});

async function init() {
  const googleProvider = new GoogleOAuthProvider({
    clientId: CLIENT_ID,
    onScriptLoadError: () => console.log('onScriptLoadError'),
    onScriptLoadSuccess: () => console.log('onScriptLoadSuccess'),
  });
  console.log(googleProvider);
  console.log('end auth');
}


async function send(type, name, chunk) {
  console.log(a.value.href);
  URL.revokeObjectURL(a.value.href);
  try {
    const reader = new FileReader();
    reader.readAsDataURL(chunk);
    const chunk64 = await new Promise((resolve, reject) => {
      reader.onloadend = () => resolve(reader.result.split(',')[1]);
    })
    await sendMail(type, 'video/webm; name="' + name + '"', chunk64);
    localStorage.setItem('email', email.value);
  } catch (e) {
    console.error(e)
    console.log(e);
    console.log(chunk);
    a.value.href = URL.createObjectURL(chunk);
    a.value.download = name;
    a.value.click();
  }
}

async function sendMail(subject, mime_type, body) {
  const headers = {
    'From': '',
    'To': email.value,
    'Subject': 'Balajahe CCTV: ' + subject,
    'Content-Type': mime_type,
    'Content-transfer-encoding': 'base64'
  }
  let head = '';
  for (const [k, v] of Object.entries(headers)) head += k + ': ' + v + '\r\n'
  console.log(gapi);
  const request = gapi.client.gmail.users.messages.send({
    'userId': 'me',
    'resource': {'raw': btoa(head + '\r\n' + body)}
  });

  return new Promise((resolve, reject) => {
    request.execute((res) => {
      if (!res.code) resolve()
      else reject(res)
    })
  });
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