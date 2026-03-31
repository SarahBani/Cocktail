<template>
  <div class="not-found">
    <div class="not-found-icon">🍸</div>
    <h1>404</h1>
    <p class="message">{{ message }}</p>
    <router-link to="/" class="back-link">← Back to list</router-link>
  </div>
</template>

<script>
export default {
  name: "NotFound",
  props: {
    message: {
      type: String,
      default: "Page not found",
    },
  },
};
</script>

<style scoped>
.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 4rem 2rem;
  text-align: center;
}

.not-found-icon {
  font-size: 5rem;
  filter: grayscale(1) opacity(0.4);
}

h1 {
  font-size: 5rem;
  font-weight: 700;
  color: #c9a84c;
  line-height: 1;
  margin: 0;
}

.message {
  color: #a89070;
  font-size: 1.05rem;
}

.back-link {
  color: #a89070;
  text-decoration: none;
  font-size: 0.9rem;
  margin-top: 0.5rem;
  transition: color 0.2s;
}

.back-link:hover {
  color: #c9a84c;
}
</style>
