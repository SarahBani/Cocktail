import { setActivePinia, createPinia } from 'pinia';
import { useCocktailStore } from '@/stores/cocktailStore';
import { useNotificationStore } from '@/stores/notificationStore';
import * as cocktailService from '@/services/cocktailService';

jest.mock('@/services/cocktailService');

const mockedGetCocktails = cocktailService.getCocktails as jest.MockedFunction<typeof cocktailService.getCocktails>;
const mockedGetCocktail = cocktailService.getCocktail as jest.MockedFunction<typeof cocktailService.getCocktail>;
const mockedCreateCocktail = cocktailService.createCocktail as jest.MockedFunction<typeof cocktailService.createCocktail>;

const cocktailFixture = { id: 1, title: 'Mojito', description: 'Mint cocktail', price: 8.5 };

describe('cocktailStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    jest.clearAllMocks();
  });

  it('should initialise with empty cocktails, null selected, and loading false', () => {
    const store = useCocktailStore();
    expect(store.cocktails).toEqual([]);
    expect(store.selected).toBeNull();
    expect(store.loading).toBe(false);
  });

  describe('fetchCocktails', () => {
    it('should populate cocktails on success', async () => {
      mockedGetCocktails.mockResolvedValue({ data: [cocktailFixture] } as any);
      const store = useCocktailStore();

      await store.fetchCocktails('');

      expect(store.cocktails).toEqual([cocktailFixture]);
      expect(store.loading).toBe(false);
    });

    it('should set an error notification on failure', async () => {
      mockedGetCocktails.mockRejectedValue(new Error('Network error'));
      const store = useCocktailStore();
      const notification = useNotificationStore();

      await store.fetchCocktails('');

      expect(notification.type).toBe('error');
      expect(notification.message).toBe('Network error');
      expect(store.loading).toBe(false);
    });

    it('should set loading to true while fetching and false when done', async () => {
      let resolveFn!: (v: any) => void;
      mockedGetCocktails.mockReturnValue(new Promise((r) => { resolveFn = r; }) as any);
      const store = useCocktailStore();

      const fetchPromise = store.fetchCocktails('');
      expect(store.loading).toBe(true);

      resolveFn({ data: [] });
      await fetchPromise;
      expect(store.loading).toBe(false);
    });
  });

  describe('fetchCocktail', () => {
    it('should set selected on success', async () => {
      mockedGetCocktail.mockResolvedValue({ data: cocktailFixture } as any);
      const store = useCocktailStore();

      await store.fetchCocktail(1);

      expect(store.selected).toEqual(cocktailFixture);
      expect(store.loading).toBe(false);
    });

    it('should reset selected to null before fetching', async () => {
      const store = useCocktailStore();
      store.selected = cocktailFixture;

      mockedGetCocktail.mockResolvedValue({ data: cocktailFixture } as any);
      await store.fetchCocktail(2);

      expect(mockedGetCocktail).toHaveBeenCalledWith(2);
    });

    it('should set an error notification on failure', async () => {
      mockedGetCocktail.mockRejectedValue(new Error('Not found'));
      const store = useCocktailStore();
      const notification = useNotificationStore();

      await store.fetchCocktail(999);

      expect(notification.type).toBe('error');
      expect(notification.message).toBe('Not found');
    });
  });

  describe('createCocktail', () => {
    it('should set a success notification after creation', async () => {
      mockedCreateCocktail.mockResolvedValue({ data: cocktailFixture } as any);
      const store = useCocktailStore();
      const notification = useNotificationStore();

      await store.createCocktail(cocktailFixture);

      expect(notification.type).toBe('success');
      expect(notification.message).toBe('Cocktail created successfully!');
      expect(store.loading).toBe(false);
    });

    it('should set an error notification when creation fails', async () => {
      mockedCreateCocktail.mockRejectedValue(new Error('Title already taken'));
      const store = useCocktailStore();
      const notification = useNotificationStore();

      await store.createCocktail(cocktailFixture);

      expect(notification.type).toBe('error');
      expect(notification.message).toBe('Title already taken');
    });
  });
});
