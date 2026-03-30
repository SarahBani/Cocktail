// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import CocktailList from '@/components/cocktails/list.vue';
import CocktailNew from '@/components/cocktails/new.vue';
import CocktailDetails from '@/components/cocktails/details.vue';

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
    path: '/cocktails/:id',
    name: 'CocktailDetails',
    component: CocktailDetails,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;