import axios, { AxiosError } from "axios";

const apiClient = axios.create({
  baseURL: process.env.VUE_APP_API_URL ?? "",
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.response.use(
  (res) => res,
  (err: AxiosError) => {
    const error = err.response?.data as Record<string, string> | undefined;
    const detail = error?.detail ?? err.message;
    return Promise.reject(new Error(detail));
  },
);

export default apiClient;
