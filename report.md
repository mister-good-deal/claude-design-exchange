# Itération — aperçu responsive : les petites tuiles tronquent leur texte (2026-07-16)

Constat (branch app `responsive-preview`) : dès que les cellules d'aperçu deviennent petites — grille dense (Perso
jusqu'à 12×12), zone de layout réduite (plancher 320 px), multi-écrans — leur texte à tailles fixes déborde et se fait
couper par l'`overflow: hidden` des tuiles. Les deux surfaces d'aperçu sont touchées : ta simulation in-view
(l'overlay LivePreview de `LayoutDesigner`, contrat §3) et la page des fenêtres d'aperçu réelles
(`preview-screen.html`). Le correctif app-side est fait et vérifié (Playwright chromium, 4 paliers de taille de
960×540 à 54×54 : aucun débordement, captures validées). **Le premier fichier est à toi — il faut l'adopter à la
source, sinon ton prochain export régresse le fix.**

## 1. `ui/screens/LayoutDesigner.module.css` — à reprendre dans le prochain export (DS-owned)

Le fichier est sous `replace-dir` + gate `check:ds-sync` : la modif app-side ci-dessous est temporaire par
construction. **Demande** : embarque ces règles telles quelles (ou réécris-les à ta main, mêmes seuils). Principe :
chaque tuile d'aperçu devient un container de taille, le texte de maquette scale en `cqi`, et le chrome décoratif se
déleste par paliers plutôt que de se faire tronquer.

```css
.previewWin {
    /* … règles existantes inchangées … */
    /* Size container: the grid tracks (1fr) fully define the tile, so inner text can scale with cqi
     * and decorative chrome can be shed via @container as the tile shrinks. */
    container: preview-win / size;
}
```

Tailles fluides (valeurs d'origine = la borne max des clamp) :

```css
.winTitleType { font-size: clamp(6px, 7cqi, 8px); }                        /* était 8px */
.winTurn      { font-size: clamp(6px, 5cqi, 8px); white-space: nowrap; }   /* était 8px */
.winAction    { padding: 1px clamp(2px, 1.5cqi, 5px);                      /* était 1px 5px */
                font-size: clamp(5px, 4.5cqi, 7px); white-space: nowrap; } /* était 7px */
```

Le feutre respecte le plancher 16 px de la barre de titre (sur tuile courte, `height: 15%` + `min-height: 16px`
faisaient chevaucher le titre par le feutre) :

```css
.winFeltReserved,
.winFelt { inset: max(15%, 16px) 0 0 0; }                                  /* était 15% 0 0 0 */
```

Délestage par paliers (nouveau bloc, après les règles `.winAction`) :

```css
/* Shed decorative chrome as the tile shrinks — mockup text must never clip against the tile edges. */
@container preview-win (width < 120px) or (height < 96px) {
    .winActions {
        display: none;
    }
}
@container preview-win (width < 88px) or (height < 72px) {
    .winTurn {
        display: none;
    }
}
@container preview-win (width < 64px) {
    .winTitleType {
        display: none;
    }
}
```

Le badge numéro (`.winNum`) ne se déleste jamais : c'est l'identité de la table, il reste lisible au dernier palier.

**Invariants parité — rien ne bouge à la taille maquette.** À la baseline 1320×780 sur les fixtures showcase, tous
les `clamp()` résolvent à tes valeurs d'origine et aucun `@container` ne matche : le rendu est strictement identique,
zéro drift pixel-parity. `container: preview-win / size` est sûr ici : la taille des tuiles est entièrement définie
par les tracks `1fr` de `.tileGrid`, jamais par leur contenu. Supports : webkit2gtk / Safari 16+ (mêmes prérequis que
les `cqh` que tu utilises déjà dans `.letterbox`).

## 2. Pour info — `apps/web/public/preview-screen.html` (app-owned aujourd'hui, même philosophie)

La page servie dans les fenêtres d'aperçu réelles (une par écran) a reçu le même traitement, côté app :

- `.tile { padding: min(1.6cqmin, 4%); }` — le `cqmin` s'y résout contre le viewport (pas de conteneur ancêtre) :
  respiration à l'échelle du moniteur, désormais bornée à 4 % de la tuile pour que les petites cellules ne perdent
  pas toute leur surface en padding.
- `.label { font-size: clamp(12px, 28cqmin, 200px); overflow-wrap: break-word; }` — plancher 20 px → 12 px, et
  `break-word` au lieu d'`anywhere` : `anywhere` marque chaque caractère comme point de coupe, ce qui laissait
  `text-wrap: balance` éclater « Table 12 » en lignes de 2 caractères dans les cellules minuscules.
- Délestage en fin de feuille (seuils CONTENT-box, padding exclu ; en fin de feuille pour que les `display: none`
  gagnent à spécificité égale) :

```css
@container (width < 185px) or (height < 105px) {
    .sub { display: none; }
}
@container (width < 110px) or (height < 60px) {
    .kind, .brand { display: none; }
}
```

Cette page n'est pas dans `.ds-sync.json`, donc pas d'action requise — MAIS si un futur export livre
`pages/preview-screen.html` (rail merge-dir du contrat §2), il devra inclure ces règles : un drop same-name
écraserait le fix. Au passage, le contrat §1 cite encore `preview-window.html` comme livrable pages/ « today » —
si tu reprends la page v2 (`preview-screen.html`) à ton compte, dis-le explicitement et on alignera le contrat.

## Barème de délestage (récap des deux surfaces)

| Surface                | Palier (largeur × hauteur) | Ce qui disparaît                        |
| ---------------------- | -------------------------- | --------------------------------------- |
| LivePreview (overlay)  | tuile < 120×96             | boutons Fold / Call / Raise             |
|                        | tuile < 88×72              | badge « À vous »                        |
|                        | tuile < 64 de large        | texte du titre (icône + numéro restent) |
| preview-screen (pages) | contenu < 185×105          | phrase explicative `.sub`               |
|                        | contenu < 110×60           | badge kind + marque TATAMI (label reste) |

Rappel process inchangé : ré-export **complet** drop-in — `pnpm import-ds` doit rester vert (lint / tsc /
react-doctor) sans édition manuelle.

---

# (Toujours ouverte — 2026-07-10) Itération — l'export de l'écran Overlay est en retard sur le workspace

Constat d'intégration (feature 018, après l'import du re-export v2026-07-10) : Romain compare l'app à ta maquette
`ui_kits/tatami/Overlay.jsx` et l'app ne correspond pas — normal, **l'export livre un `ui/screens/Overlay.tsx`
ancien** (inchangé depuis l'itération 017). Deux écarts + une ambiguïté à trancher.

## 1. La preview « Overlay on table » doit être EN HAUT

Ta maquette place le panneau Preview **en tête de page, pleine largeur** (`order: -1`, commentaire « live preview —
on top, full width, keeps the table-window aspect ratio »), avec la grille de config (HUD stats / Color tags /
Player notes) en dessous. L'export, lui, rend la preview **en dernier** (markup final, aucun réordonnancement dans
`Overlay.module.css`). Côté app je ne peux pas réordonner un écran DS-owned (contrat : zéro CSS app sur `ui/`).

**Demande** : ré-exporter `Overlay.tsx`/`Overlay.module.css` alignés sur la maquette — preview en premier
visuellement (ordre DOM ou `order`, à ta main dans le set CSS-modules), pleine largeur, ratio 16/9 conservé.

## 2. Ambiguïté : le glow config est en double — tranche pour UNE source

- Ta maquette Overlay **embarque** une section « window glow — states + config » (`{GlowConfig && <GlowConfig />}`).
- Ton export donne au GlowConfig **son propre écran** + l'entrée nav « glow » (icône focus) — et c'est CE contrat que
  l'app a câblé (container, clamp width, bouton Preview branché sur le preview réel du layout actif, parité
  `glow-main`/`glow-panel` verte).

Les deux à la fois = la même config à deux endroits. **Demande** : choisis UN emplacement dans le prochain export.
Recommandation : garder l'écran dédié (déjà câblé et navigable) et sortir la section embarquée de l'Overlay — le
prop/slot `glow` de l'écran Overlay peut alors disparaître du contrat (l'app n'injecte plus rien dedans depuis
aujourd'hui). Si tu préfères l'inverse (section dans Overlay, plus d'écran dédié), dis-le explicitement dans le
README de l'export : l'app re-câblera.

## Pour info côté app (déjà fait)

Le panneau glow legacy que l'app injectait encore dans le slot `glow` de l'Overlay est retiré (il datait d'avant
l'écran GlowConfig et poussait la preview encore plus bas). L'app est désormais l'image exacte de ton export
courant ; l'écart restant avec ta maquette (preview en bas, pas de section glow) se résorbe à ton ré-export. Les
régions pixel-parity de l'écran Overlay seront re-mesurées à l'import (le réordonnancement va les déplacer — c'est
attendu, pas un blocage).

Rappel process inchangé : ré-export **complet** drop-in — `pnpm import-ds` doit rester vert (lint / tsc /
react-doctor) sans édition manuelle.
