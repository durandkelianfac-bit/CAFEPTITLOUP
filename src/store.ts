import seedData from '../data/cartes-depart.json';
import type { Backend } from './backend/types';
import { DEFAULT_SETTINGS } from './backend/types';
import { planSeedSync } from './seed';
import { review } from './srs';
import { dayKey } from './session';
import type { Card, Rating, Settings, SeedFile, Stats, SyncState } from './types';

export const seed = seedData as unknown as SeedFile;

export const state = {
  cards: [] as Card[],
  settings: { ...DEFAULT_SETTINGS } as Settings,
  stats: { jours: {}, nouvelles: {} } as Stats,
  sync: 'local' as SyncState,
  ready: false,
  gotCards: false,
  gotSettings: false,
};

let backend: Backend | null = null;
let unsubs: (() => void)[] = [];
const listeners = new Set<() => void>();
export const subscribe = (f: () => void) => { listeners.add(f); return () => { listeners.delete(f); }; };
const notify = () => listeners.forEach((f) => f());

export function start(b: Backend) {
  stop();
  backend = b;
  const check = () => {
    if (state.gotCards && state.gotSettings && !state.ready) { state.ready = true; }
    if (state.gotCards && state.gotSettings) syncSeed();
    notify();
  };
  unsubs = [
    b.onCards((c) => { state.cards = c; state.gotCards = true; check(); }),
    b.onSettings((s) => { state.settings = { ...DEFAULT_SETTINGS, ...s }; state.gotSettings = true; check(); }),
    b.onStats((s) => { state.stats = s; notify(); }),
    b.onSync((s) => { state.sync = s; notify(); }),
  ];
}

export function stop() {
  unsubs.forEach((u) => u()); unsubs = []; backend = null;
  Object.assign(state, { cards: [], ready: false, gotCards: false, gotSettings: false, stats: { jours: {}, nouvelles: {} } });
}

let seeding = false;
/** Copie / met à jour le jeu de départ dans l'espace de l'utilisateur (voir seed.ts). */
function syncSeed() {
  if (!backend || seeding) return;
  const { add, update, retire } = planSeedSync(seed, state.cards);
  if (!add.length && !update.length && !retire.length && state.settings.seedVersion >= seed.version) return;
  seeding = true;
  const b = backend;
  b.putCards([...add, ...update, ...retire]).then(() => b.saveSettings({ seedVersion: seed.version })).finally(() => { seeding = false; });
  // Affichage immédiat : le cache local renverra de toute façon les cartes ajoutées.
}

const byId = (id: string) => state.cards.find((c) => c.id === id);

async function put(c: Card) {
  const i = state.cards.findIndex((x) => x.id === c.id);
  if (i >= 0) state.cards[i] = c; else state.cards.push(c);
  notify();
  await backend?.putCards([c]);
}

export async function rateCard(id: string, rating: Rating, now = Date.now()) {
  const c = byId(id); if (!c) return;
  const wasNew = c.srs.state === 0;
  const next = review(c.srs, rating, now, state.settings.retention);
  await put({ ...c, srs: next, maj: now });
  await backend?.bumpStats(dayKey(now), 1, wasNew ? 1 : 0);
  return next;
}

export async function saveCard(c: Card) {
  const mod = c.cree_par === 'seed' ? { modifiee: true } : {};
  await put({ ...c, ...mod, maj: Date.now() });
}

export async function deleteCard(id: string) {
  const c = byId(id); if (!c) return;
  // Les cartes créées par l'utilisateur sont aussi gardées en « pierre tombale » : l'annulation reste possible.
  await put({ ...c, supprimee: true, maj: Date.now() });
}
export async function restoreCard(id: string) {
  const c = byId(id); if (c) await put({ ...c, supprimee: false, maj: Date.now() });
}
export async function toggleVerif(id: string) {
  const c = byId(id); if (!c) return;
  await put({ ...c, statut: c.statut === 'verifie' ? 'a_verifier' : 'verifie', maj: Date.now() });
}
export async function setSettings(s: Partial<Settings>) {
  state.settings = { ...state.settings, ...s }; notify();
  await backend?.saveSettings(s);
}
export const kind = () => backend?.kind ?? 'local';
