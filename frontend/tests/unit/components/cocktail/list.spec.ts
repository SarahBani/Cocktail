import { mount, flushPromises } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import { ref } from 'vue';
import { createRouter, createWebHashHistory } from 'vue-router';
import CocktailList from '@/components/cocktail/list.vue';
import { useCocktailStore } from '@/stores/cocktailStore';
import { DEBOUNCE_DELAY } from '@/constants';
import type { Cocktail } from '@/services/cocktailService';

jest.mock('@/stores/cocktailStore', () => ({
  useCocktailStore: jest.fn(),
}));

const mockStore = {
  cocktails: ref<Cocktail[]>([]),
  loading: ref(false),
  fetchCocktails: jest.fn(),
  deleteCocktail: jest.fn(),
};

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', component: { template: '<div />' } },
    { path: '/cocktail/:id', name: 'CocktailDetails', component: { template: '<div />' } },
    { path: '/cocktail/:id/edit', name: 'CocktailEdit', component: { template: '<div />' } },
  ],
});

function mountList() {
  return mount(CocktailList, {
    global: {
      plugins: [router],
    },
  });
}

describe('CocktailList', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    jest.clearAllMocks();
    mockStore.cocktails.value = [];
    mockStore.loading.value = false;
    mockStore.fetchCocktails.mockResolvedValue(undefined);
    mockStore.deleteCocktail.mockResolvedValue(undefined);
    (useCocktailStore as unknown as jest.Mock).mockReturnValue(mockStore);
  });

  it('should call fetchCocktails on mount', async () => {
    mountList();
    await flushPromises();
    expect(mockStore.fetchCocktails).toHaveBeenCalled();
  });

  it('should show the loading indicator while loading', () => {
    mockStore.loading.value = true;
    const wrapper = mountList();
    expect(wrapper.find('.status').text()).toContain('Loading');
  });

  it('should show "No cocktails found" when the list is empty', async () => {
    mockStore.loading.value = false;
    mockStore.cocktails.value = [];
    const wrapper = mountList();
    await flushPromises();
    expect(wrapper.find('.status').text()).toContain('No cocktails found');
  });

  it('should render a list item for each cocktail', async () => {
    mockStore.loading.value = false;
    mockStore.cocktails.value = [
      { id: 1, title: 'Mojito', description: 'Mint', price: 8.5 },
      { id: 2, title: 'Daiquiri', description: 'Rum', price: 9.0 },
    ];
    const wrapper = mountList();
    await flushPromises();
    const items = wrapper.findAll('li');
    expect(items).toHaveLength(2);
  });

  it('should display the cocktail title and price for each item', async () => {
    mockStore.loading.value = false;
    mockStore.cocktails.value = [{ id: 1, title: 'Mojito', description: 'Mint', price: 8.5 }];
    const wrapper = mountList();
    await flushPromises();
    expect(wrapper.find('.cocktail-title').text()).toBe('Mojito');
    expect(wrapper.find('.cocktail-price').text()).toContain('8.5');
  });

  describe('search debounce', () => {
    afterEach(() => {
      jest.useRealTimers();
    });

    it('should not call fetchCocktails immediately on input', async () => {
      jest.useFakeTimers();
      const wrapper = mountList();
      await flushPromises();
      jest.clearAllMocks();

      await wrapper.find('input#search').setValue('mojito');
      await wrapper.find('input#search').trigger('input');

      expect(mockStore.fetchCocktails).not.toHaveBeenCalled();
    });

    it('should call fetchCocktails with the search query after the debounce delay', async () => {
      jest.useFakeTimers();
      const wrapper = mountList();
      await flushPromises();
      jest.clearAllMocks();

      await wrapper.find('input#search').setValue('mojito');
      await wrapper.find('input#search').trigger('input');
      jest.advanceTimersByTime(DEBOUNCE_DELAY);

      expect(mockStore.fetchCocktails).toHaveBeenCalledWith('mojito');
    });

    it('should only fire once when input events arrive within the debounce window', async () => {
      jest.useFakeTimers();
      const wrapper = mountList();
      await flushPromises();
      jest.clearAllMocks();

      const input = wrapper.find('input#search');
      await input.setValue('m');
      await input.trigger('input');
      jest.advanceTimersByTime(100);
      await input.setValue('mo');
      await input.trigger('input');
      jest.advanceTimersByTime(100);
      await input.setValue('mojito');
      await input.trigger('input');
      jest.advanceTimersByTime(DEBOUNCE_DELAY);

      expect(mockStore.fetchCocktails).toHaveBeenCalledTimes(1);
      expect(mockStore.fetchCocktails).toHaveBeenCalledWith('mojito');
    });
  });
});
