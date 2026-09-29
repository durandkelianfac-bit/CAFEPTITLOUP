// Petit vocabulaire pour écrire les cartes de départ de façon compacte.
const src = (fiabilite) => (reference, edition = null) => ({ reference, edition, url: null, consulte_le: null, fiabilite });
export const pd = src('domaine_public');   // texte original du domaine public
export const es = src('edition_savante');  // œuvre citée d'après une édition savante / traduction
export const of = src('officielle');       // programme, rapport de jury, texte officiel
export const se = src('secondaire');       // ouvrage ou article secondaire

export const NOTE_DEFAUT =
  "Rédigée par l'assistant de mémoire ; la source n'a PAS été consultée pendant la session (sites de sources inaccessibles depuis l'environnement de travail). À relire dans l'édition avant de s'y fier.";

/** [id, type, question, reponse, { n: notions, a: auteurs, o: oeuvre, s: sources, note }] */
export const C = (id, type, question, reponse, o = {}) => ({
  id, type, question, reponse, notions: o.n ?? [], auteurs: o.a ?? [], oeuvre: o.o ?? null, sources: o.s ?? [],
  statut: 'a_verifier', note_verification: o.note ? `${NOTE_DEFAUT} ${o.note}` : NOTE_DEFAUT, image_mentale: '', cree_par: 'seed', rev: o.rev ?? 1,
});

// ---- Cartes tirées du dictionnaire « La philosophie de A à Z » (Hatier, 2020) ----
export const DICO = 'L. Hansen-Løve, P. Kahn, É. Clément, La philosophie de A à Z, nouvelle éd., Hatier, 2020';
export const NOTE_DICO =
  "Paraphrase de l'article du dictionnaire (ebook acheté par l'utilisateur, lu le 2026-09-29). Source secondaire, à recouper avec le texte de l'auteur avant toute citation.";
/** D(id, type, question, réponse, { a, n, o, art: « article », p: page(s), note }) */
export const D = (id, type, question, reponse, o = {}) => ({
  ...C(id, type, question, reponse, { ...o, s: [{ reference: `${DICO}, article « ${o.art} », p. ${o.p}`, edition: null, url: null, consulte_le: '2026-09-29', fiabilite: 'secondaire' }] }),
  note_verification: o.note ? `${NOTE_DICO} ${o.note}` : NOTE_DICO,
});
