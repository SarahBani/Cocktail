import { setActivePinia, createPinia } from 'pinia';
import { useNotificationStore } from '@/stores/notificationStore';

describe('notificationStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('should initialise with null message and type', () => {
    const store = useNotificationStore();
    expect(store.message).toBeNull();
    expect(store.type).toBeNull();
  });

  describe('setError', () => {
    it('should set message and type to error', () => {
      const store = useNotificationStore();
      store.setError('Something went wrong');
      expect(store.message).toBe('Something went wrong');
      expect(store.type).toBe('error');
    });
  });

  describe('setSuccess', () => {
    it('should set message and type to success', () => {
      const store = useNotificationStore();
      store.setSuccess('Cocktail created!');
      expect(store.message).toBe('Cocktail created!');
      expect(store.type).toBe('success');
    });
  });

  describe('clear', () => {
    it('should reset message and type to null', () => {
      const store = useNotificationStore();
      store.setError('oops');
      store.clear();
      expect(store.message).toBeNull();
      expect(store.type).toBeNull();
    });
  });

  it('should overwrite a previous notification when a new one is set', () => {
    const store = useNotificationStore();
    store.setError('first error');
    store.setSuccess('then success');
    expect(store.message).toBe('then success');
    expect(store.type).toBe('success');
  });
});
