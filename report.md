# Tatami app → Claude Design — drop 2026-08-05 : ESLint enfin vert, défauts restants

Excellent drop. **Les 21 erreurs ESLint sont parties** — c'était LE bloqueur du merge, merci. L'éclatement de
`RoomProfileTools` en 7 fichiers de station, les 4 ajouts de contrat (`VariantDef.state/reason/at`,
`CellState "deferred"`, `Readiness.deferred`, `WizardState.detect`) et les 10 surfaces manquantes sont tous là.
Les fixtures sont alignées produit (16 captures, 17 codes, totaux dérivés). L'import est passé :
`pnpm import-ds` a synché 77 fichiers, la passe `lint:fix` mécanique a suffi, **`lint` ✓**.

Il reste **3 défauts d'export** (§1–2, ci-dessous) plus **7 défauts découverts en câblant le contrat** (§4), tous à
corriger à la source (on ne touche pas à `ui/`). Le côté app est adapté au nouveau contrat, donc le prochain export
devrait être drop-in.

⚠️ **Le défaut §1a est BLOQUANT, pas cosmétique** : le `ReferenceError` au chargement du module fait tomber
`RoomProfile.fixtures` → `CoverageMatrix` → tout l'écran. En l'état, l'écran Profils de room **ne s'affiche pas du
tout**, 6 suites Vitest (dont `AppShell` et `ActivationContainer`, qui n'ont rien à voir avec v3) échouent à
l'import, et l'e2e comme la pixel-parity sont hors service. C'est un one-liner de remontée de déclaration, mais il
bloque tout le reste — merci de le traiter en premier.

## 1 — `tsc` ✗ : deux erreurs dans l'export

**a) `ui/screens/RoomProfile.fixtures.ts:795` — variable utilisée avant sa déclaration (TDZ).**
```
795  { id: "w1", title: SAMPLE_WINDOW_TITLE, process: "unibet.exe", role: "table" },
```
```
TS2448: Block-scoped variable 'SAMPLE_WINDOW_TITLE' used before its declaration.
TS2454: Variable 'SAMPLE_WINDOW_TITLE' is used before being assigned.
```
`SAMPLE_WINDOW_TITLE` est déclaré plus bas dans le fichier. Ce n'est pas qu'un souci de type : au runtime, la
constante des fenêtres candidates s'évalue à l'import du module et lèverait un `ReferenceError`. Remonte la
déclaration de `SAMPLE_WINDOW_TITLE` au-dessus de son premier usage.

**b) `ui/screens/i18n.ts:573` et `:602` — identifiant `purge` dupliqué.**
```
TS2300: Duplicate identifier 'purge'.
```
La clé `purge` est déclarée deux fois dans la même interface de strings. Garde-en une (ou renomme la seconde si
les deux libellés sont censés être distincts — dis-nous lequel va où, on n'a pas voulu deviner).

## 2 — `react-doctor` ✗ : un rôle ARIA à remplacer par une balise

`ui/screens/RoomProfile.tsx:76` — *Accessibility: Role used instead of HTML tag* :
```tsx
<div className={styles.rejection} role="status">
```
`role="status"` sur un `<div>` : la balise native équivalente est `<output>` (implicitement `role="status"`,
région live polie). Le remplacement demande de vérifier le rendu, donc il t'appartient — nous ne pouvons pas
l'écrire côté app sans casser la parité (règle du repo : les swaps de markup se font dans le DS d'abord, jamais
en CSS applicatif).

C'est le seul diagnostic restant : les 3 warnings précédents (`RoomProfileTools` ×2, `RoomProfileWizard` ×1) ont
disparu avec la refonte. **La barre est zéro diagnostic**, erreurs ET warnings.

## 3 — Pour info : ce que l'app fait de son côté

On retire les contrôles app INTERIM que tu remplaces (métrologie run/interrupt/retry/commit, bascule
pipette↔glyphes, purge, `data.rejection`, station 1) et on câble le nouveau contrat (`deferred` rendu comme tel
au lieu d'être replié sur `na`, encart des variantes différées, `WizardState.detect`). Deux points à savoir :

- **Les ids de zones ne sont plus jamais codés en dur côté app** : ils arrivent par `data.zones`, construits
  depuis les régions déclarées du profil de la room. Sur Unibet ce sont `board_1..board_5`, `hero_1`, `hero_2`,
  `villain_*`, `actions` (+ sous-ROI `actions.fold/call/raise/slider`, actionneurs `bet_input/bet_button/bet_blur`,
  sondes `probe.*`). N'écris aucun id de zone en dur dans le DS — ils varient d'une room à l'autre.
- La pixel-parity compare ton prototype à l'app. Les 3 régions `rooms-*` divergent encore parce que tes fixtures
  montrent un profil showcase (readiness choisi, métas en prose) là où l'app rend la dérivation honnête du vrai
  profil. Ce n'est pas un défaut de ton côté et on ne te demande rien — juste pour que tu ne t'en inquiètes pas.

## 4 — Défauts trouvés en câblant les nouvelles surfaces

Tout ce qui suit a été constaté en branchant l'app sur le contrat, écran réel + navigateur réel. Aucun n'est
contourné côté app par du CSS : on te les remonte pour que le prochain export les porte.

**a) `RoomProfile.tsx:345` — `data.rejection` n'est PAS rendu dans le wizard.**
```tsx
if (typeof data.view === "object") {
    return <RoomProfileWizard data={data} on={on} wizard={data.view.wizard} />;   // ← sort avant <RejectionBanner>
}
```
La bannière de refus ne vit que sur les vues au repos. Or **tous** les gestes qui peuvent être refusés par le
backend se jouent DANS le wizard : commit de métrologie refusé (phases min/max incomplètes), capture hors tour,
prélèvement pipette sans capture attestante, vérité de glyphes désalignée, règles de détection invalides. En
l'état, ces refus sont avalés en silence — le joueur clique et il ne se passe rien. C'est le défaut le plus grave
de la liste côté produit. Il nous force à garder une bannière app-side non stylée tant qu'il n'est pas corrigé.
Le plus simple : rendre `<RejectionBanner>` dans `RoomProfileWizard` aussi (sous le voile), ou hisser le retour
wizard sous la bannière.

**b) `RoomProfile.fixtures.ts` — `RuleDraft` n'a pas de libellé : 3 règles sur 4 sont indiscernables.**
`DetectStation` étiquette chaque règle par `t.detectRole[r.role]`, donc par le RÔLE de fenêtre. La section
`[windows]` d'un profil en porte **quatre** : `table_class`, `table_id`, `table_loading` (toutes « table ») et
`lobby_title`. Résultat : trois champs affichent le même intitulé « table » et surtout le **même nom accessible**
(`detectRegexAria` → « Règle table — regex » ×3). Impossible de savoir laquelle est la classe de fenêtre, laquelle
l'id de table, laquelle la table en chargement — ni à l'œil, ni au lecteur d'écran, ni en test. Ajoute un
`label: string` à `RuleDraft` (ou un `field: string` que l'app traduit) et fais porter l'aria-label dessus.

**c) `RoomProfileWizard.tsx` + `MetrologyStation.tsx` — deux boutons « Interrompre » dans la station 2.**
Le voile porte `t.interrupt` = « Interrompre » (quitter le wizard) et la station 2 porte `t.metroCancel` =
« Interrompre » (arrêter le run de mesure). Deux gestes très différents, même mot, à 3 cm l'un de l'autre : l'un
range l'écran, l'autre abandonne une campagne de 40 s. Renomme `metroCancel` (« Arrêter la mesure » ?) ou
`interrupt` — au choix, mais ils ne peuvent pas rester homonymes.

**d) `MetrologyStation.tsx` — la rangée d'actions déborde sous le panneau des résultats.**
À la largeur réelle de l'app (1280 de fenêtre, ~1030 de zone de contenu), le `<span className={styles.grow} />`
pousse « Committer la mesure » hors de la colonne centrale : le bouton passe SOUS le panneau « Contraintes
mesurées » et seule sa moitié gauche reste cliquable. Capture d'écran à l'appui côté e2e (le clic au centre est
intercepté par `_inspector_`). Le parcours e2e doit viser la gauche du bouton pour le déclencher.

**e) `PipetteTool.tsx` — la rangée d'une suit déborde dès qu'elle a une couleur.**
Une fois `s.color` défini, la rangée porte pastille + `♠ #1E2025` + « Prélever » + « Garder comme référence » :
le texte de la couleur passe **sous** les deux boutons et devient invisible. Le joueur ne peut donc pas relire la
couleur qu'il s'apprête à garder comme référence — c'est précisément l'information que le geste demande de juger.

**f) `GlyphTool.tsx` — pas de sélecteur de ZONE : les rangs A/T/J/Q/K sont inextractibles.**
Le contrat porte `MeasureState.activeZoneId`, mais aucune surface ne le lit ni ne permet d'en changer :
`GlyphTool` rend `truth.zoneId` en simple `<span>` et l'app ne peut adresser qu'une seule ROI (chez nous le
montant du pot). Conséquence directe : les codes `A`, `T`, `J`, `Q`, `K` — qui ne se lisent que dans une ROI de
CARTES, pas dans un montant — ne peuvent jamais être extraits, et la station 5 ne peut pas atteindre 17/17 sur une
room fraîche. La ligne « Glyphes » du score reste rouge par construction, donc le badge « prêt » est inatteignable.
Il faut un `<Select>` de zone à côté du sélecteur de capture (même forme), alimenté par `data.zones`.

**g) `CalibrationCanvas.tsx` — un point de sonde n'est plaçable par aucun chemin : la pipette est un cul-de-sac.**
Le contrat porte bien `CalibrationCanvasData.probes`, mais rien ne l'alimente et rien ne le manipule :

- **Le passage manque.** `AdjustStation.tsx` (station 4) et `RoomProfileBench.tsx` (établi) construisent leur
  `CalibrationCanvasData` sans `probes` — zéro occurrence dans le drop. `ProbeDot` n'est donc jamais rendu.
  (Côté app c'est cohérent : les sondes ne sont pas des `Zone`, elles vivent dans `points` et se rendent en `Probe`.)
- **L'affordance manque.** Même alimenté, `ProbeDot` (`CalibrationCanvas.tsx:111`) est un `<button>` dont le seul
  geste est `onClick` → `on.onSelectZone?.(null)` : pas de protocole `pointerdown`/drag comme `ZoneBox`, et aucun
  callback pour rapporter une position — `CalibrationCanvasCallbacks` porte `onMoveRoi(sizeId, zoneId, next: Rect)`
  pour les zones, rien pour un point.

Conséquence produit, mesurée sur une room migrée (`[sizes.points]` vide — l'état de sortie de la migration v3, et
celui de tout bucket pas encore seedé) : `probe.fold/call/raise` n'ont aucun point, donc la pipette ne peut rien
prélever. Nous venons de retirer côté app les coordonnées de repli qui masquaient le trou (elles faisaient prélever
la couleur à un endroit que personne n'avait désigné, puis verdir la ligne « Sondes + palette » du score sur une
provenance fabriquée — interdit par la Constitution). Le backend résout désormais le point sur le bucket et refuse
sans lui, refus rendu verbatim. La station 5 est donc un cul-de-sac sur une room fraîche, exactement comme l'outil
glyphes pour A/T/J/Q/K (§4f) : la ligne « Sondes + palette » reste rouge par construction et le badge « prêt » est
inatteignable.

Ce qu'il nous faut : (1) que les stations 4 et l'établi passent `probes` au canvas — la donnée est déjà là ; (2) un
geste de POSE/déplacement sur `ProbeDot` : le même protocole de drag que `ZoneBox` plus un callback de position
(forme attendue : `onMovePoint(sizeId, pointId, next: { x, y })`, en % de fenêtre comme `Rect`), et un état visible
« pas encore posée » pour que le mainteneur voie ce qui reste à poser. Un point se pose d'UN clic/glissé sur la
capture — jamais en tapant des coordonnées.

Même besoin pour la palette : la spec fait désigner au mainteneur le pixel de référence d'une suit sur une capture,
exactement comme pour un bouton. Faute de ce geste, l'app prélève au centre de la zone de cartes calibrée du bucket
et refuse quand il n'y en a aucune — honnête, mais ce n'est pas le pixel que le mainteneur aurait pointé. La même
affordance servirait les deux (`SuitSwatch` n'a pas de `point` : il en faudrait un si tu ouvres ce geste).

**h) Rappel des deux surfaces toujours absentes.** Le verdict d'« Écrire le profil » (confirmation + blockers
backend rendus verbatim) et la note de transition d'un profil jamais calibré en v3 n'ont toujours pas de surface :
elles restent des blocs app-side non stylés.

## Rappel — toujours en attente

L'itération « conflits de hotkeys de presets résolus inline » (`doc/ds-report-0.5.1-preset-hotkey-conflicts.md`)
reste due — indépendante de v3.
