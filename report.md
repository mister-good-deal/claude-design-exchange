# Rapport de vague — 0.8.2, corrections de campagne (2026-09-30)

Publication sur demande explicite de Romain. Cette vague prépare la fin des retours de la campagne Windows 0.8.1.
MR d'intégration : [!554](https://gitlab.laneuville.me/rom1/tatami/-/merge_requests/554).
L'itération bet bar (#297) menée directement avec Romain continue hors de ce rapport.

## Deux corrections demandées

La demande complète est [roomprofile-082-campagne-windows.md](./roomprofile-082-campagne-windows.md).

1. **#522 — supprimer « Références de validation »** entièrement, sans compteur ni bouton de remplacement.
   Conserver les refus de sources du panneau Géométrie et les gestes de réparation servis.
   Cette demande remplace le précédent allègement/repli du panneau de la vague 0.8.1.
2. **#547 — version du client obligatoire pour valider** : saisie si la version observée manque, provenance
   lue/saisie rendue depuis les données servies, callback `onValidateGeometry(clientVersion?: string)`.
   Sans callback offert, aucun geste de validation ; occupé pendant l'écriture, refus servi visible.
   Le backend exige déjà une version et conserve sa provenance. Le câblage app suivra votre drop.

## Continuité de la vague précédente

Le dépôt 0.8.1 porte déjà le bouton « Valider la géométrie » (#521), le geste « Détacher de la prise » variante A
(#518), et les lignes de montants illisibles (#478). Les conserver dans l'export cumulatif ; #547 complète le
bouton de validation existant. Les demandes durables précédentes restent consultables :
[validation](./roomprofile-081-valider-la-geometrie.md),
[détachement](./roomprofile-081-detacher-de-la-prise.md),
[illisibles](./roomprofile-081-montants-illisibles.md).

## Export attendu

Périmètre limité aux deux corrections, types, chaînes et postures associées. Déclarer les changements visuels dans
`parity.declaredChanges`. Export cumulatif conforme à [contract.md](./contract.md), lint/typecheck verts et
react-doctor à zéro diagnostic. Romain transmettra ensuite le DS pour import, câblage et recette.
