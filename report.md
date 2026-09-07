# Vague 0.7.5 — station 3 : la bande des tailles ne prend que ce qu'elle affiche, et la colonne de couverture dit le seuil

**État** : le re-drop `2026-09-06.3` (vague 0.7.4, atelier de traitement) est **importé** — MR d'import verte (doctor
vert, verrou 103, vitest 558, e2e 74/74, parité 28/28 sans re-baseline), atelier câblé sur `number_preview` /
`number_measure` / `number_config_set`, images par URL asset. Vague 0.7.4 CLOSE, merci — la station expert est
livrée dans la 0.7.3 et Romain l'a eue en campagne.

**Cette vague tient en UNE demande, courte** : `roomprofile-075-station3-bande-et-seuil.md` (retours de la campagne
Windows 0.7.3 sur la station 3 livrée par le drop `2026-09-06.1`). Le fond est conforme à #215/#216 ; trois défauts
de mise en œuvre, dont un seul est un défaut de gabarit.

1. **La bande des tailles mange la moitié de la hauteur — mesuré, c'est du CSS.** `.bucketBanner` porte
   `flex: 1 1 auto` + `align-items: center` : juste dans la rangée de la station 4 (il grandit en largeur), faux dans
   la colonne de la station 3 (il grandit en hauteur : 598 px pour 124 px de contenu, la capture reléguée en bas).
   Demandé : à la station 3 le rail est une bande à la hauteur de son contenu, la capture occupe le reste ; le moyen
   vous appartient (variante par la prop `station` déjà reçue, `flex-grow: 0`, ou rail hors flux).
2. **« Le sélecteur ne répond pas au clic »** : le câblage app est prouvé bon (gate jsdom sur le container réel,
   `elementFromPoint` sur les cinq tuiles dans Chromium). La cause probable est le §1 : un clic visé dans 474 px de
   bande vide n'atteint aucune tuile. Rien à changer au contrat, `onTourSize` inchangé.
3. **La colonne « Toutes les captures » dit « ≥ 1 capture », la station exige deux témoins par état.** Ce n'est pas un
   rafraîchissement manquant, c'est le seuil qui n'est pas rendu. Demandé : la forme du seuil — **la proposition que
   vous aviez faite pour la vague 0.7.3, plusieurs coches quand deux témoins sont demandés, est celle que Romain
   préfère** (pas de nombre : la demande ne dépasse jamais deux) ; le ✓ plein réservé au seuil atteint, et une
   capture décochée fait retomber la couverture sous le seuil à l'instant. Rien de servi en plus : le compte se
   dérive des `CoverageCell` et des attestations des captures du bucket.

Contrat : **rien d'ajouté, rien de retiré, rien de changé**. i18n : au plus une clé pour le §3 selon le gabarit
retenu. Fixtures : une posture « 1 témoin sur 2 » et une « 2 sur 2 ».

## Ce qui ne bouge pas

L'attestation par famille (#216), « Non visible ici », la station 4 et son rail (le même composant y reste tel
quel), la station 5 et l'atelier, le contrat d'export et le bundle lint.

Verdict d'import au prochain rapport, après le drop.
