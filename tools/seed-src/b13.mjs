import { D } from './dsl.mjs';
const T = 'auteur_oeuvre';
export default [
// ---------- Heidegger (p. 217-218) ----------
D('d-heid-dasein', T, "Qu'est-ce que le Dasein dans Être et Temps ?",
  "L'étant qui peut questionner l'être ; son essence réside dans son existence : être-au-monde, être-avec, être-vers-la-mort, soumis au « On » de l'opinion dominante. Le Da est le lieu d'ouverture à l'être.",
  { a: ['Heidegger'], n: ['la conscience', 'le temps'], o: 'Être et Temps', art: 'Heidegger', p: '217-218' }),
D('d-heid-souci', T, "Comment le Dasein conquiert-il son authenticité ?",
  "L'angoisse d'être jeté dans le monde et fini peut l'arracher à sa perte dans le On. Le Souci, structure ontologique du Dasein, exprime sa temporalité et lui permet d'être responsable de son existence.",
  { a: ['Heidegger'], n: ['la liberté', 'le temps'], o: 'Être et Temps', art: 'Heidegger', p: '217' }),
D('d-heid-oubli-etre', T, "Que désigne le « tournant » de Heidegger et l'oubli de l'être ?",
  "Vers le milieu des années 1930, la primauté passe du sens de l'être à la vérité de l'être. Depuis Platon, la métaphysique cherche l'essence des étants dans d'autres étants (Idées) : elle débouche sur l'oubli de l'être, le nihilisme.",
  { a: ['Heidegger', 'Platon'], n: ['la vérité', 'la technique'], art: 'Heidegger', p: '218' }),

// ---------- Wittgenstein (p. 533-534) ----------
D('d-witt-tractatus', T, "Que dit le Tractatus logico-philosophicus des propositions ?",
  "Soit tautologies (vraies mais vides de sens), soit propositions informatives analysables en propositions atomiques représentant des états de choses. Une proposition sensée partage une forme logique avec le fait : elle est vérifiable, vraie ou fausse.",
  { a: ['Wittgenstein', 'Russell'], n: ['le langage', 'la vérité'], o: 'Tractatus logico-philosophicus', art: 'Wittgenstein', p: '533' }),
D('d-witt-metaphysique', T, "Wittgenstein est-il un positiviste du Cercle de Vienne ?",
  "C'est en grande partie un malentendu : le Tractatus ne vise pas à disqualifier la métaphysique mais à montrer, de façon mystique, l'importance de l'indicible. La philosophie est élucidation du langage et de la pensée, non une science.",
  { a: ['Wittgenstein'], n: ['le langage', 'la science'], o: 'Tractatus logico-philosophicus', art: 'Wittgenstein', p: '533-534' }),

// ---------- Benjamin (p. 51), Popper (p. 394-395), Jankélévitch (p. 264), Jonas (p. 267-268) ----------
D('d-benj-aura', T, "Que devient l'œuvre d'art à l'époque de sa reproductibilité technique ?",
  "Photographies, disques, films marquent une mutation : l'œuvre perd son unicité et son aura, cette magie héritée des origines rituelles. Benjamin salue le cinéma comme l'art moderne par excellence, exutoire cathartique aux traumatismes du capitalisme.",
  { a: ['Benjamin'], n: ["l'art", 'la technique'], o: "L'Œuvre d'art à l'époque de sa reproductibilité technique", art: 'Benjamin', p: '51' }),
D('d-benj-critique', T, "Quelle fonction Benjamin donne-t-il à la critique ?",
  "Non l'appréciation, mais dégager l'« idée infinie » de l'œuvre et contribuer à l'achever, lui conférant une dimension rédemptrice en la dégageant de sa gangue mythique.",
  { a: ['Benjamin'], n: ["l'art"], o: 'Le Concept de critique esthétique dans le romantisme allemand', art: 'Benjamin', p: '51' }),
D('d-popp-demarcation', T, "Quel critère de démarcation Popper propose-t-il entre science et non-science ?",
  "La falsifiabilité, non la vérifiabilité : une théorie scientifique peut être démentie par l'expérience. Une théorie qui a résisté aux tests est confirmée, non vérifiée ; une explication irréfutable est non scientifique (marxisme, psychanalyse selon lui).",
  { a: ['Popper'], n: ['la science', 'la vérité'], o: 'Logique de la découverte scientifique', art: 'Popper', p: '394-395' }),
D('d-popp-methode', T, "Quelle est la méthode scientifique selon Popper ?",
  "Non l'induction, mais la méthode déductive de contrôle : hypothèses, conséquences vérifiables, réfutations. Cette logique libérale est liée aux sociétés ouvertes, les sociétés closes reposant sur des explications totalisantes et non réfutables.",
  { a: ['Popper'], n: ['la science', "l'État"], o: 'La Société ouverte et ses ennemis', art: 'Popper', p: '395' }),
D('d-jank-presque-rien', T, "Que sont le « je-ne-sais-quoi » et le « presque-rien » chez Jankélévitch ?",
  "La fragilité de la moralité, fugace intention menacée de chute dans l'impureté, et la musique comme présence éloquente. La vie, « mélodie éphémère », reste pourtant un fait éternel qu'aucune mort n'annihile.",
  { a: ['Jankélévitch'], n: ['le temps', 'le devoir', "l'art"], o: 'Le Je-ne-sais-quoi et le Presque-rien', art: 'Jankélévitch', p: '264' }),
D('d-jona-responsabilite', T, "Pourquoi Jonas propose-t-il un « principe responsabilité » ?",
  "La technique menace l'environnement et l'humanité, et l'éthique traditionnelle (réciprocité, Kant) n'a pas de devoirs envers les choses ou les êtres futurs. La responsabilité vise les êtres vulnérables, y compris ceux qui n'existent pas encore.",
  { a: ['Jonas', 'Kant'], n: ['la technique', 'le devoir', 'la nature'], o: 'Le Principe responsabilité', art: 'Jonas', p: '267' }),
D('d-jona-imperatif', T, "Quel nouvel impératif Jonas formule-t-il ?",
  "« Agis de façon que les effets de ton action soient compatibles avec la permanence d'une vie authentiquement humaine sur terre. » Objections : heuristique de la peur, sacralisation de la nature, « dictature bienveillante ».",
  { a: ['Jonas'], n: ['la technique', 'le devoir', 'le temps'], o: 'Le Principe responsabilité', art: 'Jonas', p: '267-268' }),
];
