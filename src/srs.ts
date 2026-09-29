import { createEmptyCard, fsrs, generatorParameters, Rating as FRating, type Card as FCard, type Grade } from 'ts-fsrs';
import type { Rating, SrsState } from './types';

export const RATING_LABELS: Record<Rating, string> = { 1: 'À revoir', 2: 'Difficile', 3: 'Bien', 4: 'Facile' };

export function newSrs(now: number = Date.now()): SrsState {
  return fromF(createEmptyCard(new Date(now)));
}

function fromF(c: FCard): SrsState {
  return {
    due: c.due.getTime(), stability: c.stability, difficulty: c.difficulty,
    scheduled_days: c.scheduled_days, learning_steps: c.learning_steps,
    reps: c.reps, lapses: c.lapses, state: c.state,
    last_review: c.last_review ? c.last_review.getTime() : null,
  };
}

function toF(s: SrsState): FCard {
  return {
    due: new Date(s.due), stability: s.stability, difficulty: s.difficulty,
    elapsed_days: 0, scheduled_days: s.scheduled_days, learning_steps: s.learning_steps,
    reps: s.reps, lapses: s.lapses, state: s.state,
    last_review: s.last_review == null ? undefined : new Date(s.last_review),
  } as FCard;
}

export function makeScheduler(retention = 0.9) {
  // Fuzz activé : évite que des cartes apprises ensemble tombent toujours le même jour.
  return fsrs(generatorParameters({ request_retention: retention, enable_fuzz: true, maximum_interval: 365 }));
}

/** Applique une note et renvoie le nouvel état. */
export function review(s: SrsState, rating: Rating, now: number, retention = 0.9): SrsState {
  const r = makeScheduler(retention).next(toF(s), new Date(now), rating as Grade);
  return fromF(r.card);
}

/** Échéance prévue pour chacun des 4 boutons (en ms). */
export function preview(s: SrsState, now: number, retention = 0.9): Record<Rating, number> {
  const p = makeScheduler(retention).repeat(toF(s), new Date(now));
  return { 1: p[FRating.Again].card.due.getTime(), 2: p[FRating.Hard].card.due.getTime(),
    3: p[FRating.Good].card.due.getTime(), 4: p[FRating.Easy].card.due.getTime() };
}

export function formatDelay(ms: number): string {
  const min = Math.round(ms / 60000);
  if (min < 1) return '< 1 min';
  if (min < 60) return `${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `${h} h`;
  const d = Math.round(h / 24);
  if (d < 31) return `${d} j`;
  const m = Math.round(d / 30.4);
  if (m < 12) return `${m} mois`;
  return `${(d / 365).toFixed(1).replace('.', ',')} an`;
}

export const isNew = (s: SrsState) => s.state === 0;
/** « Maîtrisée » : en révision et stabilité d'au moins 21 jours. */
export const isMastered = (s: SrsState) => s.state === 2 && s.stability >= 21;
