# Tatami app → Claude Design — iteration request (0.6.2) : clic droit bindable dans les flux de rebind

Contexte : décision produit — **le clic droit devient un raccourci bindable** comme le clic molette et les boutons
latéraux. Le back-end le représente, le persiste (`RButton` en TOML, VK 0x02) et l'avale déjà (hook souris global,
même gate « table active au premier plan » que le clavier — hors table, le clic droit passe intact). Le menu
contextuel webview est supprimé app-wide au point d'entrée Tauri (côté app, hors DS) : un clic droit dans Tatami
n'ouvre plus le menu debug de wry. Le changement DS est minime et touche `keyCapture.ts` + le commentaire de
`Hotkeys.tsx` — il a été appliqué côté app en avance de phase (rail 0.5.3 `MButton`), cette itération le fait
absorber par l'export pour que le prochain drop-in ne le régresse pas.

## Demande — `keyCapture.ts` : capturer le CLIC DROIT dans les flux de rebind

1. **Capture** : `MOUSE_MAP` gagne l'entrée `2: "RButton"` (casse EXACTE — nom canonique que le back-end
   round-trip). Un `mousedown` avec `e.button === 2` pendant l'écoute d'un rebind (action / layout / preset / kill)
   produit donc le label principal `"RButton"` et suit le flux existant à l'identique : détection de conflit, état
   `pending`, `preventDefault` + `stopPropagation` sur l'événement capturé. Les modificateurs de l'événement souris
   se combinent comme au clavier (`["Ctrl", "RButton"]`…).
2. **Le clic gauche (0) reste seul non capturable** — le commentaire au-dessus de `MOUSE_MAP` ne doit plus citer le
   droit comme exclu. Idem pour le commentaire de `bindListeners` dans `Hotkeys.tsx` (« Left and right clicks fall
   through » → seul le gauche tombe en pass-through ; le menu contextuel est déjà supprimé app-wide côté app).
3. **Rendu** : `Kbd` affiche le label `RButton` tel quel, aucun changement de contrat.

Critère de recette : dans « Hotkeys & bets », « Rebind » puis clic droit binde l'action sur `RButton`, le conflit
s'affiche si `RButton` est déjà pris, et le kill-switch accepte `Ctrl+RButton`. Le clic gauche pendant l'écoute
reste ignoré et le bouton Cancel reste cliquable.

## Demande 2 — labels souris HUMAINS et localisés sur les keycaps

Les noms canoniques (`RButton`/`MButton`/`XButton1`/`XButton2`) restent l'IDENTITÉ (capture, détection de conflit,
persistance TOML — casse exacte) mais ne doivent JAMAIS s'afficher tels quels : l'utilisateur doit comprendre le
raccourci bindé. Traduction À L'AFFICHAGE SEULEMENT, sur chaque `Kbd` susceptible de porter un bouton souris :

1. **`i18n.ts`** : un helper partagé `keyDisplay(chord)` par locale — split sur `+`, chaque token souris mappé,
   tout le reste (lettres, F-keys, `Ctrl`…) passe tel quel — exposé comme membre de `HotkeysStrings`,
   `BetSizingStrings`, `OverlayStrings` et `LayoutDesignerStrings` :
   - EN : `RButton` → `Right click`, `MButton` → `Middle click`, `XButton1` → `Mouse 4`, `XButton2` → `Mouse 5`.
   - FR : `Clic droit`, `Clic molette`, `Souris 4`, `Souris 5`.
2. **Sites de rendu à envelopper avec `s.keyDisplay(…)`** : `Hotkeys.tsx` (keycaps des `KeyRow`, chord du
   `PendingNotice`, hotkey des lignes de presets, keycaps du kill-switch), `BetSizing.tsx` (hotkey des presets du
   ladder), `Overlay.tsx` (hotkey du ladder preview + des color tags), `LayoutDesigner.tsx` (raccourcis de layout).
   Les identités (clés React, `conflictFor`, callbacks) restent le nom canonique — seul le contenu du `Kbd` change.

Critère de recette : un preset bindé `RButton` affiche « Clic droit » (FR) / « Right click » (EN) sur son keycap
dans les quatre écrans, un chord kill `Ctrl+RButton` affiche « Ctrl+Clic droit », et le TOML persiste toujours
`RButton`.
