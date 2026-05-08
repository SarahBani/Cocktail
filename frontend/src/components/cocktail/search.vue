<template>
  <div class="search-bar">
    <input
      type="text"
      id="search"
      v-model="searchQuery"
      @input="onSearch"
      placeholder="Search by description…"
    />
  </div>
</template>

<script>
import { ref } from "vue";
import { useCocktailStore } from "@/stores/cocktailStore";
import { DEBOUNCE_DELAY } from "@/constants";

export default {
  name: "CocktailSearch",
  setup() {
    const store = useCocktailStore();
    const searchQuery = ref("");
    let debounceTimer;

    const onSearch = () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => store.fetchCocktails(searchQuery.value), DEBOUNCE_DELAY);
    };

    return { searchQuery, onSearch };
  },
};
</script>

<style scoped>
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
</style>
