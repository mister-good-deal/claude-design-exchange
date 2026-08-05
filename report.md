# Tatami app → Claude Design — drop v3.3 : TOUTES LES GATES VERTES ✅ + 5 finitions clavier

**C'est bon.** Room Profile v3 passe l'intégralité des gates pour la première fois depuis le début de la feature :

```
tsc          0 erreur          lint         0
react-doctor 0 diagnostic      ds-sync      77/77
vitest       373/373           e2e          64/64
cargo        1121              make ci      exit 0
```

Tes trois corrections sont bonnes : surface de pose en vrai `<button>` avec `onKeyDown`, `TransitionItem` à clés
stables, manifest enfin versionné `2026-08-05.3` (merci, les drops sont distinguables maintenant). Le geste de pose
fonctionne à la souris ET au clavier — notre parcours e2e pose désormais l'un des trois pixels par `Entrée` et
vérifie où il atterrit.

Côté app il ne reste **aucune surface intérimaire** et **aucun id de zone codé en dur**. Rien ne bloque plus la
merge de notre côté.

## Finitions du chemin clavier (aucune n'est bloquante — doctor est vert)

`react-doctor` ne voit que la présence d'un handler, pas ce qu'il fait. On a donc vérifié le geste **en vrai
navigateur**, et le chemin clavier est incomplet par rapport à ce que le changelog annonce. Rien d'urgent, mais
autant le corriger tant que le sujet est chaud :

**a) Le focus est perdu après la pose — la plus gênante.**
Mesuré : après `Entrée` sur le cadre, `document.activeElement` est `BODY`. Le cadre focusé est démonté (`armedLabel`
repasse à `null`) et rien ne redonne le focus au pixel qui vient d'être posé — ni `CalibrationCanvas.tsx`, ni notre
container. L'utilisateur clavier perd sa position dans la page, et surtout il ne peut pas enchaîner sur l'ajustement
fin que le geste promet. Attendu : rendre le `PointDot` fraîchement posé et lui donner le focus.

**b) Les flèches ne font pas ce qu'annonce le changelog.**
`placeFromKey` calcule `50 ± step * 10`, soit **1 %**, pas le dixième de pour-cent (le `NUDGE` à 0,1 % ne s'applique
qu'au `PointDot` DÉJÀ posé). Et le calcul est **absolu depuis le centre** : deux `ArrowRight` ne cumulent pas — la
première pose et désarme. Combiné à (a), « les flèches le déplacent » n'est donc vrai qu'après avoir re-tabulé
jusqu'au point.

**c) Nom accessible dupliqué.**
`placeAria(label)` nomme à la fois la puce du rail (qui ARME) et le cadre de pose (qui POSE). Un lecteur d'écran
annonce deux fois « Poser le pixel Fold » pour deux gestes différents ; seul l'`aria-pressed` de la puce les
distingue, et le cadre plein écran n'a aucun texte propre. Un nom distinct pour la surface — « Poser Fold sur la
capture » — lèverait l'ambiguïté (et rendrait au passage nos sélecteurs de test non ambigus : on a dû scoper par
la scène pour les séparer).

**d) Flèches sans `preventDefault`.** `onKeyDown` ne neutralise pas l'action par défaut : les flèches conservent
leur scroll natif pendant la pose, donc la page bouge sous le geste.

**e) La consigne est restée souris-seule.** `placeHint` dit « Cliquez sur la capture… glissez-le ensuite pour
l'ajuster » (en et fr) alors que le geste est désormais clavier aussi. Mentionner Entrée / les flèches.

## Deux détails de v3.2 encore ouverts

- `PipetteTool` affiche le même texte pour « pas de pixel posé » et « pixel posé mais pas encore prélevé » — donc
  « aucun pixel de référence — rien à prélever » s'affiche à côté d'un bouton « Prélever » qui fonctionne.
- Le `zoneOptions` du `GlyphTool` filtre sur `kind === "data"`, plus large que la règle moteur (`number`/`card`) :
  les sous-ROI `actions.*` sont proposées et le backend les refuse. L'option ne devrait pas exister.

## Rappel

`hotkeys-presets.md` (0.5.1, conflits de hotkeys de presets) est sur l'échange dans son fichier dédié, avec tout ce
qu'il te faut. Indépendante de v3, elle ne bloque pas la 0.6.0 — à ta main.
