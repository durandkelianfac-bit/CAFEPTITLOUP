// Assemble tools/seed-src/*.mjs -> data/cartes-depart.json et RAPPORT_SOURCES.md (avec validation).
// Usage : node tools/build-seed.mjs [--check]  (--check : ne réécrit pas, échoue si les fichiers sont périmés)
import { writeFileSync, readFileSync, existsSync } from 'node:fs';

const VERSION = 2; // À incrémenter à chaque évolution du jeu de départ
const TYPES = ['notion', 'repere', 'auteur_oeuvre', 'citation', 'hlp', 'didactique', 'methode'];
const FIAB = ['officielle', 'edition_savante', 'domaine_public', 'secondaire'];
const files = ['a1', 'a2', 'a3', 'a4', 'a5'];
const cartes = [];
for (const f of files) cartes.push(...(await import(`./seed-src/${f}.mjs`)).default);

const errors = [], warns = [];
const ids = new Set();
for (const c of cartes) {
  const e = (m) => errors.push(`${c.id}: ${m}`);
  if (!/^[a-z0-9-]+$/.test(c.id)) e('id invalide');
  if (ids.has(c.id)) e('id en double'); ids.add(c.id);
  if (!TYPES.includes(c.type)) e('type invalide');
  if (!c.question || !c.reponse) e('question/réponse manquante');
  if (!c.sources.length) e('aucune source');
  for (const s of c.sources) {
    if (!s.reference) e('source sans référence');
    if (!FIAB.includes(s.fiabilite)) e('fiabilité invalide');
  }
  // Règle : « verifie » exige URL + date de consultation.
  if (c.statut === 'verifie' && !c.sources.every((s) => s.url && s.consulte_le)) e('verifie sans url/consulte_le');
  if (c.reponse.length > 400) warns.push(`${c.id}: réponse longue (${c.reponse.length} car.)`);
  for (const m of c.reponse.matchAll(/«\s*([^»]+?)\s*»/g)) {
    if (c.type === 'citation' && m[1].split(/\s+/).length > 20) e('citation > 20 mots');
  }
}
if (errors.length) { console.error('Erreurs :\n' + errors.join('\n')); process.exit(1); }
warns.forEach((w) => console.warn('avertissement', w));

const out = cartes;
const seed = { version: VERSION, genere_le: '2026-09-29', cartes: out };
const json = JSON.stringify(seed, null, 1) + '\n';

// ---- Rapport de sources ----
const TL = { notion: 'Notions', repere: 'Repères', auteur_oeuvre: 'Auteurs et œuvres', citation: 'Citations', hlp: 'HLP', didactique: 'Didactique et concours', methode: 'Méthode' };
const nv = cartes.filter((c) => c.statut === 'verifie').length;
let md = `# RAPPORT_SOURCES — jeu de départ, version ${VERSION}

Généré par \`npm run seed:build\` (ne pas modifier à la main : éditer \`tools/seed-src/\`).

## Bilan honnête

- **${cartes.length} cartes**, dont **${nv} « vérifiée(s)** et **${cartes.length - nv} « à vérifier »**.
- **Aucune source n'a pu être consultée** pendant la rédaction : l'environnement de travail bloquait l'accès à fr.wikisource.org, eduscol.education.gouv.fr, devenirenseignant.gouv.fr, gallica.bnf.fr et Wikipédia (réponse 403 du proxy réseau). Toutes les cartes ont donc été rédigées de mémoire par l'assistant, sans URL ni date de consultation, et **toutes restent « à vérifier »**. C'est la conséquence directe des règles 2 et 3 du cahier des charges.
- Aucune citation longue n'est reproduite ; les citations (≤ 20 mots) sont soit dans une langue originale du domaine public, soit des formules canoniques courtes ; le reste est paraphrasé.
- Aucun contenu généré par IA n'est présenté comme source : les références (Stephanus, Bekker, Akademie, Adam-Tannery, paragraphes) sont des références **standard à confirmer dans l'édition**, pas des pages consultées.
- Aucune adresse URL n'a été enregistrée, faute de pouvoir la vérifier (règle 3).

## Doutes principaux (à traiter en priorité)

1. **Repères** (\`rep-*\`) : l'énoncé exact et la liste officielle des repères doivent être recopiés depuis le BO spécial n° 8 du 25 juillet 2019 ; les cartes sont écrites de mémoire.
2. **HLP** (\`hlp-*\`) : intitulés des thèmes et axes d'après le souvenir des BO du 22 janvier 2019 et du 25 juillet 2019. À contrôler.
3. **Annales du concours** (\`did-*\`) : listes de textes et de sujets tirées de l'énoncé de mission, non des rapports de jury. La composition 2026 (« Le pour et le contre ») reste à confirmer.
4. **Simondon** : titre exact du chapitre II de la 3e partie non vérifié.
5. **Nietzsche, Fragments posthumes** : la carte de prudence éditoriale est générale ; aucun numéro de fragment n'est cité.
6. **Références précises** (pages AK, AT, Bekker, paragraphes) : données de mémoire, plusieurs peuvent être décalées de quelques lignes. Les traductions françaises ne sont **pas identifiées** (édition non consultée) : pour les auteurs traduits, indiquer l'édition lors de la relecture.
7. **Marx, thèse XI** et autres formules paraphrasées : contrôler la traduction avant de citer entre guillemets.
8. **Plaute/Horace** (attribution de « homo homini lupus », « sapere aude ») : attributions traditionnelles à confirmer.
9. **Conseils de méthode** : synthèse générale de la pratique de la dissertation, à recouper avec les rapports de jury (sources secondaires).

## Comment vérifier une carte

Ouvrir la source indiquée, comparer avec la réponse, corriger si besoin, compléter la source (édition, URL, date de consultation), puis appuyer sur la pastille « À vérifier » pour la passer à « Vérifié ».

---

## Détail par carte
`;
for (const t of TYPES) {
  const cs = cartes.filter((c) => c.type === t);
  if (!cs.length) continue;
  md += `\n### ${TL[t]} (${cs.length})\n`;
  for (const c of cs) {
    md += `\n**\`${c.id}\`** — ${c.question}  \nStatut : *${c.statut === 'verifie' ? 'vérifiée' : 'à vérifier'}*` +
      (c.auteurs.length ? ` · Auteurs : ${c.auteurs.join(', ')}` : '') + '\n';
    for (const s of c.sources) md += `- ${s.reference} — *${s.fiabilite}*${s.edition ? ` — ${s.edition}` : ''}${s.url ? ` — ${s.url}` : ''}${s.consulte_le ? ` (consultée le ${s.consulte_le})` : ' (non consultée)'}\n`;
    const extra = c.note_verification.split('À relire dans l\'édition avant de s\'y fier.')[1]?.trim();
    if (extra) md += `- Doute : ${extra}\n`;
  }
}

if (process.argv.includes('--check')) {
  const stale = !existsSync('data/cartes-depart.json') || readFileSync('data/cartes-depart.json', 'utf8') !== json
    || !existsSync('RAPPORT_SOURCES.md') || readFileSync('RAPPORT_SOURCES.md', 'utf8') !== md;
  if (stale) { console.error('Le jeu de départ est périmé : lancez `npm run seed:build`.'); process.exit(1); }
  console.log(`Jeu de départ à jour (${cartes.length} cartes).`);
} else {
  writeFileSync('data/cartes-depart.json', json);
  writeFileSync('RAPPORT_SOURCES.md', md);
  console.log(`${cartes.length} cartes écrites (version ${VERSION}).`);
}
