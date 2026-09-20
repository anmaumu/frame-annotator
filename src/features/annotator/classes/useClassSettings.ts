import { useState } from 'react';
import type { ClassDef } from '../types';
import { validateClasses } from './validation';

const defaults: ClassDef[] = [
  { name: '異常クラス A', key: '1' },
  { name: '異常クラス B', key: '2' },
  { name: '異常クラス C', key: '3' },
];


/** Owns the class definitions and editable settings draft. */
export function useClassSettings() {
  const [classes, setClasses] = useState(defaults);
  const [settings, setSettings] = useState(false);
  const [draft, setDraft] = useState(defaults);
  const [configError, setConfigError] = useState('');
  /** Opens the class settings modal with an editable copy of the current classes. */
  function openSettings() {
    setDraft(classes.map((c) => ({ ...c })));
    setConfigError('');
    setSettings(true);
  }
  /**
   * Validates and applies the edited class list from the settings modal.
   * Returns true on success so the coordinator can clear label undo history.
   */
  function saveClasses() {
    const error = validateClasses(draft);
    if (error) {
      setConfigError(error);
      return false;
    }
    const names = draft.map((c) => c.name.trim());
    const keys = draft.map((c) => c.key.toLowerCase());
    setClasses(draft.map((c, i) => ({ ...c, name: names[i], key: keys[i] })));
    setSettings(false);
    return true;
  }
  /** Appends a new class to the draft list, with the first unused number key (1-9). */
  function addDraftClass() {
    setDraft((prev) => [...prev, { name: `異常クラス ${prev.length + 1}`, key: '123456789'.split('').find((candidateKey) => !prev.some((c) => c.key === candidateKey)) || '' }]);
  }
  /**
   * Removes a class from the draft list.
   * @param n - index of the class to remove within `draft`
   */
  function removeDraftClass(n: number) {
    setDraft((prev) => prev.filter((_, i) => i !== n));
  }
  /**
   * Updates one draft class's name.
   * @param n - index of the class within `draft`
   * @param name - the new name
   */
  function updateDraftName(n: number, name: string) {
    setDraft((prev) => prev.map((c, i) => (i === n ? { ...c, name } : c)));
  }
  /**
   * Updates one draft class's keyboard shortcut key.
   * @param n - index of the class within `draft`
   * @param key - the new key (validated on save, not here)
   */
  function updateDraftKey(n: number, key: string) {
    setDraft((prev) => prev.map((c, i) => (i === n ? { ...c, key } : c)));
  }


  return { classes, setClasses, settings, draft, configError, openSettings,
    closeSettings: () => setSettings(false), saveClasses, addDraftClass,
    removeDraftClass, updateDraftName, updateDraftKey };
}
