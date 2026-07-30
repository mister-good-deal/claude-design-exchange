# Report — itération demandée : capture des boutons souris dans le rebind Hotkeys

**Verdict de l'import précédent (0.5.3)** : gate-clean, en production. BetSizing (molette seule + `MButton` pour la
mise) et l'éditeur Hotkeys sont OK. Aucune erreur en attente. Ceci est une **demande de capacité**, pas une correction.

## Contexte / problème

Le backend rend désormais **trois boutons souris bindables** en plus du clavier : clic molette et les **deux boutons
latéraux** (pouce). Toute la plomberie app + backend est déjà en place :

- backend `Hotkey::parse` / `to_canonical` nomment ces VK : `MButton` (0x04), `XButton1` (0x05), `XButton2` (0x06) ;
- le hook global `WH_MOUSE_LL` les avale/route exactement comme une touche (mêmes gates/failsafes) ;
- côté app (fichiers **app-owned**, hors DS) `apps/web/src/ipc/hotkey.ts` mappe déjà ces labels :
  `labelToVk("XButton1") === 0x05`, `vkLabel(0x05) === "XButton1"`, `labelsToChord([...])`, etc. ;
- `HotkeysContainer` (app-owned) convertit déjà un **label** reçu de l'écran en binding.

**Mais l'écran de rebind ne capture que le clavier**, donc ces boutons ne sont bindables qu'en éditant le TOML à la
main → **inutilisable pour l'utilisateur**. Il manque UNE chose, côté DS : que la capture reconnaisse aussi un clic de
bouton souris et **émette le label correspondant** dans le même chemin que les touches.

## Ce qui est demandé (DS-owned)

Dans le flux de capture de rebind (`apps/web/src/ui/screens/Hotkeys.tsx` : `rebind`, `rebindKill`, et le partage via
`apps/web/src/ui/keyCapture.ts`) :

1. **`keyCapture.ts`** — ajouter à côté de `captureKeyLabel(e: KeyboardEvent)` un
   `captureMouseLabel(e: MouseEvent): string | null` :
   - `e.button === 1` → `"MButton"`
   - `e.button === 3` → `"XButton1"` (bouton latéral « précédent »)
   - `e.button === 4` → `"XButton2"` (bouton latéral « suivant »)
   - `e.button === 0` (gauche) et `e.button === 2` (droit) → `null` (jamais bindables : casserait le clic normal).
2. **`Hotkeys.tsx`** — pendant une capture active (les deux flux `rebind` et `rebindKill`), s'abonner AUSSI à
   `mousedown` en phase capture (comme le `keydown` actuel), `preventDefault()` + `stopPropagation()` (pour qu'un clic
   molette ne déclenche pas l'autoscroll/collage et qu'un bouton latéral ne navigue pas back/forward), passer le label
   de `captureMouseLabel` **dans le même chemin** que `captureKeyLabel` (détection de conflit `findOwner`, puis
   `on.onRebind` / `fireSizingRebind`, ou pour le kill `[...mods, main]` avec `mods` lus sur `e.ctrlKey/…`).
   `null` ⇒ ignorer (comme une touche non supportée). Bien retirer le listener `mousedown` dans `stopListen`/`cancel`.
3. **Micro-copie** — l'invite « Press a key… » (état `listening`/`listenKill`) devient « Press a key or mouse
   button… » (i18n en/fr).

L'app se charge du reste : le label émis (`MButton`/`XButton1`/`XButton2`) est déjà converti en VK et bindé, et
`chordLabel`/`vkLabel` le réaffichent sur le keycap. **Le contrat, ce sont ces trois labels exacts.**

## Contraintes (inchangées)

- Screens **présentationnels-avec-props** : aucune IPC dans l'écran, la capture émet un label via le callback `on.*`
  existant (pas de nouveau canal).
- **Gate-clean** non négociable : react-doctor zéro diagnostic, pixel-parity dans les seuils (la baseline est
  rebâtie depuis `standalone.entry.tsx`), tsc strict, ESLint.
- Périmètre : les rebinds Hotkeys (actions / presets de sizing / layout-switch / kill). Le clic gauche/droit n'est
  jamais une cible.

## Après l'export

`pnpm import-ds --latest` de mon côté (drop-in), puis vérif : binder un bouton latéral depuis l'UI, round-trip label
↔ TOML, zéro régression parité. Je réponds par un nouveau `report.md` avec le verdict.
