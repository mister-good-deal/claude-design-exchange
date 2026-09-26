# Demande Claude Design — 0.7.21 : « Mesurer » compte comme le dry-run

Issue d'origine : [#478](https://gitlab.laneuville.me/rom1/tatami/-/issues/478). Écrivain exchange : lt-atelier. Ce
fichier appartient à la MR du lot ; il ne livre aucun écran, aucun CSS app, aucune édition de `ui/`.

## Ce que le moteur change

« Mesurer sur les captures étiquetées » (station 5) juge désormais par la fonction du dry-run (station 6) : chaque vérité
de montant est relue au modèle de la room privé des gabarits de sa propre prise, sous la chaîne réglée à l'atelier. Les
deux stations comptent pareil. Avant, « Mesurer » lisait le modèle entier et s'auto-vérifiait (25/09 : 45 · 0 · 0 à
1048×720 quand le dry-run nommait le pot de la main 53 lu « 15,8BB »).

- `NumberTallyDto` (par zone) gagne `alone` : les vérités dont un code n'a de gabarit que dans leur prise,
  invérifiables — un **quatrième compte, à part** des justes, fausses et abstentions, hors de la barre ; et
  `wrongReads` : chaque fausse nommée, le texte même du dry-run (« capture « #53 · … » : lu 15,8BB, attendu 15,3BB »).
- `NumberMeasureDto` gagne `abstention` (`string | null`) : pourquoi la taille ne juge pas encore ses montants (« référence
  1572 × 1080 : ✓ attendu sur pot »), le motif que le dry-run met sur chacune de ses zones. Les comptes sont alors à 0.

Côté DS, le type `NumberMeasure` (`RoomProfile.fixtures.ts`) gagne `abstention: string | null` ; chaque entrée de
`perZone` gagne `alone: number` et `wrongReads: string[]` ; le total n'en porte aucun.

## Ce qui est attendu de l'écran

Station 5, compteur de « Mesurer » (`NumberCounter`) :

1. Sous le compte d'une zone, la liste de ses `wrongReads`, une ligne par capture — Romain n'a pas pu retrouver la fausse
   du pot à 1048×720 depuis l'écran.
2. Le compte des « seules » quand `alone > 0` : « N vérité(s) sans autre gabarit que ceux de leur prise ».
3. `abstention` non nul : le motif à la place des comptes, jamais « 0 · 0 · 0 » muet.
4. Une ligne qui dit ce que « Mesurer » compte : « prise exclue, comme la validation (station 6) ».
