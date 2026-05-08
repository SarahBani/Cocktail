import { setActivePinia, createPinia } from 'pinia';
import { useCocktailStore } from '@/stores/cocktailStore';
import { useNotificationStore } from '@/stores/notificationStore';
import * as cocktailService from '@/services/cocktailService';

jest.mock('@/services/cocktailService');

const mockedGetCocktails = cocktailService.getCocktails as jest.MockedFunction<typeof cocktailService.getCocktails>;
const mockedGetCocktail = cocktailService.getCocktail as jest.MockedFunction<typeof cocktailService.getCocktail>;
const mockedCreateCocktail = cocktailService.createCocktail as jest.MockedFunction<typeof cocktailService.createCocktail>;
const mockedUpdateCocktail = cocktailService.updateCocktail as jest.MockedFunction<typeof cocktailService.updateCocktail>;
const mockedDeleteCocktail = cocktailService.deleteCocktail as jest.MockedFunction<typeof cocktailService.deleteCocktail>;

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

    it('should leave selected null and reset loading on failure', async () => {
      mockedGetCocktail.mockRejectedValue(new Error('Not found'));
      const store = useCocktailStore();

      await store.fetchCocktail(999);

      expect(store.selected).toBeNull();
      expect(store.loading).toBe(false);
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

  describe('updateCocktail', () => {
    it('should update selected and the cocktails list on success', async () => {
      const updated = { ...cocktailFixture, price: 10.0 };
      mockedUpdateCocktail.mockResolvedValue({ data: updated } as any);
      const store = useCocktailStore();
      store.cocktails = [cocktailFixture];
      store.selected = cocktailFixture;

      await store.updateCocktail(1, { price: 10.0 });

      expect(store.selected).toEqual(updated);
      expect(store.cocktails[0]).toEqual(updated);
    });

    it('should set a success notification after update', async () => {
      mockedUpdateCocktail.mockResolvedValue({ data: cocktailFixture } as any);
      const store = useCocktailStore();
      const notification = useNotificationStore();

      await store.updateCocktail(1, { price: 10.0 });

      expect(notification.type).toBe('success');
      expect(notification.message).toBe('Cocktail updated successfully!');
    });

    it('should set an error notification when update fails', async () => {
      mockedUpdateCocktail.mockRejectedValue(new Error('Not found'));
      const store = useCocktailStore();
      const notification = useNotificationStore();

      await store.updateCocktail(999, { price: 10.0 });

      expect(notification.type).toBe('error');
      expect(notification.message).toBe('Not found');
      expect(store.loading).toBe(false);
    });
  });

  describe('deleteCocktail', () => {
    it('should remove the cocktail from the list on success', async () => {
      mockedDeleteCocktail.mockResolvedValue({ data: undefined } as any);
      const store = useCocktailStore();
      store.cocktails = [cocktailFixture, { id: 2, title: 'Daiquiri', description: 'Rum', price: 9.0 }];

      await store.deleteCocktail(1);

      expect(store.cocktails).toHaveLength(1);
      expect(store.cocktails[0].id).toBe(2);
    });

    it('should set a success notification after deletion', async () => {
      mockedDeleteCocktail.mockResolvedValue({ data: undefined } as any);
      const store = useCocktailStore();
      const notification = useNotificationStore();

      await store.deleteCocktail(1);

      expect(notification.type).toBe('success');
      expect(notification.message).toBe('Cocktail deleted successfully!');
    });

    it('should set an error notification when deletion fails', async () => {
      mockedDeleteCocktail.mockRejectedValue(new Error('Server error'));
      const store = useCocktailStore();
      const notification = useNotificationStore();

      await store.deleteCocktail(1);

      expect(notification.type).toBe('error');
      expect(notification.message).toBe('Server error');
      expect(store.loading).toBe(false);
    });
  });
});
