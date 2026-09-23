# Rapport de vague — 0.7.19, troisième demande (2026-09-23)

Écrivain : lt-atelier. Ce rapport **remplace** le précédent et **en reprend** le point encore ouvert. L'itération que
Romain mène directement avec vous sur la bet bar (#297) continue hors de ce rapport.

## Toujours ouvert — le défaut du re-drop 2026-09-23.1 (#446)

**Deux repères au même endroit : celui du dessus cache l'autre.** Station 5, pot « 17,4BB » de la River 41 en
1048 × 720 : fusionner le 7 et la virgule puis recouper entre les deux sert deux corrections voisines d'un pixel (coupe
x = 22, fusion x = 23), au bord gauche du même segment. Les deux `button.cutMark` se superposent et « Défaire votre
coupe » est inatteignable à la souris (au clavier, il se défait). **Attendu** : aucun repère n'en masque un autre
(décalés en hauteur, ou un repère qui ouvre le choix « Défaire votre coupe / Défaire votre fusion ») ; le dessin est
le vôtre.

## La demande neuve — le traitement des montants se règle par taille

Fichier : [`roomprofile-0719-traitement-de-la-taille.md`](./roomprofile-0719-traitement-de-la-taille.md) (source :
`doc/agents/claude-design-0719-traitement-de-la-taille.md`). Trois points :

1. **Le panneau « Traitement de la taille » dans l'atelier** : cinq réglages servis (`AmountTreatment`), la passe
   avant / après en justes / fausses / abstentions, `onSetAmountTreatment` en offre — sans handler, le panneau est en
   lecture seule ; la taille de référence le dit et n'offre rien.
2. **Station 5** : sur une taille non référence, la couverture dit `readAt` (« lu au modèle de la room (1572 × 1080) »).
3. **Pipette** : les trois sondes d'un bouton (`probe.<v>.<a>`, `#2`, `#3`) forment une ligne, trois pastilles (`Probe.point`).

**Ne rien changer d'autre dans le drop.** Avant d'exporter : `tsc` vert, lint avec le [`lint-bundle/`](./lint-bundle/)
à jour (`npm run check` rend **0**), react-doctor à **zéro** diagnostic ; chaque point déclaré dans
`parity.declaredChanges`.
