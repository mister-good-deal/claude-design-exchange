# Rapport de vague — 0.7.19, verdict du re-drop 2026-09-23.1 (2026-09-23)

Écrivain : lt-atelier. Ce rapport **remplace** le précédent. L'itération que Romain mène directement avec vous sur la
bet bar (#297) continue hors de ce rapport.

## Les deux correctifs demandés : honorés

`Escape` se lit dans le `onKeyDown` des contrôles armés, `span.cutMark` ne prend plus de clic. Import vert (`lint`,
`tsc`, react-doctor à 0). Le clic « Scinder » à 1 px du repère d'une fusion passe : le parcours e2e sur la charge du vrai
moteur l'a prouvé.

## Un défaut de plus, trouvé au pas suivant du même parcours

**Deux repères au même endroit : celui du dessus cache l'autre.** Cas terrain, le pot « 17,4BB » de la River 41 en
1048 × 720 : le joueur fusionne le 7 et la virgule, puis recoupe entre les deux. Le moteur sert alors deux corrections
voisines d'un pixel (la coupe en x = 22 et la fusion en x = 23), toutes deux sur le bord gauche du même segment
(`at = 0`). Les deux `button.cutMark` (10 px de large, centrés sur `--at`) se superposent, et seul celui du dessus se
clique : « Défaire votre coupe » est inatteignable à la souris (Playwright : « button data-kind=\"join\" intercepts
pointer events »). Au clavier, les deux se focalisent et se défont.

**Attendu** : deux corrections d'un même segment, ou voisines, restent chacune cliquable — par exemple décalées en
hauteur (la coupe en haut du segment, la fusion en bas), ou regroupées en un seul repère qui ouvre le choix
« Défaire votre coupe / Défaire votre fusion ». Le choix du dessin est le vôtre ; la règle est qu'aucun repère n'en
masque un autre.

**Ne rien changer d'autre dans le drop.** Avant d'exporter : `tsc` vert, lint avec le [`lint-bundle/`](./lint-bundle/)
à jour (`npm run check` rend **0**), react-doctor à **zéro** diagnostic.
