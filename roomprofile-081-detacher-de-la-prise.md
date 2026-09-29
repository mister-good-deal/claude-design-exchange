# Demande Claude Design — 0.8.1 : détacher une jumelle de sa prise, trois propositions

Issue d'origine : [#518](https://gitlab.laneuville.me/rom1/tatami/-/issues/518) (cadrage note 13285). Écrivain
exchange : lt-atelier. Ce fichier appartient à la MR du lot ; il ne livre aucun écran, aucun CSS app, aucune édition de
`ui/`. **Prototype demandé, pas un drop d'import** : Romain veut voir trois variantes avant toute décision. Publiée le
2026-09-29 sur l'accord de Romain : `roomprofile-081-detacher-de-la-prise.md` sur l'exchange.

## Le constat

Une prise F9 capture la table à toutes les tailles ouvertes : ce sont ses jumelles. En station 3, une annotation se
pose pour la prise, donc pour toutes ses jumelles. Terrain du 29/09, prise #63 (flop) : les jumelles 960 × 520 et
640 × 440 ont été capturées une seconde plus tard, la turn déjà tombée — quatre cartes au board, trois sur les six
autres tailles. « Turn (4 cartes) » cochée sur l'une l'aurait été, fausse, sur toutes. Le dry-run l'a vu (« prise #63 :
4 carte(s) de board ici, 3 sur … ») ; le seul geste était de supprimer la capture de cette taille.

Le moteur arrête déjà de propager une annotation vers une jumelle dont la divergence est **prouvée** (deux comptes de
board relus qui diffèrent). Il ne peut rien quand l'annotation a été posée avant la preuve, ni quand un compte manque.

## Ce qui est attendu : deux éléments, trois façons de les montrer

1. **Le geste « Détacher de la prise »** sur une capture de la station 3. L'app retire la capture de sa prise et efface
   les annotations qu'elle en avait héritées ; la capture s'annote ensuite seule, comme une capture d'avant les prises.
   Le geste est irréversible (pas de « rattacher »). Offert seulement si l'app fournit son rappel, sur une capture qui a
   une prise.
2. **La ligne de divergence servie** : quand une passe a prouvé que la jumelle ne montre pas la même situation que sa
   prise, l'app sert une phrase (par exemple « prise #63 : 4 cartes de board ici, 3 sur les autres tailles ») à montrer
   près de la capture, avec le geste à côté. L'écran ne compose aucun mot, il ne compare rien.

**Trois variantes différentes**, prototypées, pour que Romain choisisse. Des pistes, non limitatives : le geste dans la
barre de la capture (à côté de la suppression) avec la ligne en bandeau sous le titre ; la ligne comme un avertissement
sur la vignette de la jumelle dans le ruban, le geste dans son menu ; un panneau « Jumelles de la prise » qui liste les
tailles de la prise et marque celle qui diverge. Chaque variante dit ce que voit une capture sans prise (rien) et une
jumelle détachée.

Ne rien changer d'autre. Aucun calcul côté écran : prise, divergence et phrase sont servies.
