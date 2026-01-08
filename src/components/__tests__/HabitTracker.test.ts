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
   * **Test 3: Zeigt nichts bei leerem Server**
   *
   * Simuliert: Server antwortet leer [] → Komponente zeigt leere Liste
   * Prüft: Keine <li>-Elemente (v-for rendert nichts)
   * Ziel: App crasht nicht wenn keine Habits existieren
   */
  it('should render message when no habits received from backend', async () => {
    vi.mocked(axios, true).get.mockResolvedValueOnce({ data: emptyResponse })
    const wrapper = shallowMount(HabitList)
    await flushPromises()
    expect(wrapper.findAll('li').length).toBe(0)
  })

  /**
   * **Test 4: "Neues Habit" Eingabe + Button vorhanden**
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
   * **Test 5: Streak-Zähler aus Server-Daten**
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
   * **Test 6: Filter-Buttons sind vorhanden**
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
   * **Test 7: Wochen-Navigation Buttons vorhanden**
   *
   * Simuliert: Initialer Render
   * Prüft: Buttons "← Woche" und "Woche →" existieren
   * Ziel: Navigation zwischen Wochen ist Kernfunktion
   */
  it('should render week navigation buttons', () => {
    vi.mocked(axios, true).get.mockResolvedValue({ data: emptyResponse })

    const wrapper = shallowMount(HabitList)

    expect(wrapper.text()).toContain('← Woche')
    expect(wrapper.text()).toContain('Woche →')
  })

  /**
   * **Test 8: Rendert exakt 7 Wochentage**
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
   * **Test 9: Add-Habit Input wird nach dem Hinzufügen geleert**
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
   * **Test 10: Standard-Filter ist "all"**
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
})
