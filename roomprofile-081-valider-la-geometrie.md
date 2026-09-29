# Demande Claude Design — 0.8.1 : « Valider la géométrie », un geste à part d'« Écrire »

Issue d'origine : [#521](https://gitlab.laneuville.me/rom1/tatami/-/issues/521) (conception note 13279, oui de Romain
le 29/09). Écrivain exchange : lt-atelier. Ce fichier appartient à la MR du lot ; il ne livre aucun écran, aucun CSS
app, aucune édition de `ui/`. Publiée le 2026-09-29 dans la vague 0.8.1, sur l'accord de Romain :
`roomprofile-081-valider-la-geometrie.md` sur l'exchange.

## Le constat

« Écrire le profil » (station 6) inscrivait en même temps la validation de la géométrie. Le panneau « Géométrie de la
room » affichait ensuite « Validée le … » sans que Romain l'ait décidé. Pour lui, valider, c'est diffuser la géométrie à
tous les joueurs : un geste manuel, à part.

## Ce que l'app change

« Écrire » vérifie et écrit le profil, il n'inscrit plus la validation. Une nouvelle commande valide la géométrie :
elle rejoue le verdict d'« Écrire » sur le profil publié et, s'il est vert, inscrit la validation. Elle rend la vue
géométrie à jour (date de validation, versions du client confirmées). Le profil livré aux joueurs n'est produit que
d'une géométrie validée ainsi.

## Ce qui est attendu de l'écran — panneau « Géométrie de la room »

1. **Un bouton « Valider la géométrie »**, un seul clic, offert dès que l'app fournit un nouveau rappel
   `onValidateGeometry()` ; sans rappel, pas de contrôle. Le geste est sans risque à répéter : une géométrie déjà
   validée dans le même état n'est pas inscrite deux fois, donc l'app ne sert aucun état « offert ».
2. **La phrase servie à côté du bouton**, rendue telle quelle : ce que le geste fait (« Inscrit cette géométrie comme
   validée : c'est elle que la référence livrée diffusera aux joueurs. »). L'écran ne compose aucun mot.
3. **Pendant le geste**, le bouton est occupé ; **au refus**, la liste servie des lignes qui l'empêchent (taille,
   station, motif), comme le refus d'« Écrire » ; au succès, rien de plus : les deux dates du panneau (déclarée,
   validée) et le tableau des clients se mettent à jour depuis les données servies.

Ne rien changer d'autre : la déclaration d'une nouvelle géométrie, les archives et le tableau des clients restent tels
quels.
