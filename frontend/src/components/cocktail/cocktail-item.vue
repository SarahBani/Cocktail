<template>
  <li>
    <router-link
      :to="{ name: 'CocktailDetails', params: { id: item.id } }"
      class="cocktail-card"
    >
      <div class="cocktail-thumb" :style="thumbStyle(item.id)">🍹</div>
      <span class="cocktail-title">{{ item.title }}</span>
      <div class="cocktail-end">
        <span class="cocktail-price">{{ item.price }}€</span>
        <router-link
          :to="{ name: 'CocktailEdit', params: { id: item.id } }"
          class="edit-btn"
          @click.stop
          >Edit</router-link
        >
        <button class="delete-btn" @click.prevent="onDelete(item.id)">
          Delete
        </button>
      </div>
    </router-link>
  </li>
</template>

<script>
import { defineComponent } from "vue";
import { useCocktailStore } from "@/stores/cocktailStore";
import { HUE_MULTIPLIER, HUE_OFFSET, HUE_RANGE } from "@/constants";

export default defineComponent({
  name: "CocktailItem",
  props: {
    item: {
      type: Object,
      required: true,
    },
  },
  setup() {
    const store = useCocktailStore();

    const thumbStyle = (id) => {
      const hue = (id * HUE_MULTIPLIER) % HUE_RANGE;
      return {
        background: `linear-gradient(135deg, hsl(${hue},70%,35%), hsl(${(hue + HUE_OFFSET) % HUE_RANGE},80%,25%))`,
      };
    };

    const onDelete = (id) => store.deleteCocktail(id);

    return { thumbStyle, onDelete };
  },
});
</script>

<style scoped>
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

.cocktail-end {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.edit-btn {
  background: transparent;
  border: 1px solid #c9a84c88;
  color: #c9a84c;
  font-size: 0.85rem;
  padding: 0.3rem 0.75rem;
  border-radius: 6px;
  cursor: pointer;
  text-decoration: none;
  transition: background 0.2s, border-color 0.2s;
  flex-shrink: 0;
}

.edit-btn:hover {
  background: #c9a84c22;
  border-color: #c9a84c;
}

.delete-btn {
  background: transparent;
  border: 1px solid #c0392b88;
  color: #e74c3c;
  font-size: 0.85rem;
  padding: 0.3rem 0.75rem;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
  flex-shrink: 0;
}

.delete-btn:hover {
  background: #c0392b22;
  border-color: #e74c3c;
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
