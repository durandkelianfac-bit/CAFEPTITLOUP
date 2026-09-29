import type { Card, Rating, SrsState } from './types';
import { isNew } from './srs';

export const DAY = 86400000;

/** Date locale AAAA-MM-JJ. Le « jour » commence à 4 h du matin (révisions tardives). */
export function dayKey(now: number = Date.now()): string {
  const d = new Date(now - 4 * 3600000);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Fin de la journée de révision en cours (prochain 4 h). */
export function endOfDay(now: number): number {
  const d = new Date(now - 4 * 3600000);
  d.setHours(23, 59, 59, 999);
  return d.getTime() + 4 * 3600000;
}

export const active = (cards: Card[]) => cards.filter((c) => !c.supprimee);

export function dueCards(cards: Card[], now: number): Card[] {
  const end = endOfDay(now);
  return active(cards).filter((c) => !isNew(c.srs) && c.srs.due <= end)
    .sort((a, b) => a.srs.due - b.srs.due);
}

export function newCards(cards: Card[]): Card[] {
  return active(cards).filter((c) => isNew(c.srs));
}

/** Nouvelles cartes encore autorisées aujourd'hui. */
export function newQuota(cards: Card[], perDay: number, introducedToday: number): number {
  return Math.max(0, Math.min(perDay - introducedToday, newCards(cards).length));
}

export function shuffle<T>(a: T[], rnd: () => number = Math.random): T[] {
  const r = a.slice();
  for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; }
  return r;
}

/** File de séance : révisions échues (les plus en retard d'abord), puis nouvelles cartes mêlées. */
export function buildQueue(cards: Card[], now: number, perDay: number, introducedToday: number, rnd = Math.random): Card[] {
  const due = dueCards(cards, now);
  const n = newQuota(cards, perDay, introducedToday);
  const fresh = shuffle(newCards(cards), rnd).slice(0, n);
  // Une nouvelle carte est glissée après chaque groupe de révisions pour varier l'effort.
  if (!due.length) return fresh;
  const out: Card[] = [];
  const step = Math.max(1, Math.floor(due.length / (fresh.length + 1)));
  let f = 0;
  due.forEach((c, i) => { out.push(c); if ((i + 1) % step === 0 && f < fresh.length) out.push(fresh[f++]); });
  while (f < fresh.length) out.push(fresh[f++]);
  return out;
}

/**
 * Après une note : la carte reste dans la séance si elle revient dans moins de 20 minutes
 * (échec ou étape d'apprentissage). Elle est replacée quelques cartes plus loin.
 */
export function requeue(queue: Card[], card: Card, next: SrsState, now: number, rating: Rating): Card[] {
  const rest = queue.slice(1);
  if (next.due - now >= 20 * 60000) return rest;
  const pos = Math.min(rest.length, rating === 1 ? 3 : 6);
  const updated = { ...card, srs: next };
  return [...rest.slice(0, pos), updated, ...rest.slice(pos)];
}

/** Série de jours consécutifs avec au moins une révision (aujourd'hui non obligatoire). */
export function streak(jours: Record<string, number>, now: number = Date.now()): number {
  let n = 0;
  let t = now;
  if (!(jours[dayKey(t)] > 0)) t -= DAY;
  while (jours[dayKey(t)] > 0) { n++; t -= DAY; }
  return n;
}
