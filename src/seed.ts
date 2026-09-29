import type { Card, SeedCard, SeedFile } from './types';
import { newSrs } from './srs';

/**
 * Compare le jeu de départ embarqué avec les cartes de l'utilisateur.
 * - carte absente (jamais copiée)      -> ajoutée ;
 * - carte présente, non modifiée, rev. plus ancienne -> contenu mis à jour, progression conservée ;
 * - carte modifiée ou supprimée par l'utilisateur     -> jamais touchée (pas de résurrection).
 */
export function planSeedSync(seed: SeedFile, existing: Card[], now: number = Date.now()): { add: Card[]; update: Card[] } {
  const byId = new Map(existing.map((c) => [c.id, c]));
  const add: Card[] = [];
  const update: Card[] = [];
  for (const s of seed.cartes) {
    const cur = byId.get(s.id);
    if (!cur) { add.push(fromSeed(s, now)); continue; }
    if (cur.cree_par !== 'seed' || cur.modifiee || cur.supprimee) continue;
    if ((cur.seed_rev ?? 0) >= s.rev) continue;
    update.push({
      ...cur, type: s.type, question: s.question, reponse: s.reponse, notions: s.notions, auteurs: s.auteurs,
      oeuvre: s.oeuvre, sources: s.sources, seed_rev: s.rev, maj: now,
      statut: cur.statut === 'verifie' ? 'verifie' : s.statut,
      note_verification: cur.note_verification || s.note_verification,
      image_mentale: cur.image_mentale || s.image_mentale,
    });
  }
  return { add, update };
}

export function fromSeed(s: SeedCard, now: number): Card {
  const { rev, ...rest } = s;
  return { ...rest, seed_rev: rev, maj: now, srs: newSrs(now) };
}
