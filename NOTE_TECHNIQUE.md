# Note de choix techniques

## Algorithme : FSRS (via `ts-fsrs`)
- **Pourquoi FSRS** plutôt que SM-2 ou Leitner : il modélise explicitement la *stabilité* (durée de rétention) et la *difficulté* de chaque carte, et vise une **rétention cible** réglable (90 % par défaut). À rétention égale, il demande moins de révisions que SM-2. Un échec ramène la carte en quelques minutes, puis les intervalles croissent de plus en plus après chaque succès.
- **Réglages** : rétention 90 % (85 % ou 95 % au choix), intervalle maximum 365 jours, dispersion (« fuzz ») activée, paliers d'apprentissage par défaut de la bibliothèque (1 min, 10 min).
- **Limites** : paramètres par défaut de la bibliothèque, non optimisés sur vos données (il faudrait quelques centaines de révisions pour cela). Les concours étant en mars 2027, la limite à 365 jours est sans effet pratique.
- **Séance** : révisions échues d'abord (les plus en retard en premier), nouvelles cartes glissées entre elles. Une carte revenant dans moins de 20 min est replacée quelques cartes plus loin. Le « jour » de révision change à 4 h du matin.
- **Tests** : `npm test` (`tests/srs.test.ts`, `tests/seed.test.ts`).

## Stack
- **TypeScript + Vite**, sans framework d'interface : petite appli, chargement rapide, peu de dépendances.
- **PWA** (`vite-plugin-pwa` / Workbox) : installable, précache complet, fonctionne hors-ligne.
- **Firebase** plan Spark : Authentication (Google, e-mail/mot de passe) et Firestore avec cache persistant multi-onglets. Sans configuration, l'appli fonctionne en mode local (`localStorage`).
- **Données** : `users/{uid}/cartes/{id}` (carte + état FSRS), `users/{uid}/meta/reglages`, `users/{uid}/meta/stats`. Règles : un utilisateur n'accède qu'à `/users/{son uid}/...`.
- **Suppression** : une carte supprimée reçoit `supprimee: true` (« pierre tombale »). C'est ce qui permet l'annulation et empêche les mises à jour du jeu de départ de la ressusciter.
- **Jeu de départ** : embarqué dans l'appli (`data/cartes-depart.json`, `version` + `rev` par carte) et copié dans l'espace de l'utilisateur au premier lancement. Une mise à jour ne touche ni les cartes modifiées, ni les cartes supprimées.

## Limites du plan gratuit (Spark) — ordres de grandeur à vérifier sur la page officielle des tarifs
- Firestore : environ 1 Gio de stockage, 50 000 lectures et 20 000 écritures par jour. Usage attendu : quelques centaines de cartes, quelques dizaines d'écritures par séance → très loin des quotas. Le cache local évite de relire toute la collection à chaque ouverture.
- Authentication : quota mensuel largement suffisant pour un usage personnel. Pas de SMS (payant) : l'appli n'en utilise pas.
- Un projet Spark n'est **pas mis en pause** pour inactivité.
- Pas de Cloud Functions ni de facturation : rien à payer, et aucun service tiers de suivi.

## Limites connues
- Les modifications concurrentes de la même carte sur deux appareils : la dernière écriture l'emporte (acceptable pour un usage personnel).
- Le mode hors-ligne exige une première connexion en ligne.
- Contenu : toutes les cartes de départ sont « à vérifier » (voir `RAPPORT_SOURCES.md`).
