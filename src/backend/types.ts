import type { Card, Settings, Stats, SyncState } from '../types';

export type Unsub = () => void;

export interface Backend {
  kind: 'local' | 'firebase';
  onCards(cb: (c: Card[]) => void): Unsub;
  onSettings(cb: (s: Partial<Settings>) => void): Unsub;
  onStats(cb: (s: Stats) => void): Unsub;
  onSync(cb: (s: SyncState) => void): Unsub;
  putCards(cards: Card[]): Promise<void>;
  saveSettings(s: Partial<Settings>): Promise<void>;
  bumpStats(day: string, reviews: number, news: number): Promise<void>;
}

export const DEFAULT_SETTINGS: Settings = { nouvellesParJour: 15, retention: 0.9, theme: 'auto', seedVersion: 0 };
