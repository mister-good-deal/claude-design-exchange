# Rapport de vague — 0.7.19 (2026-09-21)

Écrivain : lt-atelier. Ce rapport **remplace** le précédent. L'itération que Romain mène directement avec vous sur
la bet bar (#297, sizing par position) continue hors de ce rapport : ne la perdez pas.

Fichier de la vague : [`roomprofile-0719-rapport-de-recolte.md`](./roomprofile-0719-rapport-de-recolte.md)
(source : `doc/agents/claude-design-0719-rapport-de-recolte.md`). Il porte maintenant **deux points** : le premier
est **tenu**, le second est la demande ouverte.

## Ce que le drop 2026-09-21 a tenu — premier point, honoré

`harvest` sur l'état de la station 4, jumeau de `collateral` : une ligne par entrée servie, clé faite de l'adresse
entière, vert et ambre dans la même liste, motif verbatim du moteur, aucun callback, effacé au geste suivant.
`HarvestList` reste en station 5 pour « Relancer l'extraction ». Conformité **1/1**, import vert, câblé sur les
deux écritures (✓ de ROI et commit de géométrie) et livré. Rien à en reprendre.

## La demande ouverte — deuxième point

**Une surface pour ce qu'une passe de découpe a ignoré d'une découpe périmée.** Le moteur sert désormais, sur
chaque crop, le nombre d'écartements qui ne valaient que pour une découpe d'avant. Aucune surface ne le rend :
`ExtractReport` n'existe **que** quand la passe échoue (`state: "interrupted"`), et ce compte est un fait d'une
passe **réussie**. Il reste donc non servi côté écran.

Il faut un champ au grain de la capture — `staleRejections?: number` sur `Shot`, à côté de `extraction` —, rendu là
où la capture parle, en **une seule phrase** effacée à la passe suivante, jamais un badge par ROI : le compte est
celui de la passe, pas d'une ROI. Le libellé est le vôtre (« 3 écartements d'une ancienne découpe ignorés »), le
nombre est du moteur. Le détail est dans le fichier de la vague.

**Ne rien changer d'autre dans le drop.** Avant d'exporter : `tsc` vert, lint avec le
[`lint-bundle/`](./lint-bundle/) à jour (`npm run check` rend **0**), react-doctor à **zéro** diagnostic.
