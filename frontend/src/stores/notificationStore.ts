import { defineStore } from "pinia";

type NotificationType = "success" | "error";

interface NotificationState {
  message: string | null;
  type: NotificationType | null;
}

export const useNotificationStore = defineStore("notification", {
  state: (): NotificationState => ({
    message: null,
    type: null,
  }),
  actions: {
    setError(message: string) {
      this.message = message;
      this.type = "error";
    },
    setSuccess(message: string) {
      this.message = message;
      this.type = "success";
    },
    clear() {
      this.message = null;
      this.type = null;
    },
  },
});
