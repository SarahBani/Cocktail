import apiClient from "./apiClient";

export interface Cocktail {
  id: number;
  title: string;
  price: number;
  description: string;
}

export const getCocktails = (search?: string) =>
  apiClient.get<Cocktail[]>("/cocktails", { params: search });
export const getCocktail = (id: number) =>
  apiClient.get<Cocktail>(`/cocktails/${id}`);
export const createCocktail = (data: Omit<Cocktail, "id">) =>
  apiClient.post<Cocktail>("/cocktails", data);
