<template>
  <div>
    <h1>Cocktails</h1>
    <CocktailSearch />
    <div v-if="loading" class="status">Loading…</div>
    <template v-else>
      <p v-if="cocktails.length === 0" class="status">No cocktails found.</p>
      <ul v-else class="cocktail-list">
        <CocktailItem v-for="item in cocktails" :key="item.id" :item="item" />
      </ul>
    </template>
  </div>
</template>

<script>
import { onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useCocktailStore } from "@/stores/cocktailStore";
import CocktailSearch from "./search.vue";
import CocktailItem from "./cocktail-item.vue";

export default {
  name: "CocktailList",
  components: { CocktailSearch, CocktailItem },
  setup() {
    const store = useCocktailStore();
    const { cocktails, loading } = storeToRefs(store);

    onMounted(() => store.fetchCocktails());

    return { cocktails, loading };
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
</style>
