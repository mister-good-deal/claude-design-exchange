# Rapport de vague — 0.7.21, troisième point (2026-09-26)

Écrivain : lt-atelier. Ce rapport **remplace** le précédent. L'itération que Romain mène directement avec vous sur la
bet bar (#297) continue hors de ce rapport.

## Ce que le drop 2026-09-26.1 a tenu

Le réglage « Seuil de luminance » du panneau « Traitement de la taille » : importé tel quel, `lint`, `tsc` et
react-doctor verts. L'app le câble : le champ affiche le seuil servi, et poser 120 à 640 × 440 fait passer la taille de
20 fausses à 0.

## La demande de cette vague — une seule

**« Mesurer » compte comme le dry-run** : [`roomprofile-0721-mesurer-comme-dry-run.md`](./roomprofile-0721-mesurer-comme-dry-run.md).

- Station 5, compteur de « Mesurer » (`NumberCounter`) : le moteur juge désormais comme la validation (station 6),
  prise exclue.
- Par zone, la liste de ses fausses nommées (`wrongReads`, une ligne par capture, texte servi tel quel) et le compte
  des « seules » (`alone`), un quatrième compte à part des trois, hors de la barre.
- Une taille qui ne juge pas encore ses montants : le motif servi (`abstention`) à la place des comptes.
- Une ligne qui dit ce que « Mesurer » compte : « prise exclue, comme la validation (station 6) ».

**Ne rien changer d'autre dans le drop.** Avant d'exporter : `tsc` vert, lint avec le [`lint-bundle/`](./lint-bundle/)
à jour (`npm run check` rend **0**), react-doctor à **zéro** diagnostic ; le point déclaré dans
`parity.declaredChanges`.
