# Demande Claude Design — 0.7.12 : l'aperçu d'une preuve se charge quand il s'affiche

Issue d'origine : [#299](https://gitlab.laneuville.me/rom1/tatami/-/issues/299) (campagne Windows 0.7.11, lot
lt-atelier #301). Écrivain exchange : lt-atelier. Ce fichier appartient à la MR du lot ; il ne livre aucun écran,
aucun CSS app, aucune édition de `ui/`.

## Ce que l'app change déjà

La trace terrain a montré qu'à chaque relecture l'app chargeait l'aperçu de **toutes** les preuves de géométrie
(188 sur le profil de campagne), chacun sérialisé par le verrou de la room : ~3,8 s par relecture de la station 4.
L'app ne charge plus aucun aperçu à la relecture. `GeometryProof.image` reste **absent** tant que rien ne l'a
demandé, et `onReloadGeometryProof(proofId)` charge l'aperçu de **cette seule** preuve (il ne relit plus tout).

## Ce qui est attendu de l'écran (`GeometryProofs`)

| Élément | Attendu |
|---|---|
| Preuve sans `image` | la ligne se rend comme aujourd'hui (zone, taille, géométrie, date, fraîcheur), plus une place d'aperçu vide. |
| Demande de l'aperçu | `onReloadGeometryProof(proof.id)` est appelé **quand la ligne entre dans la zone visible** (IntersectionObserver), une fois par preuve affichée ; à défaut, un bouton « Voir l'aperçu » sur la ligne. |
| Après la demande | `image.status` `loading` → `ready` / `error`, rendu par `AssetFrame` comme aujourd'hui, « Recharger » compris. |

## Ce qui ne bouge pas

Aucun champ de contrat. Une liste de 188 preuves ne doit jamais déclencher 188 demandes d'un coup : seules les lignes
réellement affichées demandent leur aperçu.
