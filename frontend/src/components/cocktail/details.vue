<template>
  <div>
    <div v-if="store.loading" class="status">Loading…</div>
    <NotFound
      v-else-if="!store.selected"
      message="This cocktail doesn't exist"
    />
    <div v-else class="detail-card">
      <div class="hero-img" :style="heroStyle(store.selected.id)">🍹</div>
      <div class="detail-body">
        <h1>{{ store.selected.title }}</h1>
        <p class="description">{{ store.selected.description }}</p>
        <div class="price-badge">{{ store.selected.price }}€</div>
        <div class="actions">
          <router-link to="/" class="back-link">← Back to list</router-link>
          <div class="actions-right">
            <router-link
              :to="{ name: 'CocktailEdit', params: { id: store.selected.id } }"
              class="edit-btn"
              >Edit</router-link
            >
            <button class="delete-btn" @click="onDelete">Delete</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useCocktailStore } from "@/stores/cocktailStore";
import NotFound from "@/components/not-found.vue";
import { useNotificationStore } from "@/stores/notificationStore";
import { storeToRefs } from "pinia";
import { heroStyle } from "@/utils/heroStyle";

export default {
  name: "CocktailDetails",
  components: { NotFound },
  setup() {
    const store = useCocktailStore();
    const notificationStore = useNotificationStore();
    const route = useRoute();
    const router = useRouter();
    const { type } = storeToRefs(notificationStore);

    onMounted(() => {
      const id = Number(route.params.id);
      if (!Number.isInteger(id) || id <= 0) return;
      store.fetchCocktail(id);
    });

    const onDelete = () => {
      if (!store.selected) return;
      store.deleteCocktail(store.selected.id);
    };

    watch(type, (val) => {
      if (val === "success") {
        router.push("/");
      }
    });

    return { store, heroStyle, onDelete };
  },
};
</script>

<style scoped>
.status {
  color: #a89070;
  font-style: italic;
}

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

.actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.5rem;
}

.actions-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.back-link {
  color: #a89070;
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.2s;
}

.back-link:hover {
  color: #c9a84c;
}

.edit-btn {
  background: transparent;
  border: 1px solid #c9a84c88;
  color: #c9a84c;
  font-size: 0.9rem;
  padding: 0.35rem 0.85rem;
  border-radius: 6px;
  cursor: pointer;
  text-decoration: none;
  transition: background 0.2s, border-color 0.2s;
}

.edit-btn:hover {
  background: #c9a84c22;
  border-color: #c9a84c;
}

.delete-btn {
  background: transparent;
  border: 1px solid #c0392b88;
  color: #e74c3c;
  font-size: 0.9rem;
  padding: 0.35rem 0.85rem;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
}

.delete-btn:hover {
  background: #c0392b22;
  border-color: #e74c3c;
}
</style>
