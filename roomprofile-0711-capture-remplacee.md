# Demande Claude Design — 0.7.11 : la capture remplacée n'existe plus

Issue d'origine : [#292](https://gitlab.laneuville.me/rom1/tatami/-/issues/292) (campagne Windows 0.7.10, lot
lt-engine #295). Écrivain exchange : lt-atelier. Ce fichier appartient à la MR du lot ; il ne livre aucun écran,
aucun CSS app, aucune édition de `ui/`.

## Ce que le moteur change

La 0.7.9 (#277) plafonnait la station 3 à **une capture par taille et par tour** : un second F9 ne capturait plus
rien, et le bouton sur une taille déjà couverte **supprimait** la capture précédente — d'où la tête de bannière
« Capture remplacée sur k taille(s) », demandée dans [la vague 0.7.9](./roomprofile-079-station3.md) (#277).

Le terrain a tranché : un jeu exhaustif demande plusieurs mains par taille. Le moteur capture désormais à chaque
appui, et le bouton **ajoute** — rien n'est jamais remplacé ni supprimé implicitement. La déduplication ne vit plus
que le temps d'un balayage (deux tailles à 2 % près du même layout → une capture), et elle ne produit aucun refus.

## Ce qui est attendu de l'écran

`CaptureFailure.failures[].kind = "replaced"` reste dans le contrat (le moteur ne l'émet plus, aucune migration) :
la branche d'affichage est **morte**, à retirer.

| Élément | Attendu |
|---|---|
| `CaptureFailureNotice` | une seule tête, celle des refus : « Capture refusée sur k tailles sur n ». Chaînes `captureReplaced` et `captureRefusedOrReplaced` supprimées. |
| Ligne par taille | inchangée : le message du back, verbatim. |

Rien d'autre ne bouge : aucun champ de DTO retiré, aucune autre station touchée.
