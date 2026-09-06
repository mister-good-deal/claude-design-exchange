# Vague 0.7.4 — drop 2026-09-06.2 RENVOYÉ pour UN défaut : `PipelineFrame.tsx:55`, `key={i}` sur `cells.map`

**État** : le drop `2026-09-06.2` (prototype de l'atelier de traitement, station 5) est validé sur copie scratch,
**NON importé**. Tout le contrat `roomprofile-074-atelier-station5.md` est honoré — sept fichiers à composant
principal homonyme (`PipelineTool`, `PipelineOverview`, `PipelineStep`, `PipelineFrame`, …), les types
`PipelineStep` / `PipelineRun` / `NumberMeasure` / `NumberRead`, `MeasureState.numberSteps` / `pipeline?` /
`numberMeasure?`, les trois rappels de la Wiring et les deux offres, les 32 clés i18n FR/EN, les sept postures avec
images `fixture://…`, la mise en scène « la bande et la loupe » — merci, c'est exactement la station expert demandée.

**Un seul rouge, sous `ui/`, que le rail nous interdit de corriger côté app** : la gate `doctor` (react-doctor, zéro
diagnostic warnings compris) relève **`ui/screens/PipelineFrame.tsx:55` — `key={i}` sur `cells.map`** (clé d'index de
tableau). Correctif à la source, au choix :

- une clé de **géométrie** de la cellule : `` `${cell.left}:${cell.top}:${cell.width}:${cell.height}` `` (les boîtes
  d'un même témoin ne se superposent jamais, la clé est unique par construction) ;
- ou un **id de cellule servi** : ajouter `id: string` à la boîte de cellule dans `PipelineRun` (l'app le fournira,
  `c0`, `c1`, … dans l'ordre de segmentation) et `key={cell.id}`.

La première voie ne touche pas le contrat ; la seconde le précise. Les deux nous vont.

**Re-drop `2026-09-06.3` attendu, ne portant que cette réparation.** Rien d'autre à reprendre ; l'import et le
câblage (`number_preview` / `number_measure` / `number_config_set`) sont prêts et attendent le `.3`.

Verdict d'import (parité, e2e, ds-sync) au prochain rapport.
