<template>
  <Transition>
    <div
        v-if="isOpen"
        class="bc-modal"
        @click="close"
    >
      <div
          class="card"
          :data-size="props.size"
          @click.stop
      >
        <div class="slot-content">
          <slot />
        </div>

        <div class="bottom-panel">
          <div class="flex-row g10">
            <MainButton
                v-if="!props.isConfirm"
                @click="close"
            >
              Закрыть
            </MainButton>
            <MainButton
                v-if="props.isConfirm"
                @click="close"
            >
              Отмена
            </MainButton>
            <MainButton
                v-if="props.isConfirm"
                @click="confirm"
            >
              Подтвердить
            </MainButton>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import {ref} from "vue";
import MainButton from "../buttons/MainButton.vue";

const props = defineProps({
  isConfirm: {
    type: Boolean,
    required: false,
    default: false,
  },
  size: {
    type: String,
    required: false,
    default: 'm'
  }
});

const isOpen = ref(false);
let modalController = {};

function close() {
  isOpen.value = false;
  modalController.resolve(false);
}

function confirm() {
  isOpen.value = false;
  modalController.resolve(true);
}
function open() {
  isOpen.value = true;

  return new Promise((res, rej) => {
    modalController.reject = rej;
    modalController.resolve = res;
  });
}

defineExpose({
  confirm,
  open,
});

</script>

<style scoped>
.bc-modal {
  background-color: rgba(0, 0, 0, 0.5);
  top: 0;
  left: 0;
  position: fixed;
  width: 100%;
  height: 100%;
}
.slot-content {
  padding-bottom: 20px;
}
.bottom-panel > .flex-row {
  justify-content: flex-end;
}
.card {
  margin: 100px auto 0 auto;
  width: 100%;
}
.card[data-size='s'] {
  max-width: 300px;
}
.card[data-size='m'] {
  max-width: 430px;
}
.card[data-size='l'] {
  max-width: 600px;
}
.card[data-size='xl'] {
  max-width: 1000px;
}

.flex-row {
  display: flex;
}

.g10 {
  gap: 10px;
}

.v-enter-active,
.v-leave-active {
  transition: opacity 0.2s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}

</style>