# Tatami app → Claude Design — iteration request (0.5.1) : conflits de hotkeys de presets dans « Hotkeys & bets »

Contexte : release corrective 0.5.1 de l'overlay de mise (feature 019). Côté app + moteur, les hotkeys de presets de
sizing sont désormais **routées au clavier** (les chiffres 1-4 du ladder arment le preset correspondant, comme le
clic) et une collision de hotkey de preset ne **rejette plus** toute la section `[sizing]` au chargement — le preset
est simplement livré non bindé. La décision produit (Romain) est : **gérer les conflits de hotkeys de presets comme
tous les autres bindings, dans l'onglet « Hotkeys & bets »** — c.-à-d. la même UX inline « Collides with … / Pick
another / Take it » que les actions, le kill-switch et les bascules de layout.

Cette UX vit dans des fichiers **DS-owned** (`apps/web/src/ui/screens/Hotkeys.tsx`, `BetSizing.tsx`, `i18n.ts`), donc
elle ne peut pas être portée côté app sans casser `check:ds-sync` — d'où cette demande.

## Ce que l'app fournit DÉJÀ (aucun changement DS requis pour ça)

- Le moteur route les hotkeys de presets et gère l'armement clavier. Rien à faire côté DS.
- Le back-end `validate_bindings(registry: BindingRegistryDto)` inclut déjà `raise_presets` dans le registre unifié
  et renvoie les conflits (`conflicts()`), exactement comme pour les actions/bascules/kill. **La plomberie de conflit
  côté domaine est prête** — il ne manque que le câblage DS qui alimente le registre avec les presets et affiche la
  résolution inline sur les lignes de presets.

## Changements demandés (dans les fichiers DS-owned)

1. **Inclure les presets dans le registre de détection de conflit** de `Hotkeys.tsx` (aujourd'hui la construction du
   registre ignore les presets — ils sont traités comme hors-registre). Une hotkey de preset doit entrer en collision
   avec une action / un kill-switch / une bascule de layout, et vice-versa.

2. **Retirer le contournement preset** dans la capture de rebinding : aujourd'hui un rebind de preset saute la
   détection d'owner (`scope === "preset" ? null`), donc aucune UX de conflit ne s'affiche pour les presets. Le
   rebind de preset doit passer par la même résolution d'owner que les autres scopes.

3. **Afficher la résolution inline** (le même `ConflictNotice` / `PendingNotice` : « Collides with … » → « Pick
   another » / « Take it » / « Keep current » / « Move it here ») sur les lignes de presets du `SizingPanel`, comme
   sur les `KeyRow` d'actions/bascules.

4. **Conserver la réutilisation inter-situations** : une même touche (ex. « 2 ») peut légitimement servir dans
   plusieurs situations de sizing (preflop open, 3bet, 4bet…) car **une seule liste street × situation est active à
   la fois**. La détection de conflit pour un preset doit donc porter sur : (a) les autres bindings `[input]`
   (actions / kill / bascules), et (b) les autres presets **de la même liste (street × situation) en cours
   d'édition** — jamais entre listes distinctes. Ne pas signaler « 2 » de preflop.open contre « 2 » de preflop.3bet.

5. **i18n** : réutiliser les chaînes de conflit existantes (`collidesPre`/`collidesPost`/`pickAnother`/`takeIt`/
   `boundToPre`/`keepCurrent`/`moveItHere`, préfixe d'owner `presetPrefix` déjà présent) pour les lignes de presets —
   plus besoin de s'appuyer sur le message de rejet back-end brut.

## Comportement back-end à connaître (pour cadrer l'UX, rien à implémenter côté DS)

- **Chargement** d'un profil dont une hotkey de preset collisionne : NON bloquant — le preset est livré non bindé
  (pas d'erreur). Donc au montage de l'onglet, un preset peut apparaître déjà « non bindé » là où l'utilisateur avait
  posé une touche en conflit : c'est voulu.
- **Commit** (`update_sizing`) : NON bloquant également (une hotkey en conflit est committée non bindée, pas de rejet
  dur — pour ne pas empêcher une édition sans rapport quand un conflit préexiste). C'est précisément pourquoi l'UX
  inline est nécessaire : c'est elle qui doit **empêcher / signaler** le conflit AVANT commit, comme pour les actions
  (le client appelle `validate_bindings` et propose la résolution), plutôt que de laisser la touche « disparaître »
  silencieusement.

## Critère de recette

Dans l'onglet « Hotkeys & bets », rebinder un preset sur une touche déjà prise (par une action, une bascule, le kill,
ou un autre preset de la MÊME liste) affiche la même UX de conflit que pour une action, et la même résolution ; poser
la même touche sur deux listes de situations différentes ne déclenche AUCUN conflit.
