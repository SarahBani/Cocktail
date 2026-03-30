import { mount, flushPromises } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import { createRouter, createWebHashHistory } from 'vue-router';
import CocktailNew from '@/components/cocktails/new.vue';
import { useCocktailStore } from '@/stores/cocktailStore';
import { useNotificationStore } from '@/stores/notificationStore';

jest.mock('@/stores/cocktailStore', () => ({
  useCocktailStore: jest.fn(),
}));

const mockCocktailStore = {
  createCocktail: jest.fn(),
};

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', component: { template: '<div />' } },
    { path: '/new', component: { template: '<div />' } },
  ],
});

function mountNew() {
  return mount(CocktailNew, {
    global: { plugins: [router] },
  });
}

describe('CocktailNew', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    jest.clearAllMocks();
    mockCocktailStore.createCocktail.mockResolvedValue(undefined);
    (useCocktailStore as jest.Mock).mockReturnValue(mockCocktailStore);
  });

  it('should render the title, price, and description fields', () => {
    const wrapper = mountNew();
    expect(wrapper.find('#title').exists()).toBe(true);
    expect(wrapper.find('#price').exists()).toBe(true);
    expect(wrapper.find('#description').exists()).toBe(true);
  });

  it('should call createCocktail with form values on submit', async () => {
    const wrapper = mountNew();

    await wrapper.find('#title').setValue('Mojito');
    await wrapper.find('#price').setValue('8.5');
    await wrapper.find('#description').setValue('Mint cocktail');
    await wrapper.find('form').trigger('submit');

    expect(mockCocktailStore.createCocktail).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Mojito', description: 'Mint cocktail' }),
    );
  });

  it('should reset the form fields when the notification type changes to "success"', async () => {
    const wrapper = mountNew();
    const notification = useNotificationStore();

    await wrapper.find('#title').setValue('Mojito');
    await wrapper.find('#price').setValue('8.5');
    await wrapper.find('#description').setValue('Mint cocktail');

    notification.setSuccess('Cocktail created!');
    await flushPromises();

    expect((wrapper.find('#title').element as HTMLInputElement).value).toBe('');
    expect((wrapper.find('#description').element as HTMLTextAreaElement).value).toBe('');
  });

  it('should not reset the form when the notification type changes to "error"', async () => {
    const wrapper = mountNew();
    const notification = useNotificationStore();

    await wrapper.find('#title').setValue('Mojito');
    notification.setError('Something went wrong');
    await flushPromises();

    expect((wrapper.find('#title').element as HTMLInputElement).value).toBe('Mojito');
  });
});
