import { authApi, firebaseConfigured, messageErreurAuth } from './backend/firebase';
import { DEFAULT_SETTINGS } from './backend/types';
import { buildQueue, dayKey, dueCards, newCards, newQuota, requeue, active, streak } from './session';
import { formatDelay, isMastered, newSrs, preview, RATING_LABELS } from './srs';
import * as store from './store';
import { state } from './store';
import type { Card, CardType, Rating, Source } from './types';
import { $, $$, confirmDialog, esc, FIAB_LABELS, NOTIONS, SYNC_LABELS, toast, TYPE_LABELS } from './util';

const app = () => $('#app')!;
let user: string | null = null;

export function applyTheme(t = state.settings.theme) {
  const r = document.documentElement;
  if (t === 'clair' || t === 'sombre') r.dataset.theme = t === 'clair' ? 'light' : 'dark'; else delete r.dataset.theme;
}

/* ---------- Connexion ---------- */
export function renderLogin() {
  let mode: 'login' | 'signup' = 'login';
  const draw = (err = '', info = '') => {
    app().innerHTML = `<main class="login"><h1>CAFEP Philo</h1><p class="muted">Cartes de révision — synchronisées sur tous vos appareils.</p>
      <button class="btn primary big" data-act="google">Continuer avec Google</button>
      <p class="sep">ou avec une adresse e-mail</p>
      <form id="lf"><label>Adresse e-mail<input name="email" type="email" autocomplete="email" required></label>
      <label>Mot de passe<input name="pw" type="password" autocomplete="${mode === 'login' ? 'current-password' : 'new-password'}" minlength="6" required></label>
      <button class="btn big">${mode === 'login' ? 'Se connecter' : 'Créer le compte'}</button></form>
      <p class="err" role="alert">${esc(err)}</p><p class="ok">${esc(info)}</p>
      <p><button class="link" data-act="toggle">${mode === 'login' ? 'Créer un compte' : 'J’ai déjà un compte'}</button> ·
      <button class="link" data-act="reset">Mot de passe oublié</button></p></main>`;
  };
  draw();
  const run = async (fn: () => Promise<unknown>, info = '') => { try { await fn(); } catch (e) { draw(messageErreurAuth(e)); return; } if (info) draw('', info); };
  app().onclick = (ev) => {
    const a = (ev.target as HTMLElement).closest<HTMLElement>('[data-act]')?.dataset.act;
    const f = () => $<HTMLFormElement>('#lf')!;
    if (a === 'google') run(() => authApi.google());
    if (a === 'toggle') { mode = mode === 'login' ? 'signup' : 'login'; draw(); }
    if (a === 'reset') {
      const email = (f().elements.namedItem('email') as HTMLInputElement).value;
      if (!email) draw('Saisissez d’abord votre adresse e-mail.'); else run(() => authApi.reset(email), 'E-mail de réinitialisation envoyé.');
    }
  };
  app().onsubmit = (ev) => {
    ev.preventDefault();
    const fd = new FormData(ev.target as HTMLFormElement);
    const [e, p] = [String(fd.get('email')), String(fd.get('pw'))];
    run(() => (mode === 'login' ? authApi.login(e, p) : authApi.signup(e, p)));
  };
}

/* ---------- Coquille ---------- */
type Route = { name: string; id?: string };
const parse = (): Route => {
  const [, name = 'accueil', id] = location.hash.split('/');
  return { name: name || 'accueil', id: id ? decodeURIComponent(id) : undefined };
};

export function mountApp(opts: { user: string | null }) {
  user = opts.user;
  app().onclick = onClick; app().onsubmit = onSubmit; app().oninput = onInput;
  app().innerHTML = `<header class="top"><a href="#/" class="brand">CAFEP Philo</a><span id="sync" class="pill"></span></header>
    <main id="view" tabindex="-1"></main>
    <nav class="tabs" aria-label="Navigation principale">
      <a href="#/" data-tab="accueil">Accueil</a><a href="#/biblio" data-tab="biblio">Cartes</a>
      <a href="#/suivi" data-tab="suivi">Suivi</a><a href="#/reglages" data-tab="reglages">Réglages</a></nav>`;
  addEventListener('hashchange', () => render(true));
  store.subscribe(() => { updateSync(); if (!VOLATILE.has(parse().name)) render(false); });
  addEventListener('keydown', onKey);
  render(true);
}

const VOLATILE = new Set(['reviser', 'edition']);

function updateSync() {
  const el = $('#sync'); if (!el) return;
  const [l, t] = SYNC_LABELS[state.sync];
  el.textContent = l; el.title = t; el.className = `pill sync-${state.sync}`; el.setAttribute('aria-label', t);
}

function render(nav: boolean) {
  const r = parse();
  if (nav && r.name !== 'reviser') sess = null;
  updateSync();
  $$('.tabs a').forEach((a) => a.classList.toggle('on', a.dataset.tab === (['carte', 'edition'].includes(r.name) ? 'biblio' : r.name)));
  const v = $('#view')!;
  if (!state.ready) { v.innerHTML = '<p class="muted center">Chargement…</p>'; return; }
  const views: Record<string, () => string> = {
    accueil: vAccueil, reviser: vReviser, biblio: vBiblio, carte: () => vCarte(r.id!), edition: () => vEdition(r.id),
    suivi: vSuivi, reglages: vReglages,
  };
  const scroll = v.scrollTop;
  v.innerHTML = (views[r.name] ?? vAccueil)();
  if (nav) { window.scrollTo(0, 0); v.focus({ preventScroll: true }); } else window.scrollTo(0, scroll);
  if (r.name === 'biblio') drawList();
}

/* ---------- Composants ---------- */
const verifPill = (c: Card, btn = false) => {
  const ok = c.statut === 'verifie';
  const txt = ok ? '✔ Vérifié' : '⚠ À vérifier';
  return btn ? `<button class="pill ${ok ? 'ok' : 'warn'}" data-act="verif" data-id="${esc(c.id)}" aria-pressed="${ok}"
    title="Cliquer pour changer le statut après avoir relu la source">${txt}</button>`
    : `<span class="pill ${ok ? 'ok' : 'warn'}">${txt}</span>`;
};
const tags = (c: Card) => `<span class="chip">${esc(TYPE_LABELS[c.type])}</span>` +
  [...c.notions, ...c.auteurs].map((t) => `<span class="chip alt">${esc(t)}</span>`).join('');

const sourcesHtml = (c: Card, withNote = true) => `<section class="sources"><h3>Sources</h3>${c.sources.length ? `<ul>${c.sources.map((s) =>
  `<li>${esc(s.reference)}${s.edition ? ` — <em>${esc(s.edition)}</em>` : ''}
   <span class="fiab">${esc(FIAB_LABELS[s.fiabilite])}${s.consulte_le ? `, consultée le ${esc(s.consulte_le)}` : ', non consultée'}</span>
   ${s.url ? `<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">lien</a>` : ''}</li>`).join('')}</ul>` : '<p class="muted">Aucune source.</p>'}
  ${withNote && c.note_verification ? `<p class="note">${esc(c.note_verification)}</p>` : ''}</section>`;

const mental = (c: Card) => c.image_mentale ? `<section class="mental"><h3>Image mentale / lieu</h3><p>${esc(c.image_mentale)}</p></section>` : '';

/* ---------- Accueil ---------- */
function counts() {
  const now = Date.now();
  const due = dueCards(state.cards, now).length;
  const intro = state.stats.nouvelles[dayKey(now)] ?? 0;
  const nouv = newQuota(state.cards, state.settings.nouvellesParJour, intro);
  return { due, nouv, total: due + nouv };
}

function vAccueil() {
  const { due, nouv, total } = counts();
  const s = streak(state.stats.jours);
  const today = state.stats.jours[dayKey()] ?? 0;
  const toCheck = active(state.cards).filter((c) => c.statut === 'a_verifier').length;
  return `<section class="hero"><p class="big-num" aria-live="polite">${total}</p>
    <p class="hero-label">${total === 0 ? 'Rien à réviser pour le moment' : total === 1 ? 'carte à réviser aujourd’hui' : 'cartes à réviser aujourd’hui'}</p>
    <p class="muted">${due} révision${due > 1 ? 's' : ''} · ${nouv} nouvelle${nouv > 1 ? 's' : ''}</p>
    ${total ? '<a class="btn primary big" href="#/reviser" id="go">Commencer</a>' : ''}</section>
    <div class="grid2"><div class="stat"><b>${s}</b><span>jour${s > 1 ? 's' : ''} de suite</span></div>
    <div class="stat"><b>${today}</b><span>révision${today > 1 ? 's' : ''} aujourd’hui</span></div></div>
    ${state.sync === 'local' ? '<p class="banner">Mode local : vos cartes restent sur cet appareil. Configurez Firebase pour la synchronisation (voir le README).</p>' : ''}
    <p class="muted center small">${toCheck} carte${toCheck > 1 ? 's' : ''} à vérifier sur ${active(state.cards).length}. Relisez la source avant de vous fier à une carte.</p>`;
}

/* ---------- Séance ---------- */
interface Sess { queue: Card[]; total: number; done: number; shown: boolean; good: number; }
let sess: Sess | null = null;

function vReviser() {
  if (!sess) {
    const q = buildQueue(state.cards, Date.now(), state.settings.nouvellesParJour, state.stats.nouvelles[dayKey()] ?? 0);
    sess = { queue: q, total: q.length, done: 0, shown: false, good: 0 };
  }
  const s = sess;
  if (!s.queue.length) {
    return `<section class="hero"><h1>${s.total ? 'Séance terminée' : 'Rien à réviser'}</h1>
      ${s.total ? `<p class="muted">${s.done} réponse${s.done > 1 ? 's' : ''}, dont ${s.good} réussie${s.good > 1 ? 's' : ''}.</p>` : ''}
      <a class="btn primary big" href="#/">Retour à l’accueil</a></section>`;
  }
  const c = state.cards.find((x) => x.id === s.queue[0].id) ?? s.queue[0];
  const pct = s.total ? Math.round((s.done / (s.done + s.queue.length)) * 100) : 0;
  const head = `<div class="prog" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100" aria-label="Progression"><i style="width:${pct}%"></i></div>
    <p class="muted small center">${s.queue.length} restante${s.queue.length > 1 ? 's' : ''}</p>`;
  if (!s.shown) {
    return `${head}<article class="card front"><div class="tags">${tags(c)}</div><h2 class="q">${esc(c.question)}</h2>
      <p class="muted small">Essayez de répondre de tête, puis retournez la carte.</p></article>
      <div class="actionbar"><button class="btn primary big" data-act="show" id="show">Afficher la réponse</button></div>`;
  }
  const now = Date.now();
  const p = preview(c.srs, now, state.settings.retention);
  const btn = (r: Rating, cls: string) => `<button class="btn rate ${cls}" data-act="rate" data-r="${r}"><span>${RATING_LABELS[r]}</span><small>${formatDelay(p[r] - now)}</small></button>`;
  return `${head}<article class="card back"><div class="tags">${tags(c)}</div><p class="q small-q">${esc(c.question)}</p>
    <div class="answer">${esc(c.reponse).replace(/\n/g, '<br>')}</div>${mental(c)}${sourcesHtml(c, false)}
    <div class="row between">${verifPill(c, true)}<a class="link" href="#/edition/${encodeURIComponent(c.id)}">Modifier</a></div></article>
    <div class="actionbar rates">${btn(1, 'r1')}${btn(2, 'r2')}${btn(3, 'r3')}${btn(4, 'r4')}</div>`;
}

async function rate(r: Rating) {
  if (!sess || !sess.queue.length || !sess.shown) return;
  const c = sess.queue[0];
  const now = Date.now();
  const next = await store.rateCard(c.id, r, now);
  if (!next) return;
  sess.done++; if (r >= 3) sess.good++;
  sess.queue = requeue(sess.queue, c, next, now, r);
  sess.shown = false;
  render(false);
}

/* ---------- Bibliothèque ---------- */
const filt = { q: '', type: '', notion: '', auteur: '', statut: '' };

function vBiblio() {
  const all = state.cards;
  const auteurs = [...new Set(active(all).flatMap((c) => c.auteurs))].sort((a, b) => a.localeCompare(b, 'fr'));
  const opt = (v: string, l: string, cur: string) => `<option value="${esc(v)}"${v === cur ? ' selected' : ''}>${esc(l)}</option>`;
  return `<div class="row between"><h1>Cartes</h1><a class="btn primary" href="#/edition">+ Nouvelle</a></div>
    <input id="q" type="search" placeholder="Rechercher (question, réponse, auteur…)" value="${esc(filt.q)}" aria-label="Rechercher">
    <div class="filters">
      <select data-f="type" aria-label="Type">${opt('', 'Tous types', filt.type)}${Object.entries(TYPE_LABELS).map(([k, v]) => opt(k, v, filt.type)).join('')}</select>
      <select data-f="notion" aria-label="Notion">${opt('', 'Toutes notions', filt.notion)}${NOTIONS.map((n) => opt(n, n, filt.notion)).join('')}</select>
      <select data-f="auteur" aria-label="Auteur">${opt('', 'Tous auteurs', filt.auteur)}${auteurs.map((n) => opt(n, n, filt.auteur)).join('')}</select>
      <select data-f="statut" aria-label="Statut">${opt('', 'Tous statuts', filt.statut)}${opt('a_verifier', 'À vérifier', filt.statut)}${opt('verifie', 'Vérifié', filt.statut)}${opt('supprimee', 'Corbeille', filt.statut)}</select>
    </div><p id="count" class="muted small"></p><ul id="liste" class="list"></ul>`;
}

function filterCards(): Card[] {
  const q = filt.q.trim().toLowerCase();
  return state.cards.filter((c) => {
    if (filt.statut === 'supprimee') return !!c.supprimee;
    if (c.supprimee) return false;
    if (filt.type && c.type !== filt.type) return false;
    if (filt.notion && !c.notions.includes(filt.notion)) return false;
    if (filt.auteur && !c.auteurs.includes(filt.auteur)) return false;
    if (filt.statut && c.statut !== filt.statut) return false;
    return !q || [c.question, c.reponse, c.oeuvre, ...c.auteurs, ...c.notions].join(' ').toLowerCase().includes(q);
  }).sort((a, b) => a.question.localeCompare(b.question, 'fr'));
}

function drawList() {
  const l = $('#liste'); if (!l) return;
  const cs = filterCards();
  $('#count')!.textContent = `${cs.length} carte${cs.length > 1 ? 's' : ''}`;
  l.innerHTML = cs.slice(0, 200).map((c) => `<li>${filt.statut === 'supprimee'
    ? `<div class="item"><span>${esc(c.question)}</span><button class="btn" data-act="restore" data-id="${esc(c.id)}">Restaurer</button></div>`
    : `<a class="item" href="#/carte/${encodeURIComponent(c.id)}"><span class="qt">${esc(c.question)}</span>
       <span class="meta">${esc(TYPE_LABELS[c.type])}${c.auteurs[0] ? ' · ' + esc(c.auteurs[0]) : ''} ${verifPill(c)}</span></a>`}</li>`).join('')
    || '<li class="muted center">Aucune carte.</li>';
}

function vCarte(id: string) {
  const c = state.cards.find((x) => x.id === id);
  if (!c) return '<p class="muted">Carte introuvable.</p><a class="btn" href="#/biblio">Retour</a>';
  const s = c.srs;
  return `<a class="link" href="#/biblio">← Cartes</a><article class="card back"><div class="tags">${tags(c)}</div>
    <h2 class="q">${esc(c.question)}</h2><div class="answer">${esc(c.reponse).replace(/\n/g, '<br>')}</div>
    ${c.oeuvre ? `<p class="muted small">Œuvre : ${esc(c.oeuvre)}</p>` : ''}${mental(c)}${sourcesHtml(c)}
    <p class="muted small">${s.state === 0 ? 'Nouvelle carte' : `Prochaine révision : ${new Date(s.due).toLocaleDateString('fr-FR')} · ${s.reps} révisions, ${s.lapses} oubli${s.lapses > 1 ? 's' : ''}`}
    ${c.cree_par === 'seed' ? ` · jeu de départ${c.modifiee ? ' (modifiée)' : ''}` : ' · créée par vous'}</p>
    <div class="row between">${verifPill(c, true)}</div></article>
    <div class="row"><a class="btn" href="#/edition/${encodeURIComponent(c.id)}">Modifier</a>
    <button class="btn danger" data-act="del" data-id="${esc(c.id)}">Supprimer</button></div>`;
}

/* ---------- Édition ---------- */
function sourceRow(s?: Source) {
  return `<fieldset class="src"><legend>Source</legend>
    <label>Référence précise<input name="s_ref" value="${esc(s?.reference)}" placeholder="Platon, République, VII, 514a-517a"></label>
    <label>Édition / traduction<input name="s_ed" value="${esc(s?.edition)}"></label>
    <label>Lien (si existant)<input name="s_url" type="url" value="${esc(s?.url)}"></label>
    <div class="row"><label>Fiabilité<select name="s_fi">${Object.entries(FIAB_LABELS).map(([k, v]) =>
      `<option value="${k}"${(s?.fiabilite ?? 'secondaire') === k ? ' selected' : ''}>${v}</option>`).join('')}</select></label>
    <label>Consultée le<input name="s_date" type="date" value="${esc(s?.consulte_le)}"></label></div>
    <button type="button" class="link" data-act="rmsrc">Retirer cette source</button></fieldset>`;
}

function vEdition(id?: string) {
  const c = id ? state.cards.find((x) => x.id === id) : undefined;
  return `<h1>${c ? 'Modifier la carte' : 'Nouvelle carte'}</h1>
    <p class="muted small">Une idée par carte, question précise, réponse courte (2 à 3 lignes).</p>
    <form id="ef" data-id="${esc(c?.id)}">
    <label>Type<select name="type">${Object.entries(TYPE_LABELS).map(([k, v]) => `<option value="${k}"${(c?.type ?? 'notion') === k ? ' selected' : ''}>${v}</option>`).join('')}</select></label>
    <label>Question<textarea name="question" rows="3" required>${esc(c?.question)}</textarea></label>
    <label>Réponse<textarea name="reponse" rows="4" required>${esc(c?.reponse)}</textarea></label>
    <label>Notions (séparées par des virgules)<input name="notions" list="dl-n" value="${esc(c?.notions.join(', '))}"></label>
    <datalist id="dl-n">${NOTIONS.map((n) => `<option value="${esc(n)}">`).join('')}</datalist>
    <label>Auteurs (séparés par des virgules)<input name="auteurs" value="${esc(c?.auteurs.join(', '))}"></label>
    <label>Œuvre<input name="oeuvre" value="${esc(c?.oeuvre)}"></label>
    <label>Image mentale / lieu (facultatif)<input name="image_mentale" value="${esc(c?.image_mentale)}" placeholder="Ex. : la porte de la cuisine, un homme enchaîné"></label>
    <div id="srcs">${(c?.sources.length ? c.sources : [undefined]).map(sourceRow).join('')}</div>
    <button type="button" class="btn" data-act="addsrc">+ Ajouter une source</button>
    <label>Note de vérification<textarea name="note_verification" rows="2">${esc(c?.note_verification)}</textarea></label>
    <label class="check"><input type="checkbox" name="verifie"${c?.statut === 'verifie' ? ' checked' : ''}> J’ai relu la source : carte vérifiée</label>
    <div class="actionbar"><a class="btn" href="${c ? '#/carte/' + encodeURIComponent(c.id) : '#/biblio'}">Annuler</a><button class="btn primary">Enregistrer</button></div></form>`;
}

async function submitEdition(f: HTMLFormElement) {
  const fd = new FormData(f);
  const list = (k: string) => String(fd.get(k) ?? '').split(',').map((x) => x.trim()).filter(Boolean);
  const refs = fd.getAll('s_ref').map(String), eds = fd.getAll('s_ed').map(String), urls = fd.getAll('s_url').map(String),
    fis = fd.getAll('s_fi').map(String), dates = fd.getAll('s_date').map(String);
  const sources: Source[] = refs.map((r, i) => ({ reference: r.trim(), edition: eds[i].trim() || null, url: urls[i].trim() || null,
    consulte_le: dates[i] || null, fiabilite: fis[i] as Source['fiabilite'] })).filter((s) => s.reference);
  const id = f.dataset.id;
  const cur = id ? state.cards.find((x) => x.id === id) : undefined;
  const card: Card = {
    ...(cur ?? { srs: newSrs(), cree_par: 'utilisateur' as const, id: 'u-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6) }),
    type: fd.get('type') as CardType, question: String(fd.get('question')).trim(), reponse: String(fd.get('reponse')).trim(),
    notions: list('notions'), auteurs: list('auteurs'), oeuvre: String(fd.get('oeuvre')).trim() || null, sources,
    statut: fd.get('verifie') ? 'verifie' : 'a_verifier', note_verification: String(fd.get('note_verification')).trim(),
    image_mentale: String(fd.get('image_mentale')).trim(), maj: Date.now(),
  } as Card;
  await store.saveCard(card);
  toast('Carte enregistrée.');
  location.hash = '#/carte/' + encodeURIComponent(card.id);
}

/* ---------- Suivi ---------- */
function vSuivi() {
  const cs = active(state.cards);
  const now = Date.now();
  const nNew = newCards(cs).length;
  const mast = cs.filter((c) => isMastered(c.srs)).length;
  const due = dueCards(cs, now).length;
  const learn = cs.length - nNew - mast;
  const themes = [...NOTIONS, '__autre'].map((n) => {
    const set = n === '__autre' ? cs.filter((c) => !c.notions.some((x) => NOTIONS.includes(x))) : cs.filter((c) => c.notions.includes(n));
    const m = set.filter((c) => isMastered(c.srs)).length, seen = set.filter((c) => c.srs.state !== 0).length;
    return { n: n === '__autre' ? 'Autres (auteurs, méthode…)' : n, total: set.length, m, seen };
  }).filter((t) => t.total);
  const days = Array.from({ length: 14 }, (_, i) => { const t = now - (13 - i) * 86400000; return { k: dayKey(t), d: new Date(t) }; });
  const max = Math.max(1, ...days.map((d) => state.stats.jours[d.k] ?? 0));
  return `<h1>Suivi</h1><div class="grid2">
    <div class="stat"><b>${due}</b><span>à revoir aujourd’hui</span></div><div class="stat"><b>${mast}</b><span>maîtrisées</span></div>
    <div class="stat"><b>${learn}</b><span>en apprentissage</span></div><div class="stat"><b>${nNew}</b><span>pas encore vues</span></div></div>
    <p class="muted small">« Maîtrisée » : en révision espacée, mémoire estimée stable au-delà de 3 semaines.</p>
    <h2>Série : ${streak(state.stats.jours)} jour${streak(state.stats.jours) > 1 ? 's' : ''}</h2>
    <div class="bars" role="img" aria-label="Révisions des 14 derniers jours">${days.map((d) => { const v = state.stats.jours[d.k] ?? 0;
      return `<div title="${d.d.toLocaleDateString('fr-FR')} : ${v}"><i style="height:${Math.round((v / max) * 100)}%"></i><small>${d.d.getDate()}</small></div>`; }).join('')}</div>
    <h2>Progression par thème</h2><ul class="themes">${themes.map((t) => `<li><div class="row between"><span>${esc(t.n)}</span>
      <small>${t.m}/${t.total} maîtrisées · ${t.seen} vues</small></div><div class="meter"><i class="a" style="width:${(t.m / t.total) * 100}%"></i><i class="b" style="width:${((t.seen - t.m) / t.total) * 100}%"></i></div></li>`).join('')}</ul>`;
}

/* ---------- Réglages ---------- */
function vReglages() {
  const s = state.settings;
  const opt = (v: string, l: string) => `<option value="${v}"${s.theme === v ? ' selected' : ''}>${l}</option>`;
  return `<h1>Réglages</h1>
    <label>Nouvelles cartes par jour<input type="number" min="0" max="100" inputmode="numeric" data-set="nouvellesParJour" value="${s.nouvellesParJour}"></label>
    <label>Mémoire visée (rétention)<select data-set="retention">${[0.85, 0.9, 0.95].map((r) => `<option value="${r}"${s.retention === r ? ' selected' : ''}>${Math.round(r * 100)} %${r === 0.9 ? ' (recommandé)' : ''}</option>`).join('')}</select></label>
    <p class="muted small">Plus la valeur est haute, plus les cartes reviennent souvent.</p>
    <label>Thème<select data-set="theme">${opt('auto', 'Automatique')}${opt('clair', 'Clair')}${opt('sombre', 'Sombre')}</select></label>
    <h2>Compte</h2><p>${user ? `Connecté : ${esc(user)}` : 'Mode local (aucun compte).'} · ${SYNC_LABELS[state.sync][1]}</p>
    ${firebaseConfigured && user ? '<button class="btn" data-act="logout">Se déconnecter</button>' : ''}
    <h2>Sauvegarde</h2><p class="muted small">Facultatif : la synchronisation est automatique. Ce fichier est une copie de secours.</p>
    <button class="btn" data-act="backup">Télécharger une sauvegarde (JSON)</button>
    <p class="muted small">Jeu de départ : version ${store.seed.version} (${store.seed.cartes.length} cartes).</p>`;
}

function backup() {
  const data = JSON.stringify({ exporte_le: new Date().toISOString(), cartes: state.cards, reglages: state.settings, stats: state.stats }, null, 1);
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([data], { type: 'application/json' }));
  a.download = `cafep-sauvegarde-${dayKey()}.json`; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}

/* ---------- Événements ---------- */
async function onClick(ev: Event) {
  const t = (ev.target as HTMLElement).closest<HTMLElement>('[data-act]');
  if (!t) return;
  const id = t.dataset.id!;
  switch (t.dataset.act) {
    case 'show': if (sess) { sess.shown = true; render(false); } break;
    case 'rate': await rate(Number(t.dataset.r) as Rating); break;
    case 'verif': await store.toggleVerif(id); render(false); break;
    case 'restore': await store.restoreCard(id); toast('Carte restaurée.'); break;
    case 'del':
      if (await confirmDialog('Supprimer cette carte ? Sa progression sera perdue.', 'Supprimer')) {
        await store.deleteCard(id); location.hash = '#/biblio';
        toast('Carte supprimée.', { label: 'Annuler', fn: () => store.restoreCard(id) }, 7000);
      }
      break;
    case 'addsrc': $('#srcs')!.insertAdjacentHTML('beforeend', sourceRow()); break;
    case 'rmsrc': t.closest('fieldset')!.remove(); break;
    case 'backup': backup(); break;
    case 'logout': await authApi.logout(); break;
  }
}
function onSubmit(ev: Event) {
  const f = ev.target as HTMLFormElement;
  if (f.id === 'ef') { ev.preventDefault(); submitEdition(f); }
}
function onInput(ev: Event) {
  const t = ev.target as HTMLInputElement | HTMLSelectElement;
  if (t.id === 'q') { filt.q = t.value; drawList(); }
  else if (t.dataset.f) { (filt as Record<string, string>)[t.dataset.f] = t.value; drawList(); }
  else if (t.dataset.set) {
    const k = t.dataset.set;
    let v: string | number = t.value;
    if (k === 'nouvellesParJour') { v = Math.max(0, Math.min(100, Math.floor(Number(v) || 0))); }
    if (k === 'retention') v = Number(v);
    store.setSettings({ [k]: v } as Partial<typeof DEFAULT_SETTINGS>);
  }
}
function onKey(ev: KeyboardEvent) {
  if (parse().name !== 'reviser' || !sess || (ev.target as HTMLElement).closest('input,textarea,select,dialog')) return;
  if (!sess.shown && (ev.key === ' ' || ev.key === 'Enter')) { ev.preventDefault(); sess.shown = true; render(false); }
  else if (sess.shown && ['1', '2', '3', '4'].includes(ev.key)) rate(Number(ev.key) as Rating);
}
