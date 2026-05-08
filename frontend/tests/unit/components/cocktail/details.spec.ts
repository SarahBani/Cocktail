import { mount, flushPromises } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import { createRouter, createWebHashHistory } from 'vue-router';
import CocktailDetails from '@/components/cocktail/details.vue';
import { useCocktailStore } from '@/stores/cocktailStore';

jest.mock('@/stores/cocktailStore', () => ({
  useCocktailStore: jest.fn(),
}));

const mockStore = {
  loading: false,
  selected: null as any,
  fetchCocktail: jest.fn(),
  deleteCocktail: jest.fn(),
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
    { path: '/cocktail/:id', name: 'CocktailDetails', component: { template: '<div />' } },
    { path: '/cocktail/:id/edit', name: 'CocktailEdit', component: { template: '<div />' } },
  ],
});

async function mountDetails(id = '1') {
  await router.push(`/cocktail/${id}`);
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
    mockStore.fetchCocktail.mockResolvedValue(undefined);
    mockStore.deleteCocktail.mockResolvedValue(undefined);
    (useCocktailStore as jest.Mock).mockReturnValue(mockStore);
  });

  it('should call fetchCocktail with the numeric route param id on mount', async () => {
    await mountDetails('1');
    await flushPromises();
    expect(mockStore.fetchCocktail).toHaveBeenCalledWith(1);
  });

  it('should not call fetchCocktail for a non-numeric id', async () => {
    await mountDetails('abc');
    await flushPromises();
    expect(mockStore.fetchCocktail).not.toHaveBeenCalled();
  });

  it('should not call fetchCocktail for id 0', async () => {
    await mountDetails('0');
    await flushPromises();
    expect(mockStore.fetchCocktail).not.toHaveBeenCalled();
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

  it('should show NotFound when the cocktail is not found', async () => {
    mockStore.selected = null;
    const wrapper = await mountDetails('999');
    await flushPromises();

    expect(wrapper.find('.not-found').exists()).toBe(true);
    expect(wrapper.find('.detail-card').exists()).toBe(false);
  });

  it('should show NotFound with a descriptive message when no cocktail is selected', async () => {
    mockStore.selected = null;
    const wrapper = await mountDetails();
    await flushPromises();

    expect(wrapper.find('.not-found').exists()).toBe(true);
    expect(wrapper.html()).toContain("This cocktail doesn't exist");
  });

  it('should call deleteCocktail with the selected id when delete is clicked', async () => {
    mockStore.selected = cocktailFixture;
    const wrapper = await mountDetails();
    await flushPromises();

    await wrapper.find('.delete-btn').trigger('click');

    expect(mockStore.deleteCocktail).toHaveBeenCalledWith(1);
  });
});
