# Demande à Claude Design — Room Profile V4 : les autres stations, dans la langue de la station des lois B

Publiée par l'orchestrateur le 09/10 sur la demande de Romain. Décisions de conception : issue #624 (description =
état qui fait foi). Le vocabulaire des lois est celui de ta demande précédente (station des lois).

## Où on en est

Romain a retenu **B · Abaque et épure** (itération 4) pour la station des lois, avec ses décisions du 9 octobre : loi
par défaut ancrée (`table.bottom`), `scale` sur deux axes = le plus petit facteur, `slideWithRatio` jamais refusé (Δ
calibration en ambre), un trou entre sections = erreur du profil, `follow` offert à toute ROI (boucle et cible absente
refusées), menu de ROI, masquer / Afficher… / ◎ Focus, zoom molette + glisser, légende à droite.

Le portage de B dans l'export (`ui/screens`, contrat `LawsData` / `LawsCallbacks`) viendra **après** : l'app fixe
d'abord le contrat de données (spec V4 en cours). Ne porte rien pour l'instant.

## Ce qu'on te demande

Les **autres stations de Room Profile V4**, dessinées dans la même langue que B (épure, cartouche
CALIBRATION / PROJECTION / CONTRÔLE, pointillé = projeté, trait plein = calibré), pour que le parcours se lise d'un
seul tenant. Une proposition par station ; deux variantes seulement là où un choix reste ouvert (station 7).

En V4, **tout appartient à la room** : une seule taille calibrée (1572×1080, la « principale »), chaque zone placée à
toute taille par sa loi ; les autres tailles ne sont que des **points de vérification** (les « miroirs »). Rien ne se
règle plus « par taille ».

### Station 2 — Métrologie, simplifiée

Elle ne dérive plus de tailles : elle **borne la loi** (plage de tailles couverte, décalage de l'aire cliente : barre de
titre, bord). Un écran court.

### Station 3 — Captures : une prise et ses miroirs

- Une **prise** = la capture principale + **5 miroirs** à des tailles tirées au hasard, dans la case la moins couverte
  d'une grille ratio client × largeur (bornes de départ : ratio 1,30–1,80, largeur 640 → écran). L'app redimensionne,
  attend la taille visée puis le délai de capture, reprend la principale à la fin et remet la table dans la grille.
- La liste des prises ; la principale en grand, les miroirs en vignettes avec leur taille et un **badge de validité**
  automatique (l'encre des zones clés de la principale n'a pas bougé avant/après la rafale) ; **écarter un miroir à la
  main** (« il diffère de l'original »).
- Une **seconde rafale** de miroirs sur la même principale (un autre raccourci).
- Les annotations (variantes, sièges, dealer) ne se posent que sur la principale ; les miroirs en héritent.
- Pistes bienvenues : un **balayage** scripté par petits pas avec une courte pause (le client Unibet se recompose à
  chaque pause d'un glissé, pas en direct) — montrer sa progression sur la grille ratio × largeur.

### Station 4 — Ajustement des ROI sur la principale seule

- On ajuste les rectangles **sur la seule taille principale**. **Le bandeau des tailles disparaît.**
- À la place : passer **vite** de la capture courante à ses **miroirs**, pour voir les ROI posées par la loi sur chaque
  miroir (projetées, donc en pointillé), sans pouvoir les y éditer.

### Station 6 — Mesures : l'atelier de lecture et ses surcharges par plage

- Pipette des couleurs et vérités saisies sur une principale, propagées aux miroirs (oracles du dry-run, jamais
  sources de gabarit) ; gabarits récoltés sur la principale seule (un seul jeu, à 1572×1080).
- La chaîne de lecture d'une zone est **de room** ; elle peut être **surchargée sur une plage de tailles** (même
  grammaire `range` que les lois ; paramètres changés, traitements ajoutés ou retirés aux petites tailles), sans
  chevauchement.
- Montrer les plages d'une zone sur un **axe des tailles** (la règle graduée de B s'y prête), et laquelle s'applique à
  la capture affichée.
- L'aperçu sur un miroir est **en lecture seule**, sauf pour créer ou régler la surcharge de la plage qui contient sa
  taille.

### Station 7 — Validation : la couverture, sans orange partout (2 variantes)

- Dry-run sur **tout le corpus** (principales et miroirs valides). « Écrire » ne refuse qu'une **lecture fausse**
  (montant, rang, présence, bouton), nommée avec sa taille, sa capture, l'attendu et le lu ; **les abstentions ne
  bloquent plus** (taux affiché par zone et par plage).
- Une grille de cases « non couvertes » serait orange partout. Piste : un **nuage de points** ratio client × largeur, un
  point par capture (vert : tout juste ; rouge : une lecture fausse ; creux : abstentions seules) et le **contour du
  domaine vérifié**. Aucun état « non couvert ».
- Verdict **par zone** (ses captures en échec, attendu et lu).

## Contraintes (contrat des stations)

- **Le design system affiche, l'app décide** : l'app sert ce qui est placé, compté et jugé ; un composant ne calcule
  aucune loi, aucune couverture, aucun verdict.
- **Ce qui est affiché est ce qui est écrit** : une valeur projetée ne s'affiche jamais comme validée (#622).
- Aucun retour en arrière d'une station vers une précédente.
- Aucune survivance des stations V3 : pas de bandeau des tailles, pas de réglage par taille, pas de seed entre tailles.

## Ce qu'on attend en retour

Un prototype par station (2, 3, 4, 6, 7 ; deux variantes pour la 7), cohérent avec B ; la liste des composants (ceux de
B réutilisés, les nouveaux) ; une ébauche du contrat `Data` / `Callbacks` de chaque station. Rien n'est porté dans
l'export avant le choix de Romain.
