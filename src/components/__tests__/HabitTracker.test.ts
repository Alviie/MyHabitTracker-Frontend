import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import HabitList from '@/components/HabitList.vue';  // Deine Komponente!

describe('HabitTracker Frontend', () => {
  it('test01_rendersHabitsCorrectly', () => {
    const wrapper = mount(HabitList, { props: { habits: [{ id: 1, name: 'Joggen' }] } });
    expect(wrapper.text()).toContain('Joggen');
  });

  it('test02_toggleMarksComplete', async () => {
    const wrapper = mount(HabitList, {
      props: { habits: [{ id: 1, name: 'Test', completedToday: false }] }
    });
    await wrapper.get('[data-test="toggle-1"]').trigger('click');
    expect(wrapper.emitted()).toHaveKey('toggle');
  });

  it('test03_streakCounterUpdates', async () => {
    const wrapper = mount(HabitList, { props: { habits: [{ id: 1, streakCount: 1 }] } });
    expect(wrapper.html()).toContain('1');  // Streak anzeigen
  });

  it('test04_addNewHabitButtonWorks', () => {
    const wrapper = mount(HabitList);
    expect(wrapper.find('[data-test="add-habit"]').exists()).toBe(true);
  });

  it('test05_deleteHabitRemovesItem', async () => {
    const wrapper = mount(HabitList, { props: { habits: [{ id: 1, name: 'DeleteMe' }] } });
    await wrapper.get('[data-test="delete-1"]').trigger('click');
    expect(wrapper.emitted()).toHaveKey('delete');
  });
});
