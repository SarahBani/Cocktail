// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import CocktailList from '@/components/cocktail/list.vue';
import CocktailNew from '@/components/cocktail/new.vue';
import CocktailEdit from '@/components/cocktail/edit.vue';
import CocktailDetails from '@/components/cocktail/details.vue';
import NotFound from '@/components/not-found.vue';

const routes = [
  {
    path: '/',
    name: 'CocktailList',
    component: CocktailList,
  },
  {
    path: '/new',
    name: 'CocktailNew',
    component: CocktailNew,
  },
  {
    path: '/cocktail/:id',
    name: 'CocktailDetails',
    component: CocktailDetails,
  },
  {
    path: '/cocktail/:id/edit',
    name: 'CocktailEdit',
    component: CocktailEdit,
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;