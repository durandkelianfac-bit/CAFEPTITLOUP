import { describe, it, expect } from 'vitest';
import { newSrs, review, preview, isMastered, formatDelay } from '../src/srs';
import { buildQueue, requeue, streak, dayKey, dueCards, DAY } from '../src/session';
import type { Card } from '../src/types';

const T0 = new Date('2027-01-10T10:00:00').getTime();
const mk = (id: string, srs = newSrs(T0)): Card => ({
  id, type: 'notion', question: 'q', reponse: 'r', notions: [], auteurs: [], oeuvre: null, sources: [],
  statut: 'a_verifier', note_verification: '', image_mentale: '', cree_par: 'seed', maj: 0, srs,
});

describe('planificateur FSRS', () => {
  it('une carte neuve est en état 0', () => expect(newSrs(T0).state).toBe(0));

  it('un échec ramène la carte en quelques minutes', () => {
    const s = review(newSrs(T0), 1, T0);
    expect(s.due - T0).toBeLessThan(30 * 60000);
  });

  it('un succès espace de plus en plus', () => {
    let s = newSrs(T0); let t = T0; const gaps: number[] = [];
    for (let i = 0; i < 6; i++) {
      s = review(s, 3, t); gaps.push(s.due - t); t = s.due;
    }
    expect(gaps[5]).toBeGreaterThan(gaps[3]);
    expect(gaps[5]).toBeGreaterThan(5 * DAY);
  });

  it('Facile espace plus que Bien, qui espace plus que Difficile', () => {
    const s = review(newSrs(T0), 3, T0);
    const p = preview(s, s.due);
    expect(p[4]).toBeGreaterThan(p[3]); expect(p[3]).toBeGreaterThanOrEqual(p[2]); expect(p[2]).toBeGreaterThan(p[1]);
  });

  it('un oubli après une longue série réduit la stabilité et compte un lapse', () => {
    let s = newSrs(T0); let t = T0;
    for (let i = 0; i < 5; i++) { s = review(s, 3, t); t = s.due; }
    const before = s.stability;
    const f = review(s, 1, t);
    expect(f.lapses).toBe(1); expect(f.stability).toBeLessThan(before);
  });

  it('la rétention visée modifie les intervalles', () => {
    let a = newSrs(T0), b = newSrs(T0), t = T0;
    for (let i = 0; i < 4; i++) { a = review(a, 3, t, 0.95); b = review(b, 3, t, 0.8); t = Math.max(a.due, b.due); }
    expect(b.scheduled_days).toBeGreaterThan(a.scheduled_days);
  });

  it('formatDelay', () => {
    expect(formatDelay(5 * 60000)).toBe('5 min'); expect(formatDelay(3 * DAY)).toBe('3 j');
    expect(isMastered({ ...newSrs(), state: 2, stability: 30 })).toBe(true);
  });
});

describe('file de séance', () => {
  const learned = (id: string, dueOffset: number) => mk(id, { ...review(newSrs(T0 - 5 * DAY), 3, T0 - 5 * DAY), due: T0 + dueOffset });

  it('respecte le quota de nouvelles cartes', () => {
    const cards = Array.from({ length: 30 }, (_, i) => mk('n' + i));
    expect(buildQueue(cards, T0, 15, 0).length).toBe(15);
    expect(buildQueue(cards, T0, 15, 10).length).toBe(5);
    expect(buildQueue(cards, T0, 15, 15).length).toBe(0);
  });

  it('ne propose que les cartes échues, et exclut les supprimées', () => {
    const cards = [learned('a', -1000), learned('b', 3 * DAY), { ...learned('c', -1000), supprimee: true }];
    expect(dueCards(cards, T0).map((c) => c.id)).toEqual(['a']);
  });

  it('une carte échouée revient dans la séance, une carte réussie sort', () => {
    const a = mk('a'), b = mk('b'), c = mk('c');
    const failed = review(a.srs, 1, T0);
    const q = requeue([a, b, c], a, failed, T0, 1);
    expect(q.map((x) => x.id)).toEqual(['b', 'c', 'a']);
    const good = { ...failed, due: T0 + 3 * DAY };
    expect(requeue([a, b, c], a, good, T0, 3).map((x) => x.id)).toEqual(['b', 'c']);
  });
});

describe('série de jours', () => {
  it('compte les jours consécutifs', () => {
    const j = { [dayKey(T0)]: 3, [dayKey(T0 - DAY)]: 1, [dayKey(T0 - 2 * DAY)]: 4, [dayKey(T0 - 4 * DAY)]: 2 };
    expect(streak(j, T0)).toBe(3);
  });
  it("n'est pas rompue tant qu'aujourd'hui n'est pas fini", () => {
    expect(streak({ [dayKey(T0 - DAY)]: 1 }, T0)).toBe(1);
    expect(streak({ [dayKey(T0 - 2 * DAY)]: 1 }, T0)).toBe(0);
  });
});
