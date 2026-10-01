# Rapport de vague — 0.8.2, corrections de campagne (2026-09-30)

Publication sur demande explicite de Romain. Cette vague prépare la fin des retours de la campagne Windows 0.8.1.
MR d'intégration : [!554](https://gitlab.laneuville.me/rom1/tatami/-/merge_requests/554).
L'itération bet bar (#297) menée directement avec Romain continue hors de ce rapport.

## Deux corrections livrées dans le drop `2026-09-30`

La demande complète est [roomprofile-082-campagne-windows.md](./roomprofile-082-campagne-windows.md).

1. **#522 — supprimer « Références de validation »** entièrement, sans compteur ni bouton de remplacement.
   Conserver les refus de sources du panneau Géométrie et les gestes de réparation servis.
   Cette demande remplace le précédent allègement/repli du panneau de la vague 0.8.1.
2. **#547 — version du client obligatoire pour valider** : saisie si la version observée manque, provenance
   lue/saisie rendue depuis les données servies, callback `onValidateGeometry(clientVersion?: string)`.
   Sans callback offert, aucun geste de validation ; occupé pendant l'écriture, refus servi visible.
   Le backend exige une version et conserve sa provenance. Le câblage app est intégré dans !554.

## Continuité de la vague précédente

Le dépôt 0.8.1 porte déjà le bouton « Valider la géométrie » (#521), le geste « Détacher de la prise » variante A
(#518), et les lignes de montants illisibles (#478). Les conserver dans l'export cumulatif ; #547 complète le
bouton de validation existant. Les demandes durables précédentes restent consultables :
[validation](./roomprofile-081-valider-la-geometrie.md),
[détachement](./roomprofile-081-detacher-de-la-prise.md),
[illisibles](./roomprofile-081-montants-illisibles.md).

## Contrat du drop reçu

Périmètre limité aux deux corrections, types, chaînes et postures associées. Déclarer les changements visuels dans
`parity.declaredChanges`. Export cumulatif conforme à [contract.md](./contract.md), lint/typecheck verts et
react-doctor à zéro diagnostic. Le drop a été transmis par Romain et importé après vérification sur une copie.

## Verdict d’intégration — 1er octobre

Drop accepté : typecheck et lint verts, React Doctor sans diagnostic, knip et verrou DS verts (123 fichiers).
Les 924 tests front, 79 e2e et 24 comparaisons pixel passent. Export et preview portent la même version.

Le vrai producteur Rust prouve le refus sans validation, l’enregistrement de la version et de sa provenance,
la conservation après rechargement, puis l’offre renouvelée après modification d’une ROI. Ces DTO sont rejoués
par le container et le DS. La charge terrain de 954 preuves ne monte plus de panneau aux stations 4, 5 et 6 ;
les refus de sources et leur réparation restent accessibles.

Aucune retouche sémantique manuelle du DS. Les 638 tests natifs du shell et les 1 370 autres tests Rust passent.
Les corrections sont poussées dans !554, prête à relire.
Les issues terrain restent ouvertes jusqu’au « ça OK » de Romain sous Windows. Aucune nouvelle demande DS
pour cette vague ; la bet bar continue séparément.

## Nouvelle demande — Overlay v2 (1er octobre, Ref #22 et #548)

Le développement Overlay v2 rapatrié de Claude Cloud est en revue complète avant sa MR vers `release/0.8.2`.
Les deux demandes suivantes sont publiées sur instruction de Romain. Elles s’ajoutent aux corrections de campagne
ci-dessus : le prochain export doit conserver les modifications Room Profile du drop `2026-09-30`.

- [Interrupteur de l’atelier et refus servis](./overlay-v2-enabled.md) : l’écran reçoit `overlayEnabled`,
  `onSetOverlayEnabled` et `refusal`, avec toutes les chaînes françaises et anglaises dans le DS.
- [Cluster siqnote sur table](./overlay-v2-siq-panels.md) : état et géométrie des panneaux pour le hit-test,
  libellé « non reconnu » entièrement lisible et localisé, refus servi ; fermeture d’édition imposée par l’app.

La note s’enregistre bien avec **Ctrl+Entrée**, Entrée va à la ligne : décision de Romain, aucune demande de
modification sur ce point. Aucun calcul de jeu ni décision métier ne doit être ajouté au DS.
La revue peut préciser les scénarios de ces demandes ; ce rapport conserve les demandes de campagne déjà traitées.

### Compléments issus de la revue

La demande siqnote décrit maintenant un défaut reproduit : « + » retire le champ de note sans signaler la fin
 d’édition. L’app ajoute une garde de fermeture ; le DS doit terminer l’édition proprement ou désactiver ce bouton
pendant l’édition. Les mots de réserve épuisée et de refus d’ouverture d’édition figurent aussi dans les demandes.

Troisième demande : [précision du pas de molette](./overlay-v2-bet-step.md). Pour `nudgeStepBb = 0.25`, l’aide affiche
actuellement `0.3 bb`. Elle doit conserver la valeur servie ; les montants des presets restent les chaînes Rust.
