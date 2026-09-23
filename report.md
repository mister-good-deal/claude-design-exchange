# Rapport de vague — 0.7.19, deuxième demande (2026-09-23)

Écrivain : lt-atelier. Ce rapport **remplace** celui du 2026-09-21 et **en reprend** la demande restée ouverte.
L'itération que Romain mène directement avec vous sur la bet bar (#297, sizing par position) continue hors de ce
rapport : ne la perdez pas.

## La demande neuve — l'écran d'une campagne qui s'enchaîne

Fichier : [`roomprofile-0719-ecran-de-campagne.md`](./roomprofile-0719-ecran-de-campagne.md) (source :
`doc/agents/claude-design-0719-ecran-de-campagne.md`). La campagne du 22/09 s'est **arrêtée sur les bandeaux** ; la
suivante recalibre sept tailles sur une géométrie neuve. Cinq points :

1. **Aucun retour de geste ne s'empile** : `CollateralNote`, `HarvestNote` et `HarvestList` disparaissent ; le retour
   d'un geste est UNE phrase servie dans la carte de sa taille (`SizeBucket.lastGesture`). Zéro notification.
2. **« Scinder ici »** sur une cellule soudée de la station 5 (`onSplitSegment`, `onRemoveSegmentCut`,
   `GlyphSegment.cutBefore`).
3. **Couverture glyphes** : le titre perd son compte ; en « Tous », une section par paquet, jamais une somme de deux.
4. **« Découpé » n'est pas « écrit »** : `GlyphSegment.written`, et `BucketGlyphTotal.repair` qui nomme le geste qui
   répare.
5. **Géométries** : `GeometryState.validatedAt` — « Déclarée le … · Validée le … / Jamais validée ».

## Reprise — la demande ouverte du 21/09

Fichier : [`roomprofile-0719-rapport-de-recolte.md`](./roomprofile-0719-rapport-de-recolte.md), **deuxième point
seulement** (le premier est honoré, et le point 1 ci-dessus le remplace) : `Shot.staleRejections?: number`, ce qu'une
passe de découpe réussie a ignoré d'une découpe périmée, en une seule phrase là où la capture parle, effacée à la passe
suivante. Le libellé est le vôtre, le nombre est du moteur.

**Ne rien changer d'autre dans le drop.** Avant d'exporter : `tsc` vert, lint avec le
[`lint-bundle/`](./lint-bundle/) à jour (`npm run check` rend **0**), react-doctor à **zéro** diagnostic ; chaque point
déclaré dans `parity.declaredChanges`.
