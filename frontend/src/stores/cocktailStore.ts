import { defineStore } from "pinia";
import {
  getCocktails,
  getCocktail,
  createCocktail,
  updateCocktail,
  deleteCocktail,
  Cocktail,
} from "@/services/cocktailService";
import { useNotificationStore } from "./notificationStore";

interface CocktailState {
  cocktails: Cocktail[];
  selected: Cocktail | null;
  loading: boolean;
}

export const useCocktailStore = defineStore("cocktail", {
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
      } catch (err: unknown) {
        useNotificationStore().setError((err as Error).message);
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
      } catch (err: unknown) {
        // useNotificationStore().setError((err as Error).message);
      } finally {
        this.loading = false;
      }
    },
    async createCocktail(data: Cocktail) {
      this.loading = true;
      try {
        await createCocktail(data);
        useNotificationStore().setSuccess("Cocktail created successfully!");
      } catch (err: unknown) {
        useNotificationStore().setError((err as Error).message);
      } finally {
        this.loading = false;
      }
    },
    async updateCocktail(id: number, data: Partial<Omit<Cocktail, "id">>) {
      this.loading = true;
      try { 
        const response = await updateCocktail(id, data);
        this.selected = response.data;
        const idx = this.cocktails.findIndex((c: Cocktail) => c.id === id);
        if (idx !== -1) this.cocktails[idx] = response.data;
        useNotificationStore().setSuccess("Cocktail updated successfully!");
      } catch (err: unknown) {
        useNotificationStore().setError((err as Error).message);
      } finally {
        this.loading = false;
      }
    },
    async deleteCocktail(id: number) {
      this.loading = true;
      try {
        await deleteCocktail(id);
        this.cocktails = this.cocktails.filter((c: Cocktail) => c.id !== id);
        useNotificationStore().setSuccess("Cocktail deleted successfully!");
      } catch (err: unknown) {
        useNotificationStore().setError((err as Error).message);
      } finally {
        this.loading = false;
      }
    },
  },
});
