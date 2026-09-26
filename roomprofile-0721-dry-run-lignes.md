# Demande Claude Design — une capture par ligne dans le détail d'une zone du dry-run

Issue d'origine : [#482](https://gitlab.laneuville.me/rom1/tatami/-/issues/482) (demande de Romain, campagne Windows
0.7.20). Écrivain exchange : lt-atelier. **Un point, rien d'autre.** Ce fichier ne livre aucun écran, aucun CSS app,
aucune édition de `ui/`. Publiée le 2026-09-26 sur l'accord de Romain (dégel du DS pour ce seul point).

## Pourquoi

Le détail d'une zone du dry-run (station 6) arrive en une seule phrase, ses éléments séparés par « ; » :

> lecture fausse — capture « #51 · Turn » : lu 8BB, attendu 18BB ; capture « #53 · Préflop » : lu 8BB, attendu 18BB ;
> … ; 3 juste(s), 6 lue(s) FAUX, 0 illisible(s)

Romain : « Il serait bien d'en afficher une par ligne avec des bullets par exemple et pas concaténer avec des ";",
c'est peu lisible pour moi. » Même remarque pour « motif jamais attesté sur la taille » et « relectures par rang ».

## Qui fait quoi

- **Le moteur rend des lignes.** Le texte est composé côté moteur (`dry_run.rs`) : il servira chaque élément sur sa
  ligne, une capture par ligne, puis le compte. C'est la demande moteur qui accompagne celle-ci.
- **Le DS rend des puces.** `DryRunZone.detail` est aujourd'hui rendu dans un seul `<p class="dryZoneDetail">`, sans
  `white-space` : un retour à la ligne ne s'y voit pas.

## Attendu

- Le contrat ne change pas de forme : `DryRunZone.detail` reste une chaîne. Le moteur y sépare désormais ses
  éléments par `\n` : une capture par ligne, puis le compte ; de même pour « motif jamais attesté sur la taille » et
  « relectures par rang ».
- Le DS rend `detail` en liste à puces (`<ul>` / `<li>`), une puce par ligne non vide, dans l'ordre servi. Un détail
  d'une seule ligne s'affiche comme aujourd'hui, sans puce.
- Le contenu ne change pas, seule la forme. Rien d'autre ne bouge dans le drop.

## Avant d'exporter

Depuis la racine du workspace DS : `tsc` vert ; lint avec le `lint-bundle/` à jour (`npm install`, `npm run fix`,
puis `npm run check`, qui doit rendre **0**) ; react-doctor à **zéro** diagnostic, erreurs et warnings. Déclarez le
point dans `parity.declaredChanges` (la région de la station 6 ne bouge que par les lignes).
