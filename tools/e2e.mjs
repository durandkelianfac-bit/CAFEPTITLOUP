// Test de bout en bout (mode local) : node tools/e2e.mjs [url]
import { chromium } from 'playwright-core';
const url = process.argv[2] ?? 'http://localhost:4173/';
const shots = process.env.SHOTS;
const b = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium' });
const ctx = await b.newContext({ viewport: { width: 390, height: 780 }, hasTouch: true });
const p = await ctx.newPage();
const errs = []; p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
const ok = (c, m) => { if (!c) { console.error('ÉCHEC', m); process.exitCode = 1; } else console.log('ok', m); };
const snap = (n) => shots && p.screenshot({ path: `${shots}/${n}.png` });
await p.goto(url); await p.waitForSelector('.big-num');
ok(await p.textContent('.big-num') === '15', '15 nouvelles cartes par défaut'); await snap('accueil');
await p.click('#go'); await p.waitForSelector('.card.front'); await snap('question');
await p.click('#show'); await p.waitForSelector('.rates'); await snap('reponse');
ok(await p.locator('.rate').count() === 4, '4 boutons de notation');
await p.click('.rate.r3'); await p.waitForSelector('.card.front');
await p.click('#show'); await p.click('.rate.r1');            // échec : la carte doit revenir
await p.keyboard.press('Space'); await p.keyboard.press('3');   // raccourcis clavier
ok((await p.textContent('.muted.small.center')).includes('restante'), 'séance en cours');
await p.goto(url + '#/'); await p.waitForSelector('.big-num');
const st = await p.evaluate(() => JSON.parse(localStorage.getItem('cafep:stats')));
ok(Object.values(st.nouvelles)[0] === 3, 'nouvelles cartes comptées : ' + JSON.stringify(st.nouvelles));
// Bibliothèque, recherche, filtre
await p.goto(url + '#/biblio'); await p.waitForSelector('#liste li');
await p.fill('#q', 'caverne'); ok(await p.locator('#liste li').count() >= 1, 'recherche');  await snap('biblio');
await p.fill('#q', '');
// Création
await p.goto(url + '#/edition'); await p.fill('[name=question]', 'Question test ?'); await p.fill('[name=reponse]', 'Réponse test');
await p.fill('[name=s_ref]', 'Réf. test'); await p.click('text=Enregistrer'); await p.waitForSelector('.card.back');
ok((await p.textContent('.q')).includes('Question test'), 'carte créée');
// Vérification
await p.click('button.pill'); ok((await p.textContent('button.pill')).includes('Vérifié'), 'bascule vérifié');
// Suppression + annulation
await p.click('text=Supprimer'); await p.click('dialog button.danger'); await p.waitForSelector('.toast');
await p.click('.toast button'); await p.goto(url + '#/biblio'); await p.fill('#q', 'Question test');
ok(await p.locator('#liste li').count() === 1, 'suppression annulée');
// Modifier une carte de départ
await p.fill('#q', 'caverne'); await p.click('#liste a'); await p.click('text=Modifier');
await p.fill('[name=reponse]', 'Ma version'); await p.click('text=Enregistrer'); await p.waitForSelector('.card.back');
ok((await p.textContent('.answer')).includes('Ma version'), 'modification carte de départ');
// Suivi, réglages
await p.goto(url + '#/suivi'); await p.waitForSelector('.themes'); await snap('suivi');
await p.goto(url + '#/reglages'); await p.selectOption('[data-set=theme]', 'sombre'); await snap('reglages');
ok(await p.evaluate(() => document.documentElement.dataset.theme) === 'dark', 'thème sombre');
// Hors-ligne
await p.goto(url); await p.waitForTimeout(1500); await ctx.setOffline(true); await p.reload(); await p.waitForSelector('.big-num');
ok(true, 'rechargement hors-ligne'); await ctx.setOffline(false);
ok(errs.length === 0, 'aucune erreur console ' + errs.join('|'));
await b.close();
