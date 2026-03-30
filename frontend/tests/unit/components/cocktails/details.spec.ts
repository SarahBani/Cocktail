import { mount, flushPromises } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import { createRouter, createWebHashHistory } from 'vue-router';
import CocktailDetails from '@/components/cocktails/details.vue';
import { useCocktailStore } from '@/stores/cocktailStore';

jest.mock('@/stores/cocktailStore', () => ({
  useCocktailStore: jest.fn(),
}));

const mockStore = {
  loading: false,
  selected: null as any,
  error: null as string | null,
  fetchCocktail: jest.fn(),
};

const cocktailFixture = {
  id: 1,
  title: 'Mojito',
  description: 'A refreshing mint cocktail',
  price: 8.5,
};

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', component: { template: '<div />' } },
    { path: '/cocktails/:id', name: 'CocktailDetails', component: { template: '<div />' } },
  ],
});

async function mountDetails(id = '1') {
  await router.push(`/cocktails/${id}`);
  return mount(CocktailDetails, {
    global: { plugins: [router] },
  });
}

describe('CocktailDetails', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    jest.clearAllMocks();
    mockStore.loading = false;
    mockStore.selected = null;
    mockStore.error = null;
    mockStore.fetchCocktail.mockResolvedValue(undefined);
    (useCocktailStore as jest.Mock).mockReturnValue(mockStore);
  });

  it('should call fetchCocktail with the route param id on mount', async () => {
    await mountDetails('1');
    await flushPromises();
    expect(mockStore.fetchCocktail).toHaveBeenCalledWith('1');
  });

  it('should show the loading indicator while loading', async () => {
    mockStore.loading = true;
    const wrapper = await mountDetails();
    expect(wrapper.find('.status').text()).toContain('Loading');
  });

  it('should render cocktail details when selected is set', async () => {
    mockStore.selected = cocktailFixture;
    const wrapper = await mountDetails();
    await flushPromises();

    expect(wrapper.find('h1').text()).toBe('Mojito');
    expect(wrapper.find('.description').text()).toContain('refreshing mint cocktail');
    expect(wrapper.find('.price-badge').text()).toContain('8.5');
  });

  it('should show the error message when store.error is set', async () => {
    mockStore.error = 'Cocktail not found';
    const wrapper = await mountDetails('999');
    await flushPromises();

    expect(wrapper.find('.error-text').text()).toContain('Cocktail not found');
  });

  it('should render nothing meaningful when not loading, no error, and no selected', async () => {
    mockStore.loading = false;
    mockStore.selected = null;
    mockStore.error = null;
    const wrapper = await mountDetails();
    await flushPromises();

    expect(wrapper.find('.detail-card').exists()).toBe(false);
    expect(wrapper.find('.error-text').exists()).toBe(false);
  });
});
