<template>
  <main>
    <div class="container">
      <div class="card interface" id="div">
        <div class="wrapper">
          <video ref="video" autoplay muted id="video"></video>
          <canvas ref="canvas" class="canvas" width="640" height="480"></canvas>
          <canvas id="bbox" ref="bbox" width="640" height="480"></canvas>
        </div>
        <nav class="buttons">
          <MainButton @on="onDetect" @off="offDetect">
            <template #firstState>Включить распознавание</template>
            <template #secondState>Выключить распознавание</template>
          </MainButton>
        </nav>
        <audio ref="alarm" loop src='/alarm.mp3'></audio>
      </div>
    </div>
  </main>
</template>

<script setup>

import {computed, onMounted, ref} from "vue";
import MainButton from "../buttons/MainButton.vue";
import {CHUNK_DURATION} from "@/consts";
import {read, utils, write} from "xlsx";
import {downloadFile} from "@/utils";
import {makeExcelFileByData} from "../../utils";

const video = ref(null);
const canvas = ref(null);
const bbox = ref(null);
const alarm = ref(null);
const sender = ref(null);

const stream = ref({});
const sizes = ref({});
const isDetecting = ref(false);
const chunk = ref(null);
const detected = ref(false);
const detector = ref(null);
const recorder = ref({
  rec: null,
  interval: null,
  num: 0,
});

const ctx = computed(() => {
  return canvas.value.getContext('2d');
});
const capture = computed(() => {
  return new ImageCapture(stream.value.getVideoTracks()[0]);
});

onMounted(() => {
  init();
});

function downloadReport(name, chunk) {
  const date = new Date(Date.now());
  const timeString = date.toLocaleTimeString('ru');
  const dateString = date.toLocaleDateString('ru');
  const isAfterVideoState = /after/.test(name);
  const data = [
    ['Название: ', name],
    ['Дата выхода сотрдуника из кадра: ', dateString],
    ['Время выхода сотрудника из кадра: ', timeString],
  ];

  data.push(
      [
        'Состояние в видео: ',
        isAfterVideoState ? 'Сотрудник покинул рабочее место' : 'Сотрудник в процессе покидания рабочего места',
      ]
  );

  const blob = makeExcelFileByData(data);
  downloadFile(blob, 'xlsx');
}

async function init() {
  await getUserMedia();
  recorder.value.rec = new MediaRecorder(stream.value, {mimeType: "video/webm"});
  await addListeners();
  await loadDetector();
}

async function getUserMedia() {
  stream.value = await navigator.mediaDevices.getUserMedia(
      {video: {facingMode: {ideal: "environment"}}, audio: true}
  );

  video.value.srcObject = stream.value;

  await new Promise((resolve, reject) => {
    video.value.onloadedmetadata = (_) => resolve()
  });

  sizes.value.w = bbox.value.width = canvas.value.width = video.value.videoWidth;
  sizes.value.h = bbox.value.height = canvas.value.height = video.value.videoHeight;
}

function addListeners() {
  recorder.value.rec.ondataavailable = (ev) => {
    chunk.value = ev.data;
    if (recorder.value.num > 0 && !detected.value && isDetecting.value) {
      sendChunk();
      recorder.value.num--;
    }
  }
}

async function grabVideo() {
  if (isDetecting.value) {
    ctx.value.drawImage(await capture.value.grabFrame(), 0, 0);
    const img = ctx.value.getImageData(0, 0, sizes.value.w, sizes.value.h);
    detector.value.postMessage(img);
    const result = await new Promise((resolve, reject) => {
      detector.value.onmessage = (ev) => resolve(ev.data)
    });

    if (result.ok) {
      detected.value = true

      if (recorder.value.num === 0) {
        recorder.value.num = 2
      }

      drawBbox(result.bbox);
      alarm.value.pause();
    } else {
      alarm.value.play();
      stopDetect();
    }

    grabVideo();
  } else {
    alarm.value.pause();
    stopDetect();
  }
}

function playAlarm() {
  if (!isDetecting.value) {
    alarm.value.play();
  }
}

async function sendChunk() {
  if (chunk.value !== null && chunk.value.size > 0) {
    const type = recorder.value.num === 0 ? 'before' : recorder.value.num === 2 ? 'during' : 'after';
    const name = Date.now() + ' - ' + type + '.webm';
    await downloadVideo(chunk.value.slice(), name);
  }
}

function downloadVideo(chunk, name) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(chunk);
  a.download = name;
  a.click();
  a.remove();

  downloadReport(name, chunk);
}

async function loadDetector() {
  detector.value = new Worker('/detect.js');
  await new Promise((resolve, reject) => {
    detector.value.onmessage = (_) => resolve()
  });
}


function onDetect() {
  recorder.value.rec.start();
  recorder.value.num = 0;
  recorder.value.interval = setInterval(() => {
    recorder.value.rec.stop();
    recorder.value.rec.start();
  }, CHUNK_DURATION);
  chunk.value = null;
  isDetecting.value = true;
  grabVideo();
}

function offDetect() {
  recorder.value.rec.stop();
  clearInterval(recorder.value.interval);
  isDetecting.value = false;
}

function drawBbox(box) {
  const c = bbox.value.getContext('2d');
  c.clearRect(0, 0, sizes.value.w, sizes.value.h);

  if (box !== null) {
    c.lineWidth = 2;
    c.strokeStyle = 'rgba(255,255,255,0.6)';
    c.strokeRect(box[0], box[1], box[2], box[3]);
  }
}

function stopDetect() {
  detected.value = false;
  drawBbox(null);
}

function offAlarm() {
  alarm.value.pause();
}

function onAlarm() {
  alarm.value.play();
}
</script>

<style scoped>
.container {
  max-width: 1300px;
  margin: auto;
  height: 100vh;
}

.buttons {
  margin-top: 20px;
  display: flex;
  gap: 10px;
}

.interface {
  display: flex;
  width: fit-content;
  flex-direction: column;
  margin: 100px auto 0 auto;
}

#video {
  border-radius: 8px;
}

.canvas {
  display: none;
}

.wrapper {

  position: relative;
}

#bbox {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
}

#link {
  display: none;
}
</style>