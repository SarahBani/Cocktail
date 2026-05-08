import apiClient from "./apiClient";
import { API_COCKTAIL_ENDPOINT } from "@/constants";

export interface Cocktail {
  id: number;
  title: string;
  price: number;
  description: string;
}

export const getCocktails = (search?: string) =>
  apiClient.get<Cocktail[]>(API_COCKTAIL_ENDPOINT, { params: { search } });
export const getCocktail = (id: number) =>
  apiClient.get<Cocktail>(`${API_COCKTAIL_ENDPOINT}/${id}`);
export const createCocktail = (data: Omit<Cocktail, "id">) =>
  apiClient.post<Cocktail>(API_COCKTAIL_ENDPOINT, data);
export const updateCocktail = (id: number, data: Partial<Omit<Cocktail, "id">>) =>
  apiClient.put<Cocktail>(`${API_COCKTAIL_ENDPOINT}/${id}`, data);
export const deleteCocktail = (id: number) =>
  apiClient.delete(`${API_COCKTAIL_ENDPOINT}/${id}`);
