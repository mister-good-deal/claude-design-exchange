# Rapport — retours terrain + 1 gap CSS + 1 évolution de page (2026-07-05)

## Statut : itération demandée — 2 sujets pour toi

## 1 — GAP CSS : les points des grilles d'ancrage ne se positionnent pas (export incomplet)

Sur les AnchorGrid (« Screens » zone placement + « Forced ratio »), les points devraient se placer à leur
position (top-left en haut à gauche, etc.) comme sur ton prototype live. L'export ne contient PAS les règles
d'alignement : `.anchorBtn` est `display: flex` et pose `data-av`/`data-ah`, mais aucune règle
`.anchorBtn[data-av=…]`/`[data-ah=…]` n'existe dans le module.css livré → tous les points rendent en
haut-gauche (flex par défaut). Il manque ~6 lignes du type :

```css
.anchorBtn[data-av="t"] { align-items: flex-start; }
.anchorBtn[data-av="c"] { align-items: center; }
.anchorBtn[data-av="b"] { align-items: flex-end; }
.anchorBtn[data-ah="l"] { justify-content: flex-start; }
.anchorBtn[data-ah="c"] { justify-content: center; }
.anchorBtn[data-ah="r"] { justify-content: flex-end; }
```

(Notre pixel-parity n'a rien vu : le baseline standalone partage le même CSS exporté — les deux côtés étaient
faux à l'identique. C'est un écart export ↔ ton environnement de design, pas un écart moteur.)

## 2 — ÉVOLUTION : page de preview PAR ÉCRAN (perf réelle mesurée à l'usage)

Retour terrain : avec beaucoup de tuiles, la preview met plusieurs secondes à s'afficher. Cause côté moteur :
chaque fenêtre de preview est un webview séparé — sur Linux, webkit2gtk lance UN processus moteur complet par
webview, séquentiellement (~150-400 ms chacun) ; 12 tuiles = 12 processus. (Windows/WebView2 mutualise
davantage, mais N fenêtres restent N créations.)

Le vrai correctif : **une seule fenêtre par ÉCRAN** qui dessine toutes les tuiles de cet écran. Livrable :
une page `pages/preview-screen.html` qui rend un ensemble de tuiles à des rects fractionnaires. Contrat
proposé (l'app injecte via initialization_script, comme aujourd'hui) :

- Placeholder `{{TILES}}` remplacé par un JSON `[{ label, kind, rect: [x0,y0,x1,y1] }]` (fractions de la
  fenêtre) — un petit script inline de la page pose chaque tuile en `position:absolute` aux pourcentages.
- Chaque tuile garde le langage actuel de `preview-window.html` (légende, type, liseré, hint « Appuyez sur une
  touche pour quitter » une seule fois par écran, en overlay global).
- La page reste 100 % self-contained (CSS/JS inline, aucun asset externe).

`preview-window.html` (mono-tuile) peut rester pour le cas 1 tuile si tu préfères, ou disparaître — ton choix.
On câblera le spawn par écran dès la page livrée : 1-3 webviews au lieu de N, apparition quasi instantanée.

## Pour info (déjà réglé côté app)

- Les tables d'observation prennent désormais le forcedRatio en preview (comme les fenêtres de jeu) ; lobby et
  replayer restent plein-cadre.
- Drop « optims UI » précédent toujours ACCEPTÉ — monOrder/onReorderMons câblés, parité 20/20.
