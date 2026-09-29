export type CardType = 'notion' | 'repere' | 'auteur_oeuvre' | 'citation' | 'hlp' | 'didactique' | 'methode';
export type Reliability = 'officielle' | 'edition_savante' | 'domaine_public' | 'secondaire';
export type VerifStatus = 'a_verifier' | 'verifie';
export type Rating = 1 | 2 | 3 | 4; // À revoir, Difficile, Bien, Facile

export interface Source {
  reference: string;
  edition: string | null;
  url: string | null;
  consulte_le: string | null;
  fiabilite: Reliability;
}

/** État de planification, sérialisable (dates en millisecondes). */
export interface SrsState {
  due: number;
  stability: number;
  difficulty: number;
  scheduled_days: number;
  learning_steps: number;
  reps: number;
  lapses: number;
  state: number; // 0 Nouvelle, 1 Apprentissage, 2 Révision, 3 Réapprentissage
  last_review: number | null;
}

export interface Card {
  id: string;
  type: CardType;
  question: string;
  reponse: string;
  notions: string[];
  auteurs: string[];
  oeuvre: string | null;
  sources: Source[];
  statut: VerifStatus;
  note_verification: string;
  image_mentale: string;
  cree_par: 'seed' | 'utilisateur';
  // Suivi de l'origine (jeu de départ)
  seed_rev?: number;
  modifiee?: boolean; // modifiée par l'utilisateur => jamais écrasée
  supprimee?: boolean; // « pierre tombale » : évite la résurrection
  maj: number;
  srs: SrsState;
}

export interface SeedCard extends Omit<Card, 'srs' | 'maj' | 'modifiee' | 'supprimee' | 'seed_rev'> {
  rev: number; // révision de la carte dans le jeu de départ
}

export interface SeedFile {
  version: number;
  genere_le: string;
  retirees?: string[]; // cartes retirées du jeu de départ
  cartes: SeedCard[];
}

export interface Settings {
  nouvellesParJour: number; // 15 par défaut
  retention: number; // 0.9 par défaut
  theme: 'auto' | 'clair' | 'sombre';
  seedVersion: number; // dernière version du jeu de départ appliquée
}

export interface Stats {
  jours: Record<string, number>; // AAAA-MM-JJ -> révisions effectuées
  nouvelles: Record<string, number>; // AAAA-MM-JJ -> nouvelles cartes introduites
}

export type SyncState = 'local' | 'synchronise' | 'en_attente' | 'hors_ligne' | 'erreur';
