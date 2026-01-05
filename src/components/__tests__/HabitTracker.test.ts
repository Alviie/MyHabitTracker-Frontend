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

describe('HabitList', () => {
  const emptyResponse: Habit[] = []
  const twoItemResponse: Habit[] = [
    { id: 1, name: 'Joggen', streakCount: 1 },
    { id: 2, name: 'Lesen', streakCount: 3 }
  ]

  vi.mock('axios')

  /**
   * **Test 1: Zeigt "Woche aktuell" Header**
   *
   * Simuliert: Komponente wird geladen, zeigt Wochenüberschrift
   * Prüft:     Template rendert "Woche aktuell" Text (ohne API-Daten)
   * Warum wichtig: Header immer sichtbar, auch ohne Internet
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
   * Prüft:     "Joggen" erscheint im Template nach API-Call
   * Warum wichtig: Kernfunktion – Habits werden korrekt angezeigt
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
   * Prüft:     Keine <li>-Elemente (v-for rendert nichts)
   * Warum wichtig: App crasht nicht wenn keine Habits existieren
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
   * Prüft:     Eingabefeld (<input>) + "Hinzufügen"-Button existieren
   * Warum wichtig: User kann neue Habits hinzufügen
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
   * Prüft:     Template zeigt korrekte Streak-Zahl aus API
   * Warum wichtig: Fortschritt/Statistiken werden richtig dargestellt
   */
  it('should render streak counter from backend', async () => {
    vi.mocked(axios, true).get.mockResolvedValueOnce({ data: twoItemResponse })
    const wrapper = shallowMount(HabitList)
    await flushPromises()
    expect(wrapper.html()).toContain('Streak: 3')
  })
})
