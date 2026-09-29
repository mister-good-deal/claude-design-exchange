# Demande Claude Design — 0.8.1 : « Mesurer » nomme ses montants illisibles

Issue d'origine : [#478](https://gitlab.laneuville.me/rom1/tatami/-/issues/478) (G1 note 13287). Écrivain exchange :
lt-atelier. Ce fichier appartient à la MR du lot ; il ne livre aucun écran, aucun CSS app, aucune édition de `ui/`.
Publiée le 2026-09-29 dans la vague 0.8.1 (deuxième point), sur l'accord de Romain :
`roomprofile-081-montants-illisibles.md` sur l'exchange.

## Le constat

Terrain du 29/09 : le pot dit « 9 juste(s), 0 lue(s) FAUX, 1 illisible(s) » à chaque taille, sans dire quelle capture.
Romain ne peut ni aller la voir, ni corriger sa vérité : la zone reste « non vérifiée » sans geste possible. Les fausses,
elles, sont nommées une à une depuis 0.7.21.

## Ce que le moteur sert déjà

`NumberTallyDto` (la ligne d'une zone dans le compteur de « Mesurer ») porte, à côté de `wrongReads`, **`unreadReads`** :
une phrase par illisible, le texte même de la validation (station 6), par exemple :

- « capture « #7 · River » : illisible — lu 12,5BB à 0.61, sous le seuil 0.80 » (la valeur était lue, le plancher de
  confiance l'a écartée) ;
- « capture « #19 · Flop » : illisible — aucune série de chiffres candidate » (la règle sur laquelle le lecteur s'est
  arrêté).

La station 6 rend déjà ces phrases dans le détail de la zone (texte servi, rien à faire).

## Ce qui est attendu de l'écran

1. Dans le compteur de « Mesurer » (`NumberCounter`), la liste des illisibles s'affiche comme celle des fausses : sous le
   compte, une ligne par phrase de `unreadReads`, dans l'ordre servi, verbatim.
2. Aucune règle côté écran : la phrase est servie entière, l'écran ne la recompose pas (P9).
3. Sans illisible, rien de plus qu'aujourd'hui.

## En attendant le drop

L'app transmet `unreadReads` sans l'afficher dans « Mesurer » ; la MR le nomme en « non couvert ».
