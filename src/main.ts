import './style.css';
import { registerSW } from 'virtual:pwa-register';
import { authApi, firebaseBackend, firebaseConfigured } from './backend/firebase';
import { localBackend } from './backend/local';
import { start, stop, state, subscribe } from './store';
import { mountApp, renderLogin, applyTheme } from './app';

registerSW({ immediate: true });
applyTheme();

if (!firebaseConfigured) {
  start(localBackend());
  mountApp({ user: null });
} else {
  let started = '';
  authApi.watch((u) => {
    if (!u) { started = ''; stop(); renderLogin(); return; }
    if (started === u.uid) return;
    started = u.uid;
    start(firebaseBackend(u.uid));
    mountApp({ user: u.email ?? u.displayName ?? 'Compte' });
  });
}
subscribe(() => applyTheme(state.settings.theme));
