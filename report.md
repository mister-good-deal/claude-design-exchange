# Vague 0.7.3 — retours de la campagne Windows 0.7.1 : la station 3 n'atteste que l'écart, et quatre demandes courtes

**État** : le drop `2026-09-05` et son re-drop `.1` (vague 0.7.2) sont **importés** — MR d'import verte (lint, doctor,
tsc, 517 tests, e2e 74/74, parité pixel 28/28 sans re-baseline : le panneau retours de `Account` et `Activation`
n'ont pas bougé de région), câblage app livré (`feedback` + `onOpenFeedbackEmail`, `offerNote`, `cardRequired`,
notes de version dans les trois états). Vague 0.7.2 CLOSE, merci — export propre, rien à reprendre.

Cette vague vient de la campagne Windows 0.7.1 (les présences par empreinte tiennent ; c'est la SAISIE qui coûte).
Cinq demandes, chacune complète dans son fichier durable à la racine de l'exchange — lisez-les, `report.md` ne fait
que les résumer. Ordre de valeur : **1 d'abord**, puis 2, 3, 4, 5. Un seul drop pour les cinq est préférable ; deux
drops (1 seul, puis 2–5) sont acceptés si le 1 demande du temps.

## 1. Station 3 : une case = l'écart au cas normal, une entrée par siège — `roomprofile-073-attestation-par-siege.md`

Onze déclinaisons à cocher par capture, c'est trop, et les deux faces d'une famille rendent saisissable la
contradiction comme le silence. Trois règles fermes : **(a)** une famille binaire n'offre qu'UNE case, celle de
l'écart (« Héros couché », « Timer visible ») ; **(b)** non cochée = **attesté à l'état normal**, jamais « pas
d'information » (la dérivation leave-one-out a besoin des deux côtés) ; **(c)** « Non visible ici » (`absentZoneIds`)
reste le seul « je ne sais pas ». Deux formes servies par la donnée : `family: "deviation"` (case) et `"choice"`
(radiogroup sans normal : `actions`, `board`, `dealer`). Entrées « Table / Héros / Vilain 1 / Vilain 2 » via `group` ;
« Éliminé » en premier, qui **implique** « Cartes couchées » du même siège (`VariantDef.implies`) : la famille
impliquée se rend cochée ET verrouillée avec son motif. Colonne de droite : les deux faces d'une famille « écart »
(normal · écart), ✓ dès qu'une capture du bucket l'atteste. Contrat : `VariantDef` gagne `zone`, `family`,
`normal?`, `implies?` ; aucun rappel ajouté ni retiré ; `onCorrectLabels` garde son ensemble complet. i18n
`roomProfileV3.attest*`, cinq postures de fixtures (dont « siège éliminé » et « famille non visible »).

## 2. Station 3 : choisir la taille sur place — `roomprofile-073-taille-station3.md`

Le sélecteur « TAILLE DE FENÊTRE EN CALIBRATION » de la station 4, au même endroit, à la station 3 ; changer de
taille redimensionne la vraie fenêtre comme aujourd'hui (`onSelectSize`, signature inchangée) ; chaque carte de
taille dit combien de captures elle porte, et une prise absente d'une taille le dit (`takeOnlyIn`). `SizeBucket`
gagne le compte servi, `Shot.seq` sert de nom.

## 3. Station 5 : des paquets de gabarits nommés, une vérification par paquet — `roomprofile-073-paquets-glyphes.md`

Deux styles de chiffres sur la table (gras / fin) et un seul tas de gabarits : le joueur ne voit pas qu'un style
entier manque. Des **paquets** nommés par l'utilisateur (`GlyphPack`), chaque extraction rangée dans un paquet,
la vérification filtrable par paquet (`packAll` / `packNone`). Habillage seulement : le jeu compilé pour le moteur
reste plat, rien ne change côté lecture.

## 4. F9 : un échec de capture se voit — `roomprofile-073-echec-capture.md`

Le plafond de captures par taille disparaît (`RoomProfileData.maxShotsPerSize` quitte le contrat, aucun écran ne
le rendait). Ce qui reste : un **bandeau** (pas un toast) quand l'app émet `calibration-capture-failed`
`{ at, takeId, requested, captured, failures[{ sizeId, message }] }` — le message backend verbatim, une ligne par
taille refusée, « refusé partout » distingué de « refusé sur une taille » (`captured.length === 0`), un « Renvoyer ».
`calibration-state` reste le signal du succès.

## 5. L'écran d'erreur de profil a une sortie — `screen-error-073-sortie-profil.md`

Aujourd'hui « This screen hit an error » et un chemin. Demandé : un composant `ScreenError` servi comme les autres
écrans (`ScreenErrorData` : titre, fichier en cause, ce que l'app a déjà fait, `outcome`), avec **trois sorties**
(`ScreenErrorCallbacks`) : réessayer, rejouer le seed du profil (avec son avertissement), ouvrir le dossier du
profil. Deux postures : erreur brute, seed refusé avec le message.

## Ce qui ne bouge pas

Station 4 (établi, canvas, rail des zones), matrice de couverture, `Shot`, `CoverageCell`, `TourState` hors ajouts
déclarés, les écrans `Account` / `Activation` livrés par la vague 0.7.2, le contrat d'export et le bundle lint.
Hors vague : la zone « Frontière de main » disparaît du catalogue côté app — la station 4 est pilotée par les
données, aucun changement DS.

Verdict d'import au prochain rapport, après le drop.
