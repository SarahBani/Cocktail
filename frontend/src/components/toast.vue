<template>
  <div v-if="notification.message" class="toast" :class="notification.type" @click="notification.clear()">
    {{ notification.message }}
  </div>
</template>

<script>
import { useNotificationStore } from '@/stores/notificationStore';

export default {
  name: 'ToastMessage',
  setup() {
    const notification = useNotificationStore();
    return { notification };
  },
};
</script>

<style scoped>
.toast {
  position: fixed;
  top: 1.5rem;
  right: 1.5rem;
  padding: 0.75rem 1.25rem;
  border-radius: 4px;
  color: white;
  cursor: pointer;
  z-index: 1000;
}
.error { background-color: #e53e3e; }
.success { background-color: #38a169; }
</style>
