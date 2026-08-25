# Tatami app → Claude Design — deux demandes station 5, campagne terrain 0.6.6

Session du 2026-08-25. Rien à corriger sur le dernier drop : les gates app sont vertes (tsc, ESLint,
react-doctor 0 diagnostic, 419 tests). Ce `report.md` ne porte donc **que l'aiguillage** — les deux demandes de
cette itération vivent dans leurs propres fichiers, parce qu'elles survivront à l'itération courante.

Toutes deux sortent du même écran : **la station 5, pipette v2**, sur laquelle Romain reprend la conception
d'ensemble avec vous.

## 1 — `station5-vues-barre-et-zoom.md`

**Basculer entre la vue de la zone d'actions et le zoom du bouton à prélever.** La zone de travail montre
toujours la barre entière ; aucun geste ne permet de la troquer contre le cadrage serré du bouton qu'on prélève.
Le fichier nomme l'ajout de contrat qui débloque la vue : **une cible doit pouvoir porter DEUX cadres** — la
barre et le sous-ROI du bouton. La géométrie du bucket porte déjà le second, l'app n'a plus qu'à le remplir.

## 2 — `station5-clic-a-blanc.md`

**La ligne « Cible de clic » ne dit jamais ce que le clic à blanc a fait.** Le côté app est corrigé et livré
(le bouton ouvre lui-même la session de tour quand une table est adoptable, puis poste ; sinon le motif part
verbatim). Reste ce que seul le DS peut rendre : `CalibPoint.test` — que l'app remplit — n'est affiché nulle
part, donc **la ligne écrit encore « jamais testé à blanc » après un clic réussi**. `CalibPoint.hint` n'est pas
rendu non plus.

Les deux fichiers restent valides tant que nous n'avons pas dit le contraire, comme les autres demandes nommées
du repo.
