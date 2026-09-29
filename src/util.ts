export const esc = (s: unknown): string =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

export const $ = <T extends HTMLElement = HTMLElement>(sel: string, root: ParentNode = document) => root.querySelector<T>(sel);
export const $$ = <T extends HTMLElement = HTMLElement>(sel: string, root: ParentNode = document) => [...root.querySelectorAll<T>(sel)];

export const NOTIONS = ["l'art", 'le bonheur', 'la conscience', 'le devoir', "l'État", "l'inconscient", 'la justice', 'le langage',
  'la liberté', 'la nature', 'la raison', 'la religion', 'la science', 'la technique', 'le temps', 'le travail', 'la vérité'];

export const TYPE_LABELS: Record<string, string> = {
  notion: 'Notion', repere: 'Repère', auteur_oeuvre: 'Auteur / œuvre', citation: 'Citation',
  hlp: 'HLP', didactique: 'Didactique', methode: 'Méthode',
};
export const FIAB_LABELS: Record<string, string> = {
  officielle: 'Officielle', edition_savante: 'Édition savante', domaine_public: 'Domaine public', secondaire: 'Secondaire',
};
export const SYNC_LABELS: Record<string, [string, string]> = {
  local: ['Cet appareil', 'Mode local : pas de synchronisation'],
  synchronise: ['Synchronisé', 'Données synchronisées'],
  en_attente: ['En attente', 'Modifications en attente de synchronisation'],
  hors_ligne: ['Hors ligne', 'Hors ligne : tout est enregistré sur cet appareil'],
  erreur: ['Erreur', 'Erreur de synchronisation'],
};

export function toast(msg: string, action?: { label: string; fn: () => void }, ms = 6000) {
  const box = $('#toasts')!;
  const el = document.createElement('div');
  el.className = 'toast'; el.setAttribute('role', 'status');
  el.append(document.createTextNode(msg));
  if (action) {
    const b = document.createElement('button');
    b.textContent = action.label;
    b.onclick = () => { action.fn(); el.remove(); };
    el.append(b);
  }
  box.append(el);
  setTimeout(() => el.remove(), ms);
}

export function confirmDialog(msg: string, okLabel: string): Promise<boolean> {
  return new Promise((res) => {
    const d = document.createElement('dialog');
    d.innerHTML = `<form method="dialog"><p>${esc(msg)}</p><div class="row"><button value="non" class="btn">Annuler</button>
      <button value="oui" class="btn danger">${esc(okLabel)}</button></div></form>`;
    d.addEventListener('close', () => { res(d.returnValue === 'oui'); d.remove(); });
    document.body.append(d); d.showModal();
  });
}
