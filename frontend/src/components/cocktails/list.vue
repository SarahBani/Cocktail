<template>
  <div>
    <h1>Cocktails</h1>
    <div class="search-bar">
      <input
        type="text"
        id="search"
        v-model="searchQuery"
        @input="onSearch"
        placeholder="Search by description…"
      />
    </div>
    <div v-if="loading" class="status">Loading…</div>
    <template v-else>
      <p v-if="cocktails.length === 0" class="status">No cocktails found.</p>
      <ul v-else class="cocktail-list">
        <li v-for="item in cocktails" :key="item.id">
          <router-link
            :to="{ name: 'CocktailDetails', params: { id: item.id } }"
            class="cocktail-card"
          >
            <div class="cocktail-thumb" :style="thumbStyle(item.id)">🍹</div>
            <span class="cocktail-title">{{ item.title }}</span>
            <span class="cocktail-price">{{ item.price }}€</span>
          </router-link>
        </li>
      </ul>
    </template>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useCocktailStore } from "@/stores/cocktailStore";

export default {
  name: "CocktailList",
  setup() {
    const store = useCocktailStore();
    const { cocktails, loading } = storeToRefs(store);
    const searchQuery = ref("");

    const onSearch = () => store.fetchCocktails(searchQuery.value || undefined);

    onMounted(() => store.fetchCocktails());

    const thumbStyle = (id) => {
      const hue = (id * 67) % 360;
      return {
        background: `linear-gradient(135deg, hsl(${hue},70%,35%), hsl(${
          (hue + 40) % 360
        },80%,25%))`,
      };
    };

    return { cocktails, loading, searchQuery, onSearch, thumbStyle };
  },
};
</script>

<style scoped>
h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #c9a84c;
  margin-bottom: 1.5rem;
}

.search-bar {
  margin-bottom: 1.5rem;
}

.search-bar input {
  width: 100%;
  padding: 0.65rem 1rem;
  background: #1a1a2e;
  border: 1px solid #c9a84c55;
  border-radius: 6px;
  color: #e8e0d5;
  font-size: 0.95rem;
  outline: none;
  transition: border-color 0.2s;
}

.search-bar input::placeholder {
  color: #5a5060;
}
.search-bar input:focus {
  border-color: #c9a84c;
}

.status {
  color: #a89070;
  font-style: italic;
}

.cocktail-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.cocktail-thumb {
  width: 56px;
  height: 56px;
  border-radius: 8px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  border: 1px solid #c9a84c33;
}

.cocktail-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  justify-content: space-between;
  padding: 0.75rem 1.25rem;
  background: #1a1a2e;
  border: 1px solid #c9a84c22;
  border-radius: 8px;
  text-decoration: none;
  transition: border-color 0.2s, background 0.2s;
}

.cocktail-card:hover {
  border-color: #c9a84c;
  background: #22223a;
}

.cocktail-title {
  font-weight: 600;
  color: #e8e0d5;
  font-size: 1rem;
}

.cocktail-price {
  font-weight: 700;
  color: #c9a84c;
  font-size: 0.95rem;
}
</style>
