# Demande Claude Design — 0.7.20 : retirer les chaînes de l'import PNG

Lot lt-atelier [#454](https://gitlab.laneuville.me/rom1/tatami/-/issues/454) (revue de nettoyage de l'écran). **Un
point, rien d'autre.** Ce fichier ne livre aucun écran, aucun CSS app, aucune édition de `ui/`.

## Pourquoi

L'import manuel d'un PNG dans une taille n'existe plus depuis la calibration 100 % capture : l'app retire la chaîne
`importShot` / `importShotCropped` de ses trois couches IPC (décision de Romain du 24/09, G1 sur #454), et le moteur
retire la commande `import_shot` au lot #455. Cinq clés de `RoomProfileStrings` ne sont plus lues par aucun composant
du DS ni de l'app.

## Attendu

Dans `screens/i18n.ts`, retirer de l'interface `RoomProfileStrings` et de ses deux locales (`en`, `fr`) :
`importPng`, `cropOffer`, `cropText`, `cropUse`, `discard`. Rien d'autre ne bouge : aucune autre clé, aucun composant.

## Avant d'exporter

Depuis la racine du workspace DS : `tsc` vert ; lint avec le `lint-bundle/` à jour (`npm install`, `npm run fix`,
puis `npm run check`, qui doit rendre **0**) ; react-doctor à **zéro** diagnostic, erreurs et warnings. Déclarez le
point dans `parity.declaredChanges` (aucun changement de pixel attendu).
