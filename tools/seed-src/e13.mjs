import { M } from './dsl.mjs';
const N = 'notion';
export default [
// ---------- La technique (manuel, p. 537-540) ----------
M('m-tech-definition', N, "Comment le manuel définit-il la technique, et sur quoi repose-t-elle ?",
  "Ensemble de moyens (matériels comme les outils, intellectuels comme la connaissance de procédés) permettant d'obtenir efficacement des résultats déterminés, jugés utiles. Elle repose toujours sur un savoir : c'est un savoir-faire (mythe de Prométhée et du feu), produisant des effets répétables, d'où son utilité.",
  { n: ['la technique'], ref: 'La technique, « De l\'usage du mot à la notion »', p: '537' }),
M('m-tech-techne-technologie', N, "Quel rapport y a-t-il entre technê, technique et technologie ?",
  "Technê : compétence fondée sur la connaissance d'un domaine d'activité ; à l'époque classique, le mot s'applique aussi à la philosophie, à la rhétorique, à la politique. Technologie : ensemble des connaissances rationnelles propres à chaque technique (à ne pas confondre, malgré l'usage, avec « technique » moderne).",
  { n: ['la technique', 'la raison'], ref: 'La technique, « De l\'usage du mot à la notion »', p: '537-538' }),
M('m-tech-alienation', N, "Que signifie l'aliénation, et en quel sens la technique est-elle dite aliénante ?",
  "Aliénation (alienus, « étranger ») : au sens juridique, la vente d'un objet ; plus généralement, l'état d'un être devenu étranger à lui-même (aliénation mentale). La technique est aliénante quand l'homme est dominé par les outils qu'il a créés et ne se retrouve plus dans ce qu'il fait.",
  { n: ['la technique', 'le travail'], ref: 'La technique, « Termes essentiels » (aliénation)', p: '538' }),
M('m-tech-artisan-design', N, "Artisan et design : définitions ?",
  "Artisan : travailleur exerçant pour son compte un métier manuel (potier, ébéniste, cordonnier), dont les connaissances sont surtout intuitives, des « tours de main ». Design : manière de concevoir les objets industriels en adaptant la forme à la fonction avec une beauté plastique ; par extension, création artistique privilégiant le dépouillement.",
  { n: ['la technique', "l'art", 'le travail'], ref: 'La technique, « Termes essentiels »', p: '538' }),
M('m-tech-gestell', N, "Que désigne Gestell (arraisonnement) chez Heidegger ?",
  "Mot allemand courant pour « étagère, cadre » ; Heidegger l'emploie pour désigner l'essence, le plus souvent inaperçue, de la technique moderne : la façon de rendre d'avance toute chose disponible à l'exploitation technique, comme stockée et sommée de se tenir à disposition. Rendu par « arraisonnement » ou « dispositif ».",
  { a: ['Heidegger'], n: ['la technique'], ref: 'La technique, « Termes essentiels » (das Gestell)', p: '538' }),
M('m-tech-instrument-outil', N, "Instrument, outil, machine : quelles distinctions ?",
  "Instrument : terme général, naturel (organes) ou artificiel ; tous ne sont pas des outils (microscope, instruments de musique n'accroissent pas la puissance musculaire). Outil : instrument artificiel prolongeant l'activité manuelle. Machine : appareil, outil complexe mis en marche par un moteur ; machine-outil si elle transforme la nature (horloge et ordinateur ne le font pas).",
  { n: ['la technique', 'le travail'], ref: 'La technique, « Termes essentiels »', p: '538-540' }),
M('m-tech-machinisme-mecanisme', N, "Machinisme, mécanisme, mass media : définitions ?",
  "Machinisme : emploi généralisé des machines pour remplacer la main-d'œuvre salariée. Mécanisme : ensemble de pièces agencées pour faire fonctionner une machine (structure interne) ; en grec, mêchanikê désigne les engins de levage. Mass media : moyens de large diffusion de l'information (radio, télévision, presse, publicité).",
  { n: ['la technique', 'le travail'], ref: 'La technique, « Termes essentiels »', p: '540' }),
M('m-tech-industrielle-technocratie', N, "Technique industrielle et technocratie : définitions ?",
  "Technique industrielle : production avec division méthodique du travail entre de nombreux ouvriers, fondée sur des connaissances scientifiques (fordisme, taylorisme, chronométrie). Technocratie : pouvoir politique exercé par des experts légitimés par la seule compétence technique, qui privilégie les solutions techniques et néglige les réalités humaines.",
  { n: ['la technique', "l'État", 'le travail'], ref: 'La technique, « Termes essentiels »', p: '540' }),
];
