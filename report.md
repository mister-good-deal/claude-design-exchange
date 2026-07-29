# Tatami app → Claude Design — iteration request (0.5.3) : nudge à la molette SEULE + clic molette bindable

Contexte : la session de debug Windows 0.5.2 a trouvé la cause racine de la bet box qui finissait en « . » au
Shift+molette : la pose différée du montant part **pendant que Shift est physiquement tenu**, et le client poker
valide les frappes postées contre l'état clavier physique — avec Shift down, les `VK_NUMPAD*` postés dérivent en
touches de navigation (« Shift inverse NumLock ») et réécrivent le champ entre chaque caractère. Détail complet dans
le repo app : `doc/debug-0.5.2-nudge-saisie-box.md`. Décision produit : **plus aucun modificateur dans le geste de
nudge** — la molette seule au survol du ladder — et, en remplacement des chords à modificateur pour les actions
rapides, **le clic molette (bouton du milieu) devient bindable** comme raccourci d'action. Les deux demandes touchent
des fichiers DS-owned (`BetSizing.tsx`, `Hotkeys.tsx`, `keyCapture.ts`, `i18n.ts`) — d'où cette itération.

## Demande 1 — `BetSizing` : le nudge est la molette SEULE (sans Shift)

1. **Geste** : dans le `onWheel` du ladder, supprimer la condition `e.shiftKey` — le gate devient uniquement
   `data.calibrated`. Aucun changement de contrat (`BetSizingData`/`BetSizingCallbacks` inchangés, `onNudge` déjà en
   place, signe et pas inchangés : `deltaY < 0` ⇒ `+nudgeStepBb`, sinon `-nudgeStepBb`).
2. **Strings i18n** (le Shift ne doit plus apparaître nulle part) :
   - `nudgeHint` : `⇧+molette ±X bb` → `molette ±X bb` (FR) ; `⇧+wheel ±X bb` → `wheel ±X bb` (EN).
   - `betLadderWheel` : `⇧+molette ±0,1` → `molette ±0,1` (FR) ; `⇧+wheel ±0.1` → `wheel ±0.1` (EN).
3. **Note d'intégration** : côté app, le container du ladder intercepte déjà la molette en phase capture
   (`stopPropagation`) et pousse le nudge lui-même — le geste sans Shift fonctionne donc dès la 0.5.3 et il n'y a
   PAS de risque de double nudge pendant la transition. Votre changement aligne la vue (hints) et retire le gate
   mort ; ne pas s'étonner en preview DS que le composant nu réponde aussi à la molette seule après le fix.

Critère de recette : en preview DS, un cran de molette sans aucun modificateur ajuste le montant du ladder calibré
(`±nudgeStepBb`), et plus aucun hint n'affiche `⇧`/Shift.

## Demande 2 — `Hotkeys` : capturer le CLIC MOLETTE dans les flux de rebind

Le back-end sait désormais représenter, persister (`MButton` en TOML, VK 0x04) et avaler le bouton du milieu
(hook souris global, même gate « table active au premier plan » que le clavier). Il manque la capture UI :

1. **Capture** : pendant l'écoute d'un rebind (action / layout / preset / kill), un `mousedown` avec
   `e.button === 1` produit le label principal **`"MButton"`** (casse EXACTE — c'est le nom canonique que le
   back-end round-trip) et suit ensuite le flux existant à l'identique : détection de conflit, état `pending`,
   `preventDefault` sur l'événement capturé. Pour le chord kill-switch, les modificateurs de l'événement souris
   (`ctrlKey`/`altKey`/`shiftKey`/`metaKey`) se combinent comme au clavier (`["Ctrl", "MButton"]`…).
2. **Implémentation suggérée** : un helper `captureMouseLabel(e: MouseEvent): string | null` dans `keyCapture.ts`
   (retourne `"MButton"` pour `button === 1`, `null` sinon — les boutons gauche/droit ne sont PAS capturables), et
   dans chaque flux d'écoute un listener `mousedown` monté/démonté avec le listener `keydown` existant. Échap au
   clavier reste la seule annulation ; un clic gauche/droit pendant l'écoute reste ignoré (pas d'annulation
   implicite, on ne change pas le comportement actuel).
3. **Rendu** : `Kbd` affiche le label `MButton` tel quel (pas de glyphe dédié requis pour cette itération).
   Aucun changement de contrat : les callbacks existants (`onRebind`, `onSetKillChord`, presets) transportent déjà
   des labels de chaînes — `"MButton"` y circule sans nouveau type.

Critère de recette : dans « Hotkeys & bets », « Rebind » puis clic molette binde l'action (ex. `fold`) sur
`MButton`, le conflit s'affiche si `MButton` est déjà pris, et le kill-switch accepte `Ctrl+MButton`.

## Rappel — demande 0.5.1 toujours en attente

Les **conflits de hotkeys de presets résolus inline dans « Hotkeys & bets »** (presets dans le registre de conflit,
retrait du contournement `scope === "preset"`, `ConflictNotice` sur les lignes de presets) restent à livrer. Détail :
`doc/ds-report-0.5.1-preset-hotkey-conflicts.md` dans le repo app.
