# Demande Claude Design — le cluster siqnote sur la table

**Publiée le 2026-10-01** sur l'exchange :
[overlay-v2-siq-panels.md](https://github.com/mister-good-deal/claude-design-exchange/blob/main/overlay-v2-siq-panels.md).
Suivi de la vague : #548. Export et import correctifs attendus.

La page d'overlay d'une table rend `SiqCluster` tel quel, dans une fenêtre transparente que le shell laisse traversable
partout, sauf sur les rectangles que la page lui publie. Quatre points du contrat actuel obligent l'app à des écarts,
à retirer dès l'export suivant.

## Ce que l'app demande

1. **L'état ouvert et la boîte des panneaux.** La palette (au clic sur « + ») et la note (au survol de l'icône, en CSS)
   s'ouvrent HORS de la boîte du cluster, avec leur pont de 10 px. Si le rectangle publié ne les couvre pas, la fenêtre
   est traversable sur eux : la souris ne les atteint pas. Aujourd'hui l'app mesure elle-même l'union des boîtes
   visibles du cluster et de ses descendants (`getBoundingClientRect`, relancée par un `MutationObserver` et les
   événements de transition), sans toucher au DS. Demande : `on.onPanels?(open: { palette: boolean; note: boolean })`
   à chaque ouverture et fermeture, ou mieux une fonction exportée `siqPanelBox(side, which): BoxSize & { dx; dy }`,
   dans l'esprit de `siqClusterSize`, qui dit où chaque panneau se pose par rapport à la boîte du cluster.
2. **La touche d'enregistrement de la note** : tranché par Romain le 2026-10-01 en faveur de l'export (Entrée va à la
   ligne, Ctrl+Entrée enregistre, aide comprise). Plus de demande sur ce point ; la spec est alignée (FR-022).
3. **Le mot d'un joueur non reconnu.** `SiqPlayer.unknown` attend un mot servi ; le DS n'en a pas dans
   `STRINGS[locale].tableHud`. L'app écrit « non reconnu » / « not recognised ». Demande : `tableHud.playerUnknown` en fr
   et en en, et une cellule qui le montre en entier (deux cellules de 17 px le tronquent à 8 px).
4. **Une ligne de refus.** Un geste refusé par le shell (tag hors palette, magasin illisible…) se dit verbatim ;
   l'app pose aujourd'hui un `role="alert"` sous le cluster, hors du DS. Demande : `data.refusal?: string`, rendu par le
   cluster comme `tagRejection` l'est dans l'atelier.
5. **Terminer l'édition avant de retirer son champ.** La revue du 2026-10-01 reproduit ce défaut : éditer une note,
   puis cliquer « + » retire le textarea sans appeler `onNoteEditEnd`. L'app croit encore l'édition active et le
   routage reste suspendu. Demande : terminer explicitement l'édition avant d'ouvrir la palette (ou désactiver « + »
   pendant l'édition), avec un callback de fin unique. Tester annulation, ouverture de palette et nouvelle édition.
   La fermeture imposée par `data.editing` doit suivre le même contrat.
6. **Le refus d'ouvrir l'éditeur** : fournir un libellé fr/en quand le focus ou le mode d'édition n'a pas pu être obtenu.
   La décision et les détails de refus restent servis par l'app ; aucune prise de focus n'appartient au DS.

## Aussi, à savoir

- **`SiqPlayer.name`** : aucun pseudo n'est lu (pas d'OCR, l'identité est une empreinte d'encre). L'app sert la
  position servie du siège (« BTN »), sinon le nom du siège (`roomProfileV3.seatName`, « Vilain 1 »). Le panneau et les
  noms accessibles disent donc « Note sur BTN ». Si le DS veut un autre mot pour un joueur sans pseudo, qu'il le dise.
- **Fin d'édition imposée** : quand le shell rend le focus sans que la page l'ait demandé (coupe-circuit, table
  fermée), la page ne le voit qu'à la perte de focus de sa fenêtre ; elle remonte alors le cluster (brouillon
  abandonné). Un `data.editing?: boolean` servi permettrait de fermer l'éditeur sans le remonter.
