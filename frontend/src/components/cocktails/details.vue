<template>
  <div>
    <div v-if="store.loading" class="status">Loading…</div>
    <div v-else-if="store.error" class="status error-text">{{ store.error }}</div>
    <div v-else-if="store.selected" class="detail-card">
      <div class="hero-img" :style="heroStyle(store.selected.id)">🍹</div>
      <div class="detail-body">
        <h1>{{ store.selected.title }}</h1>
        <p class="description">{{ store.selected.description }}</p>
        <div class="price-badge">{{ store.selected.price }}€</div>
        <router-link to="/" class="back-link">← Back to list</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { onMounted } from "vue";
import { useRoute } from "vue-router";
import { useCocktailStore } from "@/stores/cocktailStore";

export default {
  name: "CocktailDetails",
  setup() {
    const store = useCocktailStore();
    const route = useRoute();
    onMounted(() => store.fetchCocktail(route.params.id));

    const heroStyle = (id) => {
      const hue = (id * 67) % 360;
      return { background: `linear-gradient(135deg, hsl(${hue},70%,30%), hsl(${(hue + 40) % 360},80%,20%))` };
    };

    return { store, heroStyle };
  },
};
</script>

<style scoped>
.status { color: #a89070; font-style: italic; }
.error-text { color: #e53e3e; }

.detail-card {
  background: #1a1a2e;
  border: 1px solid #c9a84c22;
  border-radius: 10px;
  overflow: hidden;
  max-width: 600px;
}

.hero-img {
  width: 100%;
  height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 6rem;
}

.detail-body {
  padding: 1.75rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #c9a84c;
}

.description {
  color: #a89070;
  line-height: 1.6;
  font-size: 0.95rem;
}

.price-badge {
  display: inline-block;
  background: #c9a84c22;
  border: 1px solid #c9a84c55;
  color: #c9a84c;
  font-weight: 700;
  font-size: 1.1rem;
  padding: 0.35rem 0.85rem;
  border-radius: 20px;
  width: fit-content;
}

.back-link {
  margin-top: 0.5rem;
  color: #a89070;
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.2s;
}

.back-link:hover { color: #c9a84c; }
</style>
