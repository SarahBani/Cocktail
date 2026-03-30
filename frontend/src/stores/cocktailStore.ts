import { defineStore } from "pinia";
import {
  getCocktails,
  getCocktail,
  createCocktail,
  Cocktail,
} from "@/services/cocktailService";
import { useNotificationStore } from "./notificationStore";

interface CocktailState {
  cocktails: Cocktail[];
  selected: Cocktail | null;
  loading: boolean;
}

export const useCocktailStore = defineStore("cocktails", {
  state: (): CocktailState => ({
    cocktails: [],
    selected: null,
    loading: false,
  }),
  actions: {
    async fetchCocktails(search: string) {
      this.loading = true;
      try {
        const response = await getCocktails(search);
        this.cocktails = response.data;
      } catch (err: { message: string }) {
        useNotificationStore().setError(err.message);
      } finally {
        this.loading = false;
      }
    },
    async fetchCocktail(id: number) {
      this.loading = true;
      this.selected = null;
      try {
        const response = await getCocktail(id);
        this.selected = response.data;
      } catch (err: { message: string }) {
        useNotificationStore().setError(err.message);
      } finally {
        this.loading = false;
      }
    },
    async createCocktail(data: Cocktail) {
      this.loading = true;
      try {
        await createCocktail(data);
        useNotificationStore().setSuccess("Cocktail created successfully!");
      } catch (err: { message: string }) {
        useNotificationStore().setError(err.message);
      } finally {
        this.loading = false;
      }
    },
  },
});
