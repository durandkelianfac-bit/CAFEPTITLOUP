import { D } from './dsl.mjs';
const T = 'auteur_oeuvre';
export default [
// ---------- Cicéron (p. 80), Lucrèce (p. 303-304), Marc Aurèle (p. 314) ----------
D('d-cic-humanitas', T, "Qu'est-ce que l'humanitas chez Cicéron ?",
  "À la fois une culture aux dimensions universelles et l'amour sensible de l'humain (compassion). C'est la clef de voûte de sa philosophie, prolongée par l'idée de l'homme d'État éducateur.",
  { a: ['Cicéron'], n: ["l'État", 'le devoir'], art: 'Cicéron', p: '80' }),
D('d-cic-politique', T, "Quelle constitution Cicéron défend-il, et au nom de quelle tradition ?",
  "Une constitution mixte équilibrant principes monarchiques et démocratiques, sous l'égide d'une élite éclairée. Il hérite des traditions sceptique, stoïcienne et platonicienne et fonde une approche naturaliste de la loi (droit naturel, Traité des lois).",
  { a: ['Cicéron'], n: ["l'État", 'la justice', 'la nature'], art: 'Cicéron', p: '80' }),
D('d-cic-religion', T, "Quelle conception de la religion Cicéron défend-il dans La Nature des dieux ?",
  "Une religion conforme à la raison : comme les sceptiques il récuse toute certitude sur le divin et il condamne la superstition.",
  { a: ['Cicéron'], n: ['la religion', 'la raison'], o: 'La Nature des dieux', art: 'Cicéron', p: '80' }),
D('d-lucr-nature', T, "Que veut réaliser Lucrèce dans De la nature ?",
  "Libérer l'homme de la superstition par la connaissance de la nature des choses (atomisme : corps et vide). La nature est déterminée mais non finalisée : hasard et nécessité, sans providence.",
  { a: ['Lucrèce'], n: ['la nature', 'la religion', 'la science'], o: 'De la nature (De natura rerum)', art: 'Lucrèce', p: '303-304' }),
D('d-lucr-clinamen', T, "À quoi sert le clinamen dans la physique de Lucrèce ?",
  "La déclinaison des atomes introduit de la spontanéité, dans les corps comme dans l'esprit : fondement matérialiste d'une morale de l'autonomie, l'homme n'étant soumis à aucune fatalité.",
  { a: ['Lucrèce'], n: ['la liberté', 'la nature'], art: 'Lucrèce', p: '304' }),
D('d-lucr-serenite', T, "Comment Lucrèce conçoit-il la sérénité (ataraxie) ?",
  "Le sage se délivre des craintes (la mort, les dieux, la douleur) et des désirs vains (richesse, pouvoir, gloire, avatars du désir d'immortalité). L'âme, atomique, se disperse avec le corps.",
  { a: ['Lucrèce'], n: ['le bonheur', 'la religion'], art: 'Lucrèce', p: '304' }),
D('d-marc-aurele', T, "Quelle attitude face à la mort et au temps les Pensées de Marc Aurèle recommandent-elles ?",
  "La mort est changement et renouvellement de l'Univers, à accepter sereinement. Il faut vivre dignement le présent, être utile au bien commun, car les hommes sont liés dans la nature.",
  { a: ['Marc Aurèle'], n: ['le temps', 'le devoir', 'le bonheur'], o: 'Pensées pour moi-même', art: 'Marc Aurèle', p: '314' }),
D('d-marc-vision-du-tout', T, "Que produit la vision du Tout et de ses transformations selon Marc Aurèle ?",
  "Elle élève l'âme et élimine fausses représentations et passions (ambition, orgueil, colère) : elle rend modeste, juste et bienveillant envers tout homme, égal par sa raison et sa sociabilité.",
  { a: ['Marc Aurèle'], n: ['la raison', 'la nature'], o: 'Pensées pour moi-même', art: 'Marc Aurèle', p: '314' }),
];
