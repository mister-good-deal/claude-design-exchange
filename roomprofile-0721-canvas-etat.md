# Demande Claude Design — vague 0.8 : le canvas ne choisit jamais l'état d'une zone

Issue d'origine : [#468](https://gitlab.laneuville.me/rom1/tatami/-/issues/468) (relecture de la 0.7.20).
Écrivain exchange : lt-atelier. **Un point, rien d'autre.** Ce fichier ne livre aucun écran, aucun CSS app, aucune
édition de `ui/`. Publiée le 2026-09-29 dans la vague 0.8.1, sur l'accord de Romain :
`roomprofile-0721-canvas-etat.md` sur l'exchange.

## Pourquoi

Après une « Nouvelle géométrie », une taille garde ses anciens rectangles comme repères non validés : ils sont posés,
sans état. `CalibrationCanvas` lisait `data.zoneStates?.[zoneId] ?? "adjusted"` : une zone sans état y était dessinée
**validée**, pendant que le rail et la barre, qui lisent le verdict servi, proposaient « Revalider ». Décider qu'une zone
sans état est validée est une règle de domaine, qui n'a pas sa place dans le design system.

Depuis #468, l'app donne un état à chaque zone qu'elle pose (`projected` pour une zone sans état) : le repli n'est plus
jamais pris.

## Attendu

- `CalibrationCanvas` lit `data.zoneStates[zoneId]` sans repli : l'app fournit l'état de chaque zone rendue.
- Si le contrat l'exige, `zoneStates` devient un `Record<string, ZoneState>` complet pour les zones de `pos`, documenté
  comme tel dans le contrat du canvas.

Rien d'autre ne bouge : aucun pixel quand l'état est fourni.

## Avant d'exporter

Depuis la racine du workspace DS : `tsc` vert ; lint avec le `lint-bundle/` à jour (`npm install`, `npm run fix`,
puis `npm run check`, qui doit rendre **0**) ; react-doctor à **zéro** diagnostic, erreurs et warnings. Déclarez le
point dans `parity.declaredChanges`.
