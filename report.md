# Tatami app → Claude Design — verdict du drop 2026-08-25

**VERT. Drop-in clean, zéro retouche.** `pnpm import-ds` a passé la normalisation @stylistic puis les trois portes
sémantiques : ESLint, `tsc` strict (`exactOptionalPropertyTypes`), react-doctor `--project web --no-telemetry`
→ **0 diagnostic**. Les 419 tests unitaires de l'app passent, dont deux nouveaux qui exercent votre bascule.

Le drop répond exactement aux deux demandes (`station5-vues-barre-et-zoom.md`, `station5-clic-a-blanc.md`) et il
est **chirurgical** : cinq fichiers bougent réellement (`ColorSurface`, `PipetteTool`, `RoomProfile.fixtures`,
`RoomProfile.module.css`, `i18n`) ; tout le reste de l'archive n'était que du dialecte de formateur, ramené à
l'identique par le `lint:fix` post-sync. C'est exactement le contrat §5 qui fonctionne.

## Ce que l'app a câblé de son côté

Une ligne. La sonde **nomme** le sous-ROI de son bouton — `probe.<variant>.<action>` →
`actions.<variant>.<action>` — et c'est le bucket qui décide s'il est calibré.

**Nous ne remplissons PAS `Probe.targetRect` ni `SuitSwatch.targetRect`, et ce n'est pas un oubli.** L'app n'a
aucune boîte à déclarer : la seule géométrie qu'elle connaît est celle du bucket. Fabriquer un rect de repli
violerait l'invariant d'honnêteté du rail de mesure (une sonde non posée sort sans coordonnée, jamais avec une
coordonnée inventée). Votre troisième état — « ce bucket n'a pas calibré la ROI propre de ce bouton » — est donc
celui que verra tout profil non migré, et c'est le bon. La branche `zoomDeclared` reste sans emprunteur côté app ;
gardez-la si un autre appelant la justifie, mais sachez qu'elle n'est pas exercée.

Vérifié sur le terrain plutôt que supposé : un profil Windows migré (campagne du 2026-08-21) porte
`actions.<variant>.<sub_roi>` pour **chaque** sonde. La bascule sera donc armée en vrai, pas seulement en fixture.

## Deux points de forme, aucun bloquant

1. **`ColorSurface.tsx` — un commentaire collé à sa fonction.** Après import, la ligne 55 est
   `/** The crop the frame shows… */function cropOf(zone, ring, view) {` : le bloc de doc et le `function` sur la
   même ligne. Aucune règle ne tire dessus (bloc mono-ligne), donc la porte reste verte, mais c'est illisible et
   `lint:fix` ne le sépare pas. Un saut de ligne à la source suffit.

2. **`viewNoZoom` parle du « bouton » sur une ligne d'enseigne.** Le libellé est « ce bucket n'a pas calibré la ROI
   propre de ce **bouton** » ; sur une cible `suit` (dont le chip dit « Enseigne visée ») le mot tombe à côté. Vous
   conjuguez déjà `viewButton` / `viewSuit` : le motif dégradé mérite la même paire.

## Ce qui reste ouvert, et qui n'est pas de vous

`pixel-parity` sort la région `rooms-requirements` à 0,51 % pour une limite de 0,40 %. **Pré-existant** : vérifié en
remisant tout le drop et en reconstruisant la baseline sur l'arbre d'avant — même 0,51 %. Très probablement du
rendu de police local contre le Chromium du runner. Rien à corriger chez vous ; nous tranchons sur le verdict CI.

## Les deux demandes restent-elles valides ?

`station5-clic-a-blanc.md` est **servi** : la ligne rend le verdict et le hint. Son point 4 (« nous n'avons PAS
demandé de bouton désarmé ») a été respecté à la lettre — merci de l'avoir lu.

`station5-vues-barre-et-zoom.md` est **servi au-delà** de ce qui était demandé : nous proposions le nom
`zoomZoneId`, vous l'avez pris ET ajouté le repli déclaré et les états dégradés nommés. Les deux fichiers peuvent
être archivés côté échange — le verdict terrain reste à rendre par Romain sur la prochaine campagne Windows.
