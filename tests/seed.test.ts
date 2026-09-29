import { describe, it, expect } from 'vitest';
import { planSeedSync, fromSeed } from '../src/seed';
import type { SeedCard, SeedFile } from '../src/types';

const sc = (id: string, rev = 1, q = 'q'): SeedCard => ({
  id, rev, type: 'notion', question: q, reponse: 'r', notions: [], auteurs: [], oeuvre: null,
  sources: [], statut: 'a_verifier', note_verification: '', image_mentale: '', cree_par: 'seed',
});
const file = (...c: SeedCard[]): SeedFile => ({ version: 1, genere_le: '', cartes: c });

describe('mise à jour du jeu de départ', () => {
  it('copie tout au premier lancement', () => {
    expect(planSeedSync(file(sc('a'), sc('b')), []).add.length).toBe(2);
  });
  it('ne ressuscite pas une carte supprimée', () => {
    const del = { ...fromSeed(sc('a'), 0), supprimee: true };
    const r = planSeedSync(file(sc('a', 2)), [del]);
    expect(r.add.length + r.update.length).toBe(0);
  });
  it("n'écrase pas une carte modifiée", () => {
    const mod = { ...fromSeed(sc('a'), 0), modifiee: true, question: 'ma version' };
    expect(planSeedSync(file(sc('a', 2, 'nouvelle')), [mod]).update.length).toBe(0);
  });
  it('met à jour une carte intacte en gardant la progression et le statut vérifié', () => {
    const cur = { ...fromSeed(sc('a'), 0), statut: 'verifie' as const, image_mentale: 'ma salle' };
    cur.srs = { ...cur.srs, reps: 5 };
    const [u] = planSeedSync(file(sc('a', 2, 'corrigée')), [cur]).update;
    expect(u.question).toBe('corrigée'); expect(u.srs.reps).toBe(5);
    expect(u.statut).toBe('verifie'); expect(u.image_mentale).toBe('ma salle');
  });
  it('ajoute seulement les nouvelles cartes ajoutées plus tard', () => {
    const cur = fromSeed(sc('a'), 0);
    const r = planSeedSync(file(sc('a'), sc('b')), [cur]);
    expect(r.add.map((c) => c.id)).toEqual(['b']); expect(r.update.length).toBe(0);
  });
  it('ne touche pas une carte créée par l’utilisateur', () => {
    const own = { ...fromSeed(sc('a'), 0), cree_par: 'utilisateur' as const };
    expect(planSeedSync(file(sc('a', 2)), [own]).update.length).toBe(0);
  });
  it('retire les cartes supprimées du jeu de départ, sauf si modifiées', () => {
    const intacte = fromSeed(sc('x'), 0);
    const modifiee = { ...fromSeed(sc('y'), 0), modifiee: true };
    const utilisateur = { ...fromSeed(sc('z'), 0), cree_par: 'utilisateur' as const };
    const r = planSeedSync({ ...file(), retirees: ['x', 'y', 'z'] }, [intacte, modifiee, utilisateur]);
    expect(r.retire.map((c) => c.id)).toEqual(['x']);
    expect(r.retire[0].supprimee).toBe(true);
  });
});
