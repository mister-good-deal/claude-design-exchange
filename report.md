# Rapport de vague — 0.7.14 (2026-09-15)

Écrivain : lt-atelier. Ce rapport **remplace** celui de la 0.7.12 : ses deux demandes (#298 jauge par face, #299
aperçu de preuve à l'affichage) sont honorées par le drop `2026-09-14`, importé dans la 0.7.13. Rien n'est à
reprendre. L'itération que Romain mène directement avec vous sur la bet bar (#297, sizing par position) continue
hors de ce rapport : ne pas la perdre.

Fichier durable de la vague : [`roomprofile-0714-capture-station4.md`](./roomprofile-0714-capture-station4.md)
(source : `doc/agents/claude-design-0714-capture-station4.md`, branche `fix/0714-capture-station4` vers
release/0.7.14). Trois demandes, un seul drop.

## 1. Bloquant — la station 4 affiche la capture sur laquelle l'app écrit (#307)

Au terrain, la station 4 écrivait ses preuves sur la capture principale pendant qu'elle en affichait une autre, et
n'affichait pas la capture choisie en station 3. La capture de la station 4 vit dans l'état local de `ZoneWorkbench`
sans que l'app en soit informée.

- Contrat : `WizardState.activeShotId?: string`, la capture servie de la station `adjust`.
- `ZoneWorkbench` affiche la capture servie, sans repli ; vignette, pager, flèches ← → et bascule vers une capture qui
  atteste la déclinaison émettent `on.onSelectShot(sizeId, shotId)` — plus aucun `selectShot` local.
- `CardTemplateTool` lit la même capture servie et son sélecteur émet `on.onSelectShot`.
- Règle durable : un écran ne tient jamais en local un id de domaine qu'une écriture de l'app utilise sans le recevoir
  en argument ; il le lit servi et émet le callback.
- Fixture : une posture de station 4 dont la capture servie n'est pas la principale.

## 2. Station 4 — « Tout sélectionner » puis les flèches déplacent le groupe (#305)

Flèches sur le groupe entier après « Tout sélectionner », un clic sur un membre ne dissout pas le groupe, jamais de
défilement de page tant qu'une sélection existe, un seul `onNudgeZones` pour tout le groupe.

## 3. Station 3 — « Capturer cette taille » (#303)

`tourCapture` et `orF9` disent la différence : le bouton prend la taille courante, F9 une capture par taille du layout.

## Règles inchangées

Un seul drop cumulatif avec manifeste ; version du prototype identique ; `previewOnly` vide ; FR/EN complets ; lint,
typecheck et react-doctor à zéro sans suppression ; conserver tous les acquis 0.7.6 à 0.7.13 et les demandes
permanentes. Import par `pnpm import-ds` seulement, puis tests app, e2e complète sans retry et parité pixel.
