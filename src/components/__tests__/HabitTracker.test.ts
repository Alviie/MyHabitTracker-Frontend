import { describe, it, expect, vi } from 'vitest'
import { shallowMount, flushPromises } from '@vue/test-utils'
import HabitList from '@/views/HabitList.vue'
import axios from 'axios'

/**
 * **Unit-Tests für HabitList.vue** – Erklärt für Frontend-Testing-Anfänger
 *
 * Diese Tests prüfen, ob die HabitList-Komponente korrekt funktioniert.
 * Wir simulieren einen Browser mit **shallowMount** und faken API-Aufrufe
 * mit **axios-Mocks**. **flushPromises** wartet auf asynchrone Daten.
 */

type Habit = { id: number; name: string; streakCount: number }

vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => {
  if (key === 'userId') return '1'
  if (key === 'username') return 'testuser'
  return null
})

 vi.mock('axios')

describe('HabitList', () => {
  const emptyResponse: Habit[] = []
  const twoItemResponse: Habit[] = [
    { id: 1, name: 'Joggen', streakCount: 1 },
    { id: 2, name: 'Lesen', streakCount: 3 }
  ]

  /**
   * **Test 1: Zeigt "Woche aktuell" Header**
   *
   * Simuliert: Komponente wird geladen, zeigt Wochenüberschrift
   * Prüft: Template rendert "Woche aktuell" Text (ohne API-Daten)
   * Ziel: Header immer sichtbar, auch ohne Internet
   */
  it('should render the title passed to it', () => {
    vi.mocked(axios, true).get.mockResolvedValueOnce({ data: emptyResponse })
    const wrapper = shallowMount(HabitList)
    expect(wrapper.text()).toContain('Woche aktuell')
  })

  /**
   * **Test 2: Lädt und zeigt Habits von Server**
   *
   * Simuliert: Backend sendet "Joggen", "Lesen" → Komponente zeigt Liste
   * Prüft: "Joggen" erscheint im Template nach API-Call
   * Ziel: Kernfunktion, Habits werden korrekt angezeigt
   */
  it('should render the habits from the backend', async () => {
    vi.mocked(axios, true).get.mockResolvedValueOnce({ data: twoItemResponse })
    const wrapper = shallowMount(HabitList)
    await flushPromises()
    expect(wrapper.text()).toContain('Joggen')
  })

  /**
   * **Test 3: "Neues Habit" Eingabe + Button vorhanden**
   *
   * Simuliert: Komponente lädt → AddHabit-Bereich sichtbar
   * Prüft: Eingabefeld (<input>) + "Hinzufügen"-Button existieren
   * Ziel: User kann neue Habits hinzufügen
   */
  it('should render add habit input and button', () => {
    vi.mocked(axios, true).get.mockResolvedValueOnce({ data: emptyResponse })
    const wrapper = shallowMount(HabitList)
    expect(wrapper.find('input').exists()).toBe(true)
    expect(wrapper.text()).toContain('Hinzufügen')
  })

  /**
   * **Test 4: Streak-Zähler aus Server-Daten**
   *
   * Simuliert: Backend sendet Habit mit streakCount=3 → "Streak: 3" im Template
   * Prüft: Template zeigt korrekte Streak-Zahl aus API
   * Ziel: Fortschritt/Statistiken werden richtig dargestellt
   */
  it('should render streak counter from backend', async () => {
    vi.mocked(axios, true).get.mockResolvedValueOnce({ data: twoItemResponse })
    const wrapper = shallowMount(HabitList)
    await flushPromises()
    expect(wrapper.html()).toContain('Streak: 3')
  })

  /**
   * **Test 5: Filter-Buttons sind vorhanden**
   *
   * Simuliert: Seite lädt ohne Backend-Daten
   * Prüft: Buttons "Alle", "Offen", "Erledigt" existieren
   * Ziel: Filter-Navigation muss immer sichtbar sein
   */
  it('should render all filter buttons', () => {
    vi.mocked(axios, true).get.mockResolvedValue({ data: emptyResponse })

    const wrapper = shallowMount(HabitList)

    expect(wrapper.text()).toContain('Alle')
    expect(wrapper.text()).toContain('Offen')
    expect(wrapper.text()).toContain('Erledigt')
  })

  /**
   * **Test 6: Rendert exakt 7 Wochentage**
   *
   * Simuliert: Initiales Mounten der Komponente
   * Prüft: Die Wochentags-Navigation enthält genau 7 Buttons
   * Ziel: Jeder Tag der Woche ist auswählbar; Stellt sicher, dass die Tagesnavigation korrekt gerendert wird
   */
  it('renders exactly 7 weekday buttons', () => {
    vi.mocked(axios, true).get.mockResolvedValueOnce({ data: emptyResponse })

    const wrapper = shallowMount(HabitList)

    const weekdayContainer = wrapper.find('.grid-cols-7')
    const weekdayButtons = weekdayContainer.findAll('button')

    expect(weekdayButtons.length).toBe(7)
  })

  /**
   * **Test 7: Add-Habit Input wird nach dem Hinzufügen geleert**
   *
   * Simuliert: User gibt einen Habit-Namen ein und Klickt auf den "Hinzufügen"-Button
   * Prüft: Das Eingabefeld ist nach erfolgreichem POST wieder leer
   * Ziel: Verhindert doppeltes Anlegen; Stellt sauberen State-Reset sicher; Erwartetes UX-Verhalten
   */
  it('clears input field after adding a habit', async () => {
    vi.mocked(axios, true).get.mockResolvedValueOnce({ data: emptyResponse })
    vi.mocked(axios, true).post.mockResolvedValueOnce({
      data: { id: 3, name: 'Test Habit', streakCount: 0 }
    })

    const wrapper = shallowMount(HabitList)

    const input = wrapper.find('input')
    await input.setValue('Test Habit')

    const addButton = wrapper
      .findAll('button')
      .find(btn => btn.text().includes('Hinzufügen'))

    expect(addButton).toBeTruthy()

    await addButton!.trigger('click')
    await flushPromises()

    expect((input.element as HTMLInputElement).value).toBe('')
  })

  /**
   * **Test 8: Standard-Filter ist "all"**
   * Simuliert: Initiales Mounten der Komponente
   * Prüft: Der interne Filter-Status (`filterMode`) ist initial auf `"all"` gesetzt
   * Ziel: Stellt sicher, dass beim ersten Seitenaufruf keine Filterung aktiv ist; Verhindert unerwartet leere oder gefilterte Ansichten
   */
  it('uses "all" as default filter mode', () => {
    vi.mocked(axios, true).get.mockResolvedValueOnce({ data: emptyResponse })

    const wrapper = shallowMount(HabitList)

    // @ts-ignore – Zugriff auf internen State bewusst für Test
    expect(wrapper.vm.filterMode).toBe('all')
  })

  /**
   * **Test 9: Backend-GET schlägt fehl**
   *
   * Simuliert: GET-Request wirft Fehler (z. B. 500)
   * Prüft: Komponente rendert trotzdem und crasht nicht
   */
  it('does not crash when loading habits fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.mocked(axios, true).get.mockRejectedValueOnce(new Error('500'))

    const wrapper = shallowMount(HabitList)
    await flushPromises()

    expect(wrapper.exists()).toBe(true)
    expect(wrapper.findAll('li').length).toBe(0)
  })


  /**
   * **Test 10: Ungültige Werte im localStorage**
   *
   * Simuliert: selectedDay ist kein gültiger Wert
   * Prüft: App crasht nicht
   */
  it('handles invalid selectedDay from localStorage gracefully', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValueOnce('not-a-number')

    vi.mocked(axios, true).get.mockResolvedValueOnce({ data: [] })

    const wrapper = shallowMount(HabitList)
    await flushPromises()

    expect(wrapper.exists()).toBe(true)
  })

  /**
   * **Test 11: Edit speichern schlägt fehl**
   *
   * Simuliert: PUT-Request wirft Fehler
   * Prüft: Edit-Modal bleibt offen
   * Ziel: User sieht, dass Speichern fehlgeschlagen ist
   */
  it('keeps edit modal open when save fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})

    vi.mocked(axios, true).get.mockResolvedValueOnce({
      data: [{ id: 1, name: 'Joggen', streakCount: 1 }]
    })
    vi.mocked(axios, true).put.mockRejectedValueOnce(new Error('500'))

    const wrapper = shallowMount(HabitList)
    await flushPromises()

    // @ts-ignore
    wrapper.vm.startEdit({ id: 1, name: 'Joggen' })

    // @ts-ignore
    await wrapper.vm.saveEdit()

    // @ts-ignore
    expect(wrapper.vm.showEditModal).toBe(true)
  })

  /**
   * **Test 12: Bearbeiten abbrechen**
   *
   * Simuliert: User öffnet Edit, ändert Name, klickt Abbrechen
   * Prüft: Originalname bleibt erhalten
   */
  it('does not update habit when edit is cancelled', async () => {
    vi.mocked(axios, true).get.mockResolvedValueOnce({
      data: [{ id: 1, name: 'Joggen', streakCount: 1 }]
    })

    const wrapper = shallowMount(HabitList)
    await flushPromises()

    // @ts-ignore
    wrapper.vm.startEdit({ id: 1, name: 'Joggen' })
    // @ts-ignore
    wrapper.vm.editHabit.name = 'Geändert'
    // @ts-ignore
    wrapper.vm.cancelEdit()

    expect(wrapper.text()).toContain('Joggen')
    expect(wrapper.text()).not.toContain('Geändert')
  })

  /**
   * **Test 13: Löschen schlägt fehl**
   *
   * Simuliert: DELETE-Request wirft Fehler
   * Prüft: Habit bleibt in der Liste
   * Ziel: UI bleibt konsistent bei Backend-Fehlern
   */
  it('keeps habit when delete request fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})

    vi.mocked(axios, true).get.mockResolvedValueOnce({
      data: [{ id: 1, name: 'Joggen', streakCount: 1 }]
    })
    vi.mocked(axios, true).delete.mockRejectedValueOnce(new Error('500'))

    const wrapper = shallowMount(HabitList)
    await flushPromises()

    // @ts-ignore
    await wrapper.vm.deleteHabit(1)
    await flushPromises()

    expect(wrapper.text()).toContain('Joggen')
  })

})
