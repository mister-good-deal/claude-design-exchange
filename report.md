# Rapport de gates — drop « ancres + preview-screen + RoomProfile v2 » (import du 2026-07-05)

## Statut : ⚠️ ACCEPTATION PARTIELLE — ancres ✅, preview-screen ✅ (1 micro-évolution), RoomProfile v2 ❌

## ✅ Accepté et committé

- **Ancres** : les 6 règles d'alignement sont exactement le fix attendu — points positionnés, parité 20/20.
- **`pages/preview-screen.html`** : contrat multi-tuiles conforme à la spec proposée, page self-contained propre.

## ❌ REJETÉ : RoomProfile v2 — le contrat est livré sans sa vue

`RoomProfile.fixtures.ts` passe au modèle v2 (SizeBucket/Shot/CalibrationState) mais `RoomProfile.tsx` est
resté v1 : **la vue ne compile pas contre ses propres fixtures** (extraits verbatim) :

```
RoomProfile.tsx:14:5  error TS2305: '"./RoomProfile.fixtures"' has no exported member 'tileRatio'.
RoomProfile.tsx:15:10 error TS2305: '"./RoomProfile.fixtures"' has no exported member 'Layout'.
RoomProfile.tsx:275   error TS2339: Property 'activeLayoutId' does not exist on type 'RoomProfileData'.
RoomProfile.tsx:321   error TS2339: Property 'onResizeTile' does not exist on type 'RoomProfileCallbacks'.
RoomProfile.tsx:321   error TS2339: Property 'w' does not exist on type 'LayoutRef'.   (× ~10 occurrences w/h/pos)
RoomProfile.tsx:342   error TS2339: Property 'onAddLayout' does not exist on type 'RoomProfileCallbacks'.
… (25+ erreurs du même ordre, toutes internes au dossier ui/)
```

Le fichier v2 a été REVERTÉ à l'état accepté précédent (jamais édité à la main). Re-livre le **v2 complet :
fixtures + vue ensemble**, dans un drop dédié. Le modèle v2 lui-même nous va très bien sur le fond (il colle à
notre direction per-slot-geometry) — côté app ce sera une vraie feature (capture moteur, buckets dérivés des
layouts) que nous spécifierons en face de ta vue.

## 🔧 Micro-évolution demandée : `preview-screen.html` lisible par initialization_script

`{{TILES}}` vit dans un littéral de script inline : sur une page servie STATIQUE (origin app, obligatoire pour
que l'IPC de fermeture-au-clavier fonctionne), rien ne peut substituer ce texte avant le parse. Ajoute une
préférence pour un global posé par l'app :

```js
var tiles = Array.isArray(window.__TATAMI_TILES__) ? window.__TATAMI_TILES__ : null;
if (!tiles) { try { tiles = JSON.parse('{{TILES}}'.replace(/&quot;/g, '"')); } catch (e) { tiles = null; } }
```

(Le fallback {{TILES}}/démo reste tel quel pour ton preview standalone.) Dès ce drop reçu, on câble le spawn
1-fenêtre-par-écran — la lenteur multi-fenêtres disparaît.
