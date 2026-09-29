# CAFEP Philo — cartes de révision

Application web de révision par **flashcards** et **répétition espacée (FSRS)** pour le CAFEP/CAPES externe de philosophie (session 2027). Pensée pour le smartphone, utilisable à une main, **installable** sur l'écran d'accueil, **hors-ligne**, **synchronisée** entre appareils, et **100 % gratuite**.

> ⚠️ **À lire d'abord — contenu des cartes.** Les 173 cartes de départ ont été rédigées **de mémoire** : les sites de sources étaient inaccessibles pendant leur rédaction. **Toutes sont donc « À vérifier »**, y compris les listes de repères, les axes HLP et le calendrier du concours. Ne vous fiez pas à une carte avant d'avoir relu sa source, puis passez-la en « Vérifié » (pastille sur la carte). Détail et doutes : [`RAPPORT_SOURCES.md`](RAPPORT_SOURCES.md).

## Ce que fait l'application
- **Accueil** : nombre de cartes à réviser aujourd'hui, bouton « Commencer », série de jours.
- **Séance** : question → vous répondez de tête → « Afficher la réponse » → 4 boutons **À revoir / Difficile / Bien / Facile** (avec l'intervalle prévu). Raccourcis clavier : `Espace`, `1`–`4`.
- **Cartes** : recherche, filtres (type, notion, auteur, statut), ajout, modification, suppression avec confirmation puis « Annuler » pendant quelques secondes, corbeille.
- **Suivi** : à revoir, maîtrisées, progression par thème, révisions des 14 derniers jours.
- **Réglages** : nouvelles cartes par jour (15 par défaut), mémoire visée, thème clair/sombre/automatique, sauvegarde JSON discrète.
- Chaque carte a une source affichée séparément, une pastille « vérifié / à vérifier » que vous basculez vous-même, et un champ « image mentale / lieu » (palais de la mémoire).

## Choix de l'algorithme
FSRS (bibliothèque `ts-fsrs`) : moins de révisions qu'SM-2 pour la même rétention. Détails et limites dans [`NOTE_TECHNIQUE.md`](NOTE_TECHNIQUE.md).

---

## Mise en ligne pas à pas (sans ligne de commande)

Vous avez besoin d'un compte **Google** (pour Firebase) et d'un compte **GitHub** (pour l'hébergement). Tout est gratuit, aucune carte bancaire n'est demandée pour ces offres (plans Spark et GitHub Pages).

### Étape 1 — Créer le projet Firebase
1. Allez sur <https://console.firebase.google.com> et connectez-vous.
2. **Ajouter un projet** → donnez un nom (ex. `cafep-philo`) → vous pouvez **désactiver Google Analytics** (pas de suivi) → **Créer le projet**.
3. Sur la page du projet, cliquez sur l'icône **`</>` (Web)** pour ajouter une application web. Nom : `cafep-philo`. **Ne cochez pas** « Firebase Hosting ». Cliquez sur **Enregistrer l'application**.
4. Firebase affiche un bloc `firebaseConfig = { apiKey: "...", authDomain: "...", projectId: "...", ... }`. **Gardez cette page ouverte** ou copiez ces 6 valeurs : vous en aurez besoin à l'étape 4.

### Étape 2 — Activer la connexion (Authentication)
1. Menu de gauche : **Build → Authentication → Commencer**.
2. Onglet **Sign-in method** :
   - **Google** → Activer → choisissez un e-mail d'assistance → **Enregistrer**.
   - **E-mail/Mot de passe** → Activer (première option seulement) → **Enregistrer**. C'est votre solution de secours.
3. Onglet **Settings → Authorized domains** (Domaines autorisés) : ajoutez `VOTRE-PSEUDO-GITHUB.github.io` (à faire pour que la connexion fonctionne sur votre site).

### Étape 3 — Activer la base de données (Firestore) et ses règles de sécurité
1. Menu de gauche : **Build → Firestore Database → Créer une base de données**.
2. Choisissez un emplacement en Europe (ex. `eur3` ou `europe-west1`) → **Mode production** → **Activer**.
3. Onglet **Règles** : remplacez tout le contenu par celui du fichier [`firestore.rules`](firestore.rules) de ce dépôt, puis **Publier**. Ces règles garantissent que **chaque utilisateur n'accède qu'à ses propres données** (`/users/{uid}/...`).

### Étape 4 — Donner la configuration à GitHub
Cette configuration web n'est pas un secret (la protection vient des règles ci-dessus), mais on ne l'écrit pas dans le code.
1. Sur GitHub, dans ce dépôt : **Settings → Secrets and variables → Actions → onglet Variables → New repository variable**.
2. Créez ces 6 variables (nom exact → valeur copiée depuis `firebaseConfig`) :

| Nom de la variable | Valeur |
|---|---|
| `VITE_FIREBASE_API_KEY` | `apiKey` |
| `VITE_FIREBASE_AUTH_DOMAIN` | `authDomain` |
| `VITE_FIREBASE_PROJECT_ID` | `projectId` |
| `VITE_FIREBASE_STORAGE_BUCKET` | `storageBucket` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `messagingSenderId` |
| `VITE_FIREBASE_APP_ID` | `appId` |

### Étape 5 — Publier avec GitHub Pages
1. Dépôt GitHub : **Settings → Pages → Source : GitHub Actions**.
2. Fusionnez la branche de travail dans `main` (ou lancez manuellement le workflow **Déploiement GitHub Pages** dans l'onglet **Actions**). Le fichier [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) construit et publie le site.
3. Au bout de 1 à 2 minutes, le site est disponible sur `https://VOTRE-PSEUDO.github.io/CAFEPTITLOUP/` (HTTPS automatique).

### Étape 6 — Installer sur le téléphone
- **Android (Chrome)** : ouvrir le site → menu ⋮ → **Installer l'application** / **Ajouter à l'écran d'accueil**.
- **iPhone (Safari)** : ouvrir le site → bouton Partager → **Sur l'écran d'accueil**.
- Connectez-vous **une première fois avec Internet**, puis l'appli fonctionne aussi hors-ligne. Utilisez le **même compte** sur l'ordinateur : tout se synchronise automatiquement. La pastille en haut à droite indique l'état (Synchronisé / En attente / Hors ligne).

> Sans les variables de l'étape 4, l'appli démarre en **mode local** (données uniquement sur l'appareil, aucune connexion) : pratique pour essayer.

### Variante : Firebase Hosting (au lieu de GitHub Pages)
Nécessite un terminal : `npm install -g firebase-tools`, `firebase login`, `firebase use --add`, renseigner `.env` (modèle : `.env.example`), puis `npm ci && npm run build && firebase deploy`. Le fichier `firebase.json` est prêt.

---

## Mettre à jour le jeu de départ (ajouter des cartes)
Les cartes de départ sont écrites dans `tools/seed-src/*.mjs` (une ligne `C(id, type, question, réponse, {…})` par carte). Pour ajouter ou corriger :
1. Modifiez ou ajoutez des cartes (chaque `id` doit être **unique et ne jamais changer**, chaque carte doit avoir au moins une source).
2. Incrémentez `VERSION` dans `tools/build-seed.mjs`. Pour corriger une carte existante, ajoutez `rev: 2` (puis 3…) dans ses options : seules les cartes non modifiées par l'utilisateur sont alors mises à jour.
3. `npm run seed:build` régénère `data/cartes-depart.json` et `RAPPORT_SOURCES.md` (le contrôle refuse une carte marquée « verifie » sans URL ni date de consultation).
4. Fusionnez : au prochain lancement, chaque compte reçoit **uniquement** les nouvelles cartes. Les cartes que vous avez **modifiées** ne sont jamais écrasées, les cartes **supprimées** ne reviennent pas, la progression est conservée.

## Développement
```bash
npm install
cp .env.example .env     # facultatif ; sans .env : mode local
npm run dev              # http://localhost:5173
npm test                 # tests du planificateur et de la mise à jour du jeu de départ
npm run build            # contrôle du jeu de départ + typage + build PWA
node tools/e2e.mjs       # test de bout en bout (Chromium/Playwright), après `npm run preview`
```

## Vie privée et coût
Aucune publicité, aucun suivi tiers, aucun service payant. Les données sont stockées dans **votre** espace Firestore (`users/<votre identifiant>`), protégé par les règles ci-dessus.

## Contenu du dépôt
`src/` application · `data/cartes-depart.json` jeu de départ (généré) · `tools/seed-src/` source des cartes · `RAPPORT_SOURCES.md` sources et doutes · `NOTE_TECHNIQUE.md` choix techniques · `firestore.rules` sécurité · `tests/` tests.
