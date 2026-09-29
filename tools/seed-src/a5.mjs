import { C, of, se, es, pd } from './dsl.mjs';
const CONC = of('Arrêté fixant les modalités d’organisation des concours du CAPES (section philosophie) ; à recouper avec devenirenseignant.gouv.fr');
const RAP = of('Rapports du jury du CAPES/CAFEP externe de philosophie (sessions 2021 à 2025)');
const N = "Contenu tiré de l'énoncé de mission, non recoupé avec les textes officiels.";
export default [
// ---------- Didactique / concours ----------

// ---------- Méthode ----------
C('meth-analyse-sujet', 'methode', "Comment analyser un sujet de dissertation ?",
  "Définir chaque terme, repérer les distinctions et présupposés, le type de question (oui/non, en quel sens…), et les tensions cachées. Le sujet n'est jamais un prétexte.",
  { s: [se('Méthode classique de la dissertation ; à compléter par les rapports de jury')], note: 'Conseil méthodologique général, non sourcé précisément.' }),
C('meth-problematiser', 'methode', "Qu'est-ce que problématiser ?",
  "Passer d'une question à un problème : une tension entre deux thèses également fondées ou une difficulté interne à la notion, qui rend l'enquête nécessaire.",
  { s: [se('Méthode classique de la dissertation ; à compléter par les rapports de jury')], note: 'Conseil méthodologique général, non sourcé précisément.' }),
C('meth-introduction', 'methode', "Quels sont les moments de l'introduction d'une dissertation ?",
  "Amorce, analyse du sujet, problème, annonce du plan (facultative dans sa forme). Éviter l'amorce générale creuse ou l'histoire de la philosophie.",
  { s: [se('Méthode classique de la dissertation')], note: 'Conseil méthodologique général, non sourcé précisément.' }),
C('meth-plan', 'methode', "Comment éviter un plan mécanique (oui / non / peut-être) ?",
  "Chaque partie doit résoudre une difficulté soulevée par la précédente ; le plan suit un progrès conceptuel, non une liste d'auteurs.",
  { s: [se('Méthode classique de la dissertation')], note: 'Conseil méthodologique général, non sourcé précisément.' }),
C('meth-explication', 'methode', "Comment expliquer un texte sans le paraphraser ?",
  "Dégager la thèse et le problème, suivre le mouvement de l'argumentation, définir les concepts par le texte, puis en apprécier la portée et les limites.",
  { s: [se('Méthode classique de l’explication de texte')], note: 'Conseil méthodologique général, non sourcé précisément.' }),
C('meth-exemple', 'methode', "Comment utiliser un exemple ?",
  "Il illustre une idée déjà énoncée et doit être analysé : préciser ce qu'il montre et jusqu'où. Un exemple précis (œuvre, passage) vaut mieux qu'une allusion.",
  { s: [se('Méthode classique de la dissertation')], note: 'Conseil méthodologique général, non sourcé précisément.' }),
C('meth-references', 'methode', "Comment cite-t-on les grands textes de façon standard ?",
  "Platon : Stephanus (514a). Aristote : Bekker (1094a1). Kant : Académie (AK IV, 421) ; Critique de la raison pure : A/B. Descartes : Adam-Tannery (AT IX-1, 19).",
  { s: [se('Usage universitaire standard')], note: 'Convention usuelle, à confirmer dans les éditions.' }),
C('meth-conclusion', 'methode', "Que doit contenir une conclusion de dissertation ?",
  "La réponse au problème posé, en rappelant le parcours ; on peut ouvrir sur une question voisine. Ni nouvel argument ni résumé mécanique.",
  { s: [se('Méthode classique de la dissertation')], note: 'Conseil méthodologique général, non sourcé précisément.' }),
];
function PROG_SEQ() { return of('Programme de philosophie des classes terminales, BO spécial n° 8 du 25 juillet 2019'); }
