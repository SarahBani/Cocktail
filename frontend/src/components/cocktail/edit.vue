<template>
  <div>
    <div v-if="store.loading && !formLoaded" class="status">Loading…</div>
    <NotFound
      v-else-if="!store.selected && formLoaded"
      message="This cocktail doesn't exist"
    />
    <template v-else-if="formLoaded">
      <h1>Edit Cocktail</h1>
      <form @submit.prevent="submitForm" class="cocktail-form">
        <div class="field">
          <label for="title">Title</label>
          <input
            type="text"
            v-model="form.title"
            id="title"
            required
            placeholder="e.g. Mojito"
          />
        </div>
        <div class="field">
          <label for="price">Price (€)</label>
          <input
            type="number"
            v-model="form.price"
            id="price"
            required
            placeholder="e.g. 9.99"
            step="0.01"
          />
        </div>
        <div class="field">
          <label for="description">Description</label>
          <textarea
            v-model="form.description"
            id="description"
            required
            placeholder="Describe the cocktail…"
            rows="4"
          ></textarea>
        </div>
        <button type="submit">Save Changes</button>
        <router-link
          :to="{ name: 'CocktailDetails', params: { id: cocktailId } }"
          class="back-link"
          >← Back to details</router-link
        >
      </form>
    </template>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useCocktailStore } from "@/stores/cocktailStore";
import NotFound from "@/components/not-found.vue";

export default {
  name: "CocktailEdit",
  components: { NotFound },
  setup() {
    const store = useCocktailStore();
    const route = useRoute();

    const cocktailId = Number(route.params.id);
    const form = ref({ title: "", price: "", description: "" });
    const formLoaded = ref(false);

    onMounted(async () => {
      if (!Number.isInteger(cocktailId) || cocktailId <= 0) {
        formLoaded.value = true;
        return;
      }
      await store.fetchCocktail(cocktailId);
      if (store.selected) {
        form.value = {
          title: store.selected.title,
          price: store.selected.price,
          description: store.selected.description,
        };
      }
      formLoaded.value = true;
    });

    const submitForm = () => store.updateCocktail(cocktailId, form.value);

    return { store, form, formLoaded, cocktailId, submitForm };
  },
};
</script>

<style scoped>
.status {
  color: #a89070;
  font-style: italic;
}

h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #c9a84c;
  margin-bottom: 1.5rem;
}

.cocktail-form {
  background: #1a1a2e;
  border: 1px solid #c9a84c22;
  border-radius: 10px;
  padding: 2rem;
  max-width: 480px;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #a89070;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

input,
textarea {
  background: #0f0f1a;
  border: 1px solid #c9a84c44;
  border-radius: 6px;
  color: #e8e0d5;
  font-size: 0.95rem;
  padding: 0.65rem 0.9rem;
  outline: none;
  transition: border-color 0.2s;
  font-family: inherit;
  resize: vertical;
}

input::placeholder,
textarea::placeholder {
  color: #5a5060;
}
input:focus,
textarea:focus {
  border-color: #c9a84c;
}

button {
  margin-top: 0.5rem;
  padding: 0.75rem;
  background: #c9a84c;
  color: #0f0f1a;
  font-weight: 700;
  font-size: 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
}

button:hover {
  background: #e0be6a;
}

.back-link {
  margin-top: 0.5rem;
  color: #a89070;
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.2s;
}

.back-link:hover {
  color: #c9a84c;
}
</style>
