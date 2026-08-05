# Tatami app → Claude Design — RPv3.2 (3 diagnostics ouverts) + la 0.5.1 hotkeys presets, ENFIN livrée

Deux sujets. Le second est une **erreur de notre côté**, et tu as eu raison de la signaler.

---

# A — Mea culpa : la demande 0.5.1 « hotkeys de presets » ne t'était jamais parvenue

Tu écris qu'elle est « toujours en attente de son rapport sur le repo d'échange ». C'est exact, et ce n'est pas
toi qui l'as manquée : **on ne te l'avait jamais envoyée.**

Ce qui s'est passé : le document existe depuis la 0.5.1, mais **dans NOTRE repo**
(`doc/ds-report-0.5.1-preset-hotkey-conflicts.md`). Notre outil de publication n'écrit qu'un seul fichier,
`report.md`, et la saga Room Profile v3 l'occupe sans discontinuer depuis le 29 juillet. À chaque itération on
ajoutait en pied de rapport une ligne « rappel : l'itération hotkeys presets reste due » **qui pointait ce chemin
local** — donc une adresse à laquelle tu n'as aucun accès. De ton point de vue, il y avait un rappel récurrent
pour une demande dont le contenu n'était nulle part. Désolé pour le temps perdu.

**Corrigé de deux façons :**
1. La demande complète est désormais sur l'échange dans son propre fichier durable : **`hotkeys-presets.md`**
   (à la racine, à côté de `report.md` et `contract.md`). Il ne sera pas écrasé par les rapports suivants.
2. Son contenu intégral est recopié ci-dessous en §C pour que tu l'aies sous les yeux sans changer de fichier.

À l'avenir, toute demande indépendante du sujet courant partira comme ça : un fichier nommé sur l'échange, plus
un renvoi explicite depuis `report.md`. Plus jamais de renvoi vers un chemin de notre repo.

---

# B — RPv3.2 : les 3 diagnostics encore ouverts

Rappel de l'état, pour que tu ne perdes pas le fil de l'itération en cours : le drop v3.2 a traité **les 10 points**
du rapport précédent. `lint` ✓, `tsc` ✓, et côté app on a tout câblé — pose de pixels, sélecteur de ROI des glyphes,
verdict d'écriture, note de transition. **Il ne reste plus aucune surface app intérimaire.** Le parcours e2e complet
pose maintenant les pixels de sonde par l'interface et gagne 17/17 glyphes à l'écran.

Restent 3 diagnostics `react-doctor` (barre = zéro, erreurs ET warnings, job CI bloquant, aucune suppression permise) :

**1. `ui/screens/CalibrationCanvas.tsx:335` — deux diagnostics sur le même nœud**
*Click handler missing keyboard handler* + *Interaction on static element*.
C'est le geste de pose que tu viens d'ajouter : le clic qui pose le pixel est porté par un élément non interactif,
sans chemin clavier. Concrètement, un mainteneur qui ne vise pas à la souris ne peut poser aucun pixel, et le nœud
n'est ni atteignable au clavier ni annoncé par un lecteur d'écran. Le canvas a déjà le bon patron ailleurs (les
poignées de ROI sont de vrais `<button>`). Piste : surface de pose en `<button>` plein cadre, et déplacement fin
aux flèches une fois le point sélectionné — au passage plus précis qu'un drag pour un pixel unique.

**2. `ui/screens/RoomProfile.tsx:102` — *Array index used as a key*.**
Pas cosmétique : dès que la liste est réordonnée, filtrée ou qu'un élément est inséré, React réconcilie sur le
mauvais nœud (état local, focus, animations partent sur la mauvaise ligne). Une clé stable issue de la donnée.

**3. Logistique — `manifest.json` porte toujours `"version": "2026-08-05"`**, comme les deux exports précédents.
C'est le 3ᵉ contenu différent sous la même étiquette ; notre importeur l'affiche et notre lockfile la trace, donc
deux drops indiscernables compliquent le diagnostic quand on remonte un défaut. Un suffixe (`2026-08-05.3`) suffit.

**Trois détails relevés en câblant** (non bloquants, à ta main) :
- `PipetteTool` affiche le même texte pour « pas de pixel posé » et « pixel posé mais pas encore prélevé » — donc
  « aucun pixel de référence — rien à prélever » s'affiche à côté d'un bouton « Prélever » qui fonctionne.
- `AdjustStation` ne passe pas `selectedPointId` : dans le wizard, le pixel sélectionné n'est pas mis en évidence
  (l'établi, lui, le fait).
- Le `zoneOptions` du `GlyphTool` filtre sur `kind === "data"`, plus large que la règle moteur (`number`/`card`) :
  les sous-ROI `actions.*` sont proposées et le backend les refuse — l'option ne devrait pas exister.

---

# C — La demande 0.5.1, en intégral

*(également sur l'échange dans `hotkeys-presets.md`)*

## Contexte

Release corrective 0.5.1 de l'overlay de mise (feature 019). Côté app + moteur, les hotkeys de presets de sizing
sont désormais **routées au clavier** (les chiffres 1-4 du ladder arment le preset correspondant, comme le clic) et
une collision de hotkey de preset ne **rejette plus** toute la section `[sizing]` au chargement — le preset est
simplement livré non bindé. La décision produit (Romain) : **gérer les conflits de hotkeys de presets comme tous les
autres bindings, dans l'onglet « Hotkeys & bets »** — la même UX inline « Collides with … / Pick another / Take it »
que les actions, le kill-switch et les bascules de layout.

Cette UX vit dans des fichiers **DS-owned** (`Hotkeys.tsx`, `BetSizing.tsx`, `i18n.ts`), donc elle ne peut pas être
portée côté app sans casser `check:ds-sync` — d'où cette demande.

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

## Priorité

À ta main : elle est **indépendante** de Room Profile v3 et ne bloque pas la release 0.6.0. Fais-la quand la v3 est
close, ou en parallèle si ça t'arrange — mais elle n'est plus « en attente d'un rapport », tu as tout.
