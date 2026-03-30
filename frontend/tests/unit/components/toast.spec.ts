import { mount } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import ToastMessage from '@/components/toast.vue';
import { useNotificationStore } from '@/stores/notificationStore';

describe('ToastMessage', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('should not render when there is no notification message', () => {
    const wrapper = mount(ToastMessage);
    expect(wrapper.find('.toast').exists()).toBe(false);
  });

  it('should render the message text when notification is set', async () => {
    const store = useNotificationStore();
    store.setError('Something failed');

    const wrapper = mount(ToastMessage);

    expect(wrapper.find('.toast').exists()).toBe(true);
    expect(wrapper.find('.toast').text()).toBe('Something failed');
  });

  it('should apply the "error" CSS class for error notifications', async () => {
    const store = useNotificationStore();
    store.setError('An error occurred');

    const wrapper = mount(ToastMessage);

    expect(wrapper.find('.toast').classes()).toContain('error');
  });

  it('should apply the "success" CSS class for success notifications', async () => {
    const store = useNotificationStore();
    store.setSuccess('All good!');

    const wrapper = mount(ToastMessage);

    expect(wrapper.find('.toast').classes()).toContain('success');
  });

  it('should call store.clear() when the toast is clicked', async () => {
    const store = useNotificationStore();
    store.setSuccess('Click to dismiss');

    const wrapper = mount(ToastMessage);
    await wrapper.find('.toast').trigger('click');

    expect(store.message).toBeNull();
    expect(store.type).toBeNull();
  });
});
