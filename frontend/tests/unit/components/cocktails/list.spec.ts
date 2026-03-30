import { mount, flushPromises } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import { createRouter, createWebHashHistory } from 'vue-router';
import CocktailList from '@/components/cocktails/list.vue';
import { useCocktailStore } from '@/stores/cocktailStore';

jest.mock('@/stores/cocktailStore', () => ({
  useCocktailStore: jest.fn(),
  storeToRefs: jest.requireActual('pinia').storeToRefs,
}));

const mockStore = {
  cocktails: [],
  loading: false,
  fetchCocktails: jest.fn(),
};

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', component: { template: '<div />' } },
    { path: '/cocktails/:id', name: 'CocktailDetails', component: { template: '<div />' } },
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
    mockStore.cocktails = [];
    mockStore.loading = false;
    mockStore.fetchCocktails.mockResolvedValue(undefined);
    (useCocktailStore as jest.Mock).mockReturnValue(mockStore);
  });

  it('should call fetchCocktails on mount', async () => {
    mountList();
    await flushPromises();
    expect(mockStore.fetchCocktails).toHaveBeenCalled();
  });

  it('should show the loading indicator while loading', () => {
    mockStore.loading = true;
    const wrapper = mountList();
    expect(wrapper.find('.status').text()).toContain('Loading');
  });

  it('should show "No cocktails found" when the list is empty', async () => {
    mockStore.loading = false;
    mockStore.cocktails = [];
    const wrapper = mountList();
    await flushPromises();
    expect(wrapper.find('.status').text()).toContain('No cocktails found');
  });

  it('should render a list item for each cocktail', async () => {
    mockStore.loading = false;
    mockStore.cocktails = [
      { id: 1, title: 'Mojito', description: 'Mint', price: 8.5 },
      { id: 2, title: 'Daiquiri', description: 'Rum', price: 9.0 },
    ];
    const wrapper = mountList();
    await flushPromises();
    const items = wrapper.findAll('li');
    expect(items).toHaveLength(2);
  });

  it('should display the cocktail title and price for each item', async () => {
    mockStore.loading = false;
    mockStore.cocktails = [{ id: 1, title: 'Mojito', description: 'Mint', price: 8.5 }];
    const wrapper = mountList();
    await flushPromises();
    expect(wrapper.find('.cocktail-title').text()).toBe('Mojito');
    expect(wrapper.find('.cocktail-price').text()).toContain('8.5');
  });

  it('should call fetchCocktails with the search query on input', async () => {
    const wrapper = mountList();
    await flushPromises();
    jest.clearAllMocks();

    const input = wrapper.find('input#search');
    await input.setValue('mojito');
    await input.trigger('input');

    expect(mockStore.fetchCocktails).toHaveBeenCalledWith('mojito');
  });
});
