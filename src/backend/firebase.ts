import { initializeApp } from 'firebase/app';
import {
  createUserWithEmailAndPassword, getAuth, GoogleAuthProvider, onAuthStateChanged, sendPasswordResetEmail,
  signInWithEmailAndPassword, signInWithPopup, signOut, type User,
} from 'firebase/auth';
import {
  collection, doc, increment, initializeFirestore, onSnapshot, persistentLocalCache,
  persistentMultipleTabManager, setDoc, writeBatch, type Firestore,
} from 'firebase/firestore';
import type { Card, Settings, Stats, SyncState } from '../types';
import type { Backend } from './types';

const env = import.meta.env;
const config = {
  apiKey: env.VITE_FIREBASE_API_KEY, authDomain: env.VITE_FIREBASE_AUTH_DOMAIN, projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET, messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
};
export const firebaseConfigured = Boolean(config.apiKey && config.projectId && config.appId);

let db: Firestore;
let auth: ReturnType<typeof getAuth>;
function init() {
  if (auth) return;
  const app = initializeApp(config);
  auth = getAuth(app);
  // Cache persistant partagé entre onglets : l'appli fonctionne hors-ligne, les écritures sont mises en file.
  db = initializeFirestore(app, { localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }) });
}

export const authApi = {
  watch(cb: (u: User | null) => void) { init(); return onAuthStateChanged(auth, cb); },
  google: () => { init(); return signInWithPopup(auth, new GoogleAuthProvider()); },
  login: (email: string, pw: string) => { init(); return signInWithEmailAndPassword(auth, email, pw); },
  signup: (email: string, pw: string) => { init(); return createUserWithEmailAndPassword(auth, email, pw); },
  reset: (email: string) => { init(); return sendPasswordResetEmail(auth, email); },
  logout: () => { init(); return signOut(auth); },
};

export function messageErreurAuth(e: unknown): string {
  const code = (e as { code?: string })?.code ?? '';
  const m: Record<string, string> = {
    'auth/invalid-credential': 'E-mail ou mot de passe incorrect.',
    'auth/wrong-password': 'E-mail ou mot de passe incorrect.',
    'auth/user-not-found': 'E-mail ou mot de passe incorrect.',
    'auth/email-already-in-use': 'Un compte existe déjà avec cet e-mail.',
    'auth/weak-password': 'Mot de passe trop court (6 caractères minimum).',
    'auth/invalid-email': "Adresse e-mail invalide.",
    'auth/popup-closed-by-user': 'Connexion annulée.',
    'auth/popup-blocked': 'La fenêtre de connexion a été bloquée par le navigateur.',
    'auth/network-request-failed': 'Pas de connexion Internet.',
    'auth/unauthorized-domain': "Ce domaine n'est pas autorisé dans Firebase (voir le README, étape « domaines autorisés »).",
    'auth/operation-not-allowed': "Ce mode de connexion n'est pas activé dans Firebase.",
  };
  return m[code] ?? 'Connexion impossible. Réessayez.';
}

export function firebaseBackend(uid: string): Backend {
  init();
  const base = `users/${uid}`;
  const cardsCol = collection(db, `${base}/cartes`);
  const settingsDoc = doc(db, `${base}/meta/reglages`);
  const statsDoc = doc(db, `${base}/meta/stats`);
  const syncSubs = new Set<(s: SyncState) => void>();
  let pending = false, fromCache = true, err = false;
  const compute = (): SyncState => err ? 'erreur' : !navigator.onLine ? (pending ? 'en_attente' : 'hors_ligne')
    : pending ? 'en_attente' : fromCache ? 'en_attente' : 'synchronise';
  const push = () => syncSubs.forEach((f) => f(compute()));
  addEventListener('online', push); addEventListener('offline', push);
  return {
    kind: 'firebase',
    onCards(cb) {
      return onSnapshot(cardsCol, { includeMetadataChanges: true }, (snap) => {
        pending = snap.metadata.hasPendingWrites; fromCache = snap.metadata.fromCache; err = false; push();
        cb(snap.docs.map((d) => d.data() as Card));
      }, () => { err = true; push(); });
    },
    onSettings: (cb) => onSnapshot(settingsDoc, (s) => cb((s.data() ?? {}) as Partial<Settings>)),
    onStats: (cb) => onSnapshot(statsDoc, (s) => {
      const d = (s.data() ?? {}) as Partial<Stats>;
      cb({ jours: d.jours ?? {}, nouvelles: d.nouvelles ?? {} });
    }),
    onSync(cb) { syncSubs.add(cb); cb(compute()); return () => { syncSubs.delete(cb); }; },
    async putCards(cards) {
      for (let i = 0; i < cards.length; i += 400) {
        const b = writeBatch(db);
        for (const c of cards.slice(i, i + 400)) b.set(doc(cardsCol, c.id), c);
        // Hors-ligne, la promesse ne se résout qu'au retour du réseau : on ne bloque pas l'interface dessus.
        b.commit().catch(() => { err = true; push(); });
      }
    },
    async saveSettings(s) { setDoc(settingsDoc, s, { merge: true }).catch(() => {}); },
    async bumpStats(day, reviews, news) {
      const data: Record<string, unknown> = { jours: { [day]: increment(reviews) } };
      if (news) data.nouvelles = { [day]: increment(news) };
      setDoc(statsDoc, data, { merge: true }).catch(() => {});
    },
  };
}
