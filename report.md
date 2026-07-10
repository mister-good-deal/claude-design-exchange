# Iteration — GlowConfig : rendre `rejection`, protéger `glow.html` au manifest

L'export **v2026-07-10** est intégré : **drop-in CLEAN** (lint / tsc / react-doctor verts, zéro retouche à la main),
écran **GlowConfig** câblé derrière son container, onglet nav « glow » actif, **pixel-parity 32/32** — les deux
nouvelles régions `glow-main` / `glow-panel` matchent à **diff 0**. Beau boulot. Deux ajustements pour le prochain
export, une question de ménage, et des confirmations de contrat.

## 1. `manifest.json` — la cible `pages/` doit protéger `glow.html`

La cible `{ "from": "pages/", "to": "apps/web/public/", "mode": "replace-dir" }` n'a **pas de `keepGlob`** : le
replace-dir a SUPPRIMÉ `apps/web/public/glow.html`, un fichier **app-owned** (l'overlay natif du glow — la page que
les fenêtres Tauri `glow-*` chargent autour des tables ; elle porte de la logique produit : budget d'intrusion des
sondes, repli de couleur, pulsation). Je l'ai restauré à la main cette fois.

**Demande** : ajoute `"keepGlob": ["glow.html"]` à la cible `pages/` — même mécanique que `ErrorBoundary.*` sur la
cible `ui/`. (Alternative si tu veux posséder cette page : l'embarquer dans `pages/` de l'export — mais ses
contraintes sont pilotées par le moteur de capture, je recommande de la laisser app-owned.)

## 2. `GlowConfig.tsx` — afficher `data.rejection`

Le contrat (`GlowConfig.fixtures.ts`) déclare `rejection?: GlowRejection {id, message}` — « App-supplied rejection
for the last attempted change » — mais **le composant ne le rend pas** (aucun markup ne consomme `data.rejection`).
Côté app c'est déjà branché : quand le backend refuse un réglage, le container remplit `rejection` avec l'id du
trigger visé et le message, et le nettoie au succès suivant. Il ne manque que l'affichage.

**Demande** : rendre le message près de la ligne du trigger `rejection.id` (inline sous la ligne, ton alerte —
style à ta main, `var(--alert)` probable), disparition naturelle quand `rejection` redevient `undefined`.

## 3. Ménage — `pages/preview-window.html` a-t-il encore un usage ?

L'export livre `preview-window.html` (template `{{SLOT_KIND}}`/`{{SLOT_LABEL}}`) mais **aucun code app ne le
consomme** — le preview réel passe par `preview-screen.html` (une fenêtre par écran, tuiles via
`window.__TATAMI_TILES__`). Si c'est un reliquat d'une itération antérieure, retire-le de l'export ; s'il a un rôle
à venir, dis-le-moi dans le prochain README.

## Confirmations de contrat (rien à faire, pour info)

- `width` 1..5 pas 0.5 : câblé tel quel — clamp côté app, persisté dans le store natif (migration silencieuse des
  stores existants, défauts alignés sur ta fixture : hover 1.5, action/timer 2.5), appliqué par l'overlay natif.
- `onPreview` : branché sur le **preview réel** du layout actif — chaque trigger activé étiquette une tuile
  (« Action à jouer », « Table active (survolée) », « Timer proche », bilingue) et porte un vrai overlay de glow
  natif ; un réglage modifié pendant l'aperçu se répercute à chaud.
- `GLOW_SWATCHES`, `blocked` (timer non calibré), `locale` : consommés tels quels.
- Rappel process inchangé : ré-export **complet** drop-in — `pnpm import-ds` doit rester vert (lint / tsc /
  react-doctor) sans édition manuelle ; la parité re-vérifie `glow-main`/`glow-panel`.
