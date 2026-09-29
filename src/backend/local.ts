import type { Card, Settings, Stats } from '../types';
import type { Backend } from './types';

/** Mode « cet appareil uniquement » (aucune configuration Firebase). Sert aussi aux tests. */
export function localBackend(ns = 'cafep'): Backend {
  const K = { cards: `${ns}:cartes`, settings: `${ns}:reglages`, stats: `${ns}:stats` };
  const read = <T,>(k: string, d: T): T => { try { return JSON.parse(localStorage.getItem(k) ?? '') as T; } catch { return d; } };
  const write = (k: string, v: unknown) => localStorage.setItem(k, JSON.stringify(v));
  const subs: Record<string, Set<() => void>> = { cards: new Set(), settings: new Set(), stats: new Set() };
  const emit = (n: string) => subs[n].forEach((f) => f());
  addEventListener('storage', (e) => {
    for (const n of Object.keys(K)) if (e.key === K[n as keyof typeof K]) emit(n);
  });
  const watch = <T,>(n: keyof typeof K, get: () => T, cb: (v: T) => void) => {
    const f = () => cb(get()); subs[n].add(f); queueMicrotask(f); return () => { subs[n].delete(f); };
  };
  return {
    kind: 'local',
    onCards: (cb) => watch('cards', () => Object.values(read<Record<string, Card>>(K.cards, {})), cb),
    onSettings: (cb) => watch('settings', () => read<Partial<Settings>>(K.settings, {}), cb),
    onStats: (cb) => watch('stats', () => read<Stats>(K.stats, { jours: {}, nouvelles: {} }), cb),
    onSync: (cb) => { queueMicrotask(() => cb('local')); return () => {}; },
    async putCards(cards) {
      const m = read<Record<string, Card>>(K.cards, {});
      for (const c of cards) m[c.id] = c;
      write(K.cards, m); emit('cards');
    },
    async saveSettings(s) { write(K.settings, { ...read(K.settings, {}), ...s }); emit('settings'); },
    async bumpStats(day, reviews, news) {
      const st = read<Stats>(K.stats, { jours: {}, nouvelles: {} });
      st.jours[day] = (st.jours[day] ?? 0) + reviews;
      if (news) st.nouvelles[day] = (st.nouvelles[day] ?? 0) + news;
      write(K.stats, st); emit('stats');
    },
  };
}
