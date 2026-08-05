# Tatami app → Claude Design — drop RoomProfile v3 (2026-08-04) : importé, gates PAS clean + 1 trou de contrat

Le drop de prod v3 est **importé** (`pnpm import-ds`, sync 71 fichiers OK, keepGlob ×2 respecté, sketches bien
sortis). La structure est exactement la convergence : vue discriminée, `CoverageMatrix`/`CalibrationCanvas`
publics, `RoomProfileCalibration` retiré — merci, du beau travail. MAIS l'export n'est pas gate-clean (§0,
c'est la seule exigence DURE du contrat) et il manque un morceau de contrat acté (§1). Le côté app est en
cours de recâblage sur ton nouveau contrat — on ne touche à AUCUN de tes fichiers ; corrige à la source.

## 0 — GATES ROUGES dans l'export (à corriger pour le prochain drop, re-export drop-in)

**ESLint (@stylistic, résidu NON mécanique après notre `lint:fix`) — 21 erreurs, 2 fichiers :**
- `ui/screens/RoomProfileWizard.tsx` : 20 (indent ×12, multiline-ternary ×4, no-extra-parens ×3,
  no-confusing-arrow ×1)
- `ui/screens/CoverageMatrix.tsx` : 1 (no-confusing-arrow)
Le bundle `ds-lint-bundle` de l'exchange reproduit ces règles chez toi — passe-le sur l'export avant de livrer.

**react-doctor (bar = ZÉRO warning) — 3 :**
- `ui/screens/RoomProfileTools.tsx:114` et `:196` — Maintainability « Multiple components in one file » :
  `GlyphTool`/`MetrologyStation`/`PipetteTool` cohabitent ; découpe en fichiers (un composant exporté par
  fichier, comme le reste du DS).
- `ui/screens/RoomProfileWizard.tsx:107` — Performance « Array lookup inside a loop » : sors la recherche de la
  boucle (Map/index précalculé).

tsc au niveau de TES fichiers : 0 erreur — propre.

**Et 2 trous de rendu constatés au câblage du container (chrome app INTERIM posé en attendant, à reprendre
dans le DS) :**
- `data.rejection` n'est rendu NULLE PART dans l'écran v3 (le contrat le porte, GlowConfig le rend depuis
  l'itération 07-10) — il nous faut sa surface (bannière/inline, ton choix) dans RoomProfile.
- Aucun bouton **purge** d'un bucket tombstone dans le bench alors que la string i18n `purge` est livrée —
  ajoute le contrôle (confirmation deux temps) dans le rail de cycle de vie ou l'inspecteur.

## 1 — TROU DE CONTRAT : les variantes différables ont disparu

La clarification actée (2026-07-29, reprise dans le feu vert) : une variante du catalogue peut être marquée
**« différée »** (avec motif + date, ex. all-in confirm introuvable en micro-limites) ; elle **sort de la
conjonction du badge** mais reste **visible « différée » dans la matrice**, listée à part dans le readiness.
Le contrat livré ne la porte pas :

- `VariantDef` n'a ni état (`active | deferred | disabled`) ni `reason`/`at` — seulement `source: "kind" | "room"`.
- `CellState` n'a pas d'état `deferred` (verified/captured/missing/stale/na seulement).

Demande pour le prochain export :
- `VariantDef` : + `state: "active" | "deferred" | "disabled"` (défaut active), + `reason?`/`at?` (posés quand
  deferred) — le backend fournit ces champs.
- `CellState` : + `"deferred"` — cellule rendue distinctement (ni missing ni na), tooltip/aside montrant motif+date.
- Readiness : les variantes différées listées à part (hors conjonction) — une ligne/zone dédiée ou un encart,
  ton choix visuel ; la donnée arrivera dans `Readiness` (dis-nous la forme que tu retiens).
- La matrice garde ses filtres ; ajoute `deferred` aux chips si naturel.

## 2 — Notes (pas de changement de structure demandé)

1. **`maxShotsPerSize` : la valeur réelle est 16** (relevée de 8 côté app, SC-009). C'est déjà une prop — mets
   simplement 16 dans la fixture pour que la parité colle au produit.
2. **Glyphes : le vocabulaire runtime compte 17 codes** (0-9, séparateur, devise, A/T/J/Q/K) — pas de code
   `dot` distinct du séparateur dans le moteur. La grille est déjà data-driven (`glyphs: GlyphCode[]`), donc rien
   à casser : retire `dot` de la fixture et évite tout « /18 » codé en dur dans les libellés (dérive le total de
   la donnée). Si un jour une room distingue `.` et `,`, le moteur ajoutera un code et la donnée suivra.
3. **Wizard stations 1 et 6** : `WizardState` ne porte que `metrology`/`tour`/`measure`. Comment
   `RoomProfileWizard` rend-il la station détection (désignation fenêtre table+lobby, règles proposées éditables,
   test live — il nous faut bien une surface pour ça) et la station validation (dry-runs par bucket, écriture du
   profil) ? Si c'est rendu depuis `RoomProfileData` (stations/readiness/sizes), dis-le explicitement ; s'il
   manque un état wizard `detect` (candidats de fenêtres + proposition + résultat de test), il nous le faudra —
   propose la forme.

## 3 — TROUS DE RENDU constatés en câblant TOUT l'écran (les 6 stations sont maintenant branchées)

Depuis le premier envoi, l'app a câblé les vues spine / coverage / bench et les stations 2 (métrologie),
3 (tour), 5 (mesures). À chaque fois qu'un geste du parcours n'avait pas de surface DS, on a posé un contrôle
**app INTERIM** (non stylé, hors `ui/`) pour ne pas bloquer — chacun est une dette à reprendre chez toi. Liste
complète, par ordre de gêne :

**Actions sans aucune surface DS (contrôle app interim posé) :**
1. **Métrologie (station 2)** — aucun bouton pour *Mesurer* / *Interrompre* / *Relancer une phase* / *Committer
   la mesure*. Le contrat porte pourtant `onRunMetrology`, `onCancelMetrology`, `onRetryPhase` : il leur faut
   leurs déclencheurs dans la station.
2. **Outil de la station 5** — `onSelectTool` existe dans le contrat, aucune bascule pipette ↔ glyphes rendue.
3. **Enregistrer les gabarits** — le bouton « Enregistrer les templates » de `RoomProfileTools.tsx` (~l.220)
   n'a **aucun `onClick`** : il ne peut rien déclencher. On sauve donc au fil de l'eau après une relecture verte,
   ce qui n'est pas le geste que tu as dessiné.
4. **Purge d'un bucket tombstone** — la string i18n `purge` est livrée, aucun bouton ne l'utilise (déjà signalé).
5. **`data.rejection`** — porté par le contrat, rendu nulle part (déjà signalé ; GlowConfig le rend depuis 07-10).

**Gestes rendus mais sans la donnée qu'ils exigent :**
6. **« Corriger… » (re-labelliser une capture)** émet `onCorrectLabels(sizeId, shotId, variantIds)` avec
   `shotId = ""` — il n'y a pas de sélecteur de capture dans le tour. On retombe sur « la dernière capture du
   bucket », ce qui est faux dès qu'on veut corriger une capture antérieure. Il faut soit un sélecteur, soit
   que la vignette du filmstrip porte le `shotId`.
7. **Déclaration de variante imprévue** — `onDeclareVariant(group, label)` est appelé sans saisie utilisateur :
   aucune surface pour taper le libellé. On pose « Variante imprévue » + id auto, ce qui vide le geste de son sens.
8. **Vérité-terrain des glyphes** — `onSetGlyphTruth(zoneId, shotId, value)` sans sélecteur de shot : on cible
   le shot primaire. Or la vérité se saisit précisément sur le shot où le montant est net.
9. **Adoption d'une suit** — pas d'affordance par couleur (le contrat a `onSampleSuit`, pas d'équivalent
   « adopter » comme `onAdoptTolerance` pour les sondes) ; on adopte donc dès l'échantillon, sans confirmation.
10. **Confirmation de fenêtre avant le tour** — aucune surface : le deep-link « capturer » franchit la porte
    détection tout seul. Si la station 1 arrive (cf. §2.3), elle doit porter ce geste.

**Donnée à corriger dans les fixtures :** `MeasureState.glyphs` liste **18** codes (avec `dot`) — le moteur en a
**17** (cf. §2.2). L'app sert les 17 ; ta fixture diverge du produit et tire la pixel-parity.

## 4 — État de la parité (pour information)

`pnpm test:pixel-parity` est à **22/25**. Les 3 régions rouges sont toutes « Room profiles » (`rooms-main`,
`rooms-stations`, `rooms-requirements`) et l'écart est **de notre côté, pas du tien** : ton fixture montre un
profil showcase (readiness 73 %, 7 lignes, 6 gestes en file) alors que l'app rend la dérivation HONNÊTE du profil
réel (encore partiel). Ça converge à mesure que les stations se branchent — aucune action attendue de toi
là-dessus, c'est juste pour que tu ne t'inquiètes pas d'un rouge dans nos rapports.

## 5 — AJOUTS (après câblage complet des 6 stations + parcours e2e de bout en bout)

**a) Les 21 erreurs ESLint du §0 ne sont PAS auto-corrigeables — vérifié.** On a passé `eslint --fix` dessus :
le fichier ressort **identique**, les 21 erreurs restent. Ce n'est donc pas un oubli de formateur de ton côté,
c'est du lint structurel (indentation de blocs JSX imbriqués, ternaires multi-lignes, parenthèses superflues,
arrow-functions ambiguës) qui demande de retoucher le code. **C'est bloquant pour nous** : le job CI `quality`
est bloquant et n'accepte aucune suppression (règle du repo, sans exception) — donc tant que ces 2 fichiers
sortent comme ça, la branche Room Profile v3 **ne peut pas être mergée**. C'est aujourd'hui LE dernier obstacle
côté produit ; tout le reste est vert (1088 tests Rust, 325 Vitest, 64 e2e, tsc 0).

**b) L'outil Glyphes ne peut pas atteindre la couverture complète.** `GlyphTool` ne cible que la zone `pot`
(`activeZoneId: "pot"`, et `truths[0].zoneId` reste `pot` après extraction) : il n'y a **aucune affordance pour
choisir la zone**. Or les codes de rangs `A/T/J/Q/K` ne s'extraient que d'une zone `card` (`board`, `hero_cards`).
Conséquence : la ligne « glyphes » du score de préparation **ne peut jamais verdir** par l'UI seule, donc le badge
non plus — le parcours a un cul-de-sac. Il faut un sélecteur de zone sur l'outil (les zones candidates sont celles
qui portent un `glyphs` dans le profil : montants ET cartes).

**c) Nit** — `RoomProfileBench` initialise `useState<string | null>("bet-button")`, mais l'id de zone du
vocabulaire v3 est `bet_button` (underscore, c'est la clé TOML). L'inspecteur s'ouvre donc toujours vide au lieu
de présélectionner le bouton de mise. Même famille : vérifie les autres ids en dur (`bet-input`, `bet-blur`,
`hero-cards`…) — le contrat dit « l'id de zone DS EST la clé TOML », donc underscore partout.

## 6 — Demandes issues du câblage terminé (revue + analyse de cohérence)

Toutes les stations sont câblées et le parcours complet passe en e2e. Ces points-là ne nous bloquent plus
(contrôles app interim posés), mais ils sont dans TON périmètre et devraient revenir dans le DS :

1. **`onReVerify` perd le `variantId`** (`RoomProfile.tsx:242` : `onReVerify: sizeId => onRunDryRun?.(sizeId)`) —
   « revérifier » relance donc TOUT le bucket au lieu de la cellule, et l'affordance n'est offerte que sur
   `missing`/`stale`, jamais sur `captured`/`verified` (donc on ne peut pas revérifier ce qui est déjà attesté).
   Attendu : `onReVerify(sizeId, variantId)` + disponible sur tous les états attestés.
2. **`Evidence` perd deux preuves** — le DTO backend porte `labelConfirmedAt` et `lastVerdict`, le type DS
   `Evidence` ne les a pas : le bloc « dernier verdict » de `CoverageMatrix.tsx:90` est donc mort en production.
   Et `cropRect` est bien transmis mais le CSS l'ignore (`background-size: cover` sur le shot entier), donc la
   vignette d'évidence ne montre pas la zone. Attendu : les 2 champs au contrat + le crop réellement appliqué.
3. **Grain de la matrice** — libellé et badge statiques, aucun champ `grain` ni rappel dans
   `CoverageMatrix.fixtures.ts`. Soit tu l'ajoutes, soit on retire l'exigence côté spec (dis-nous).
4. **`onDeclareVariant("Actions", "")`** — appelé sans zone ni libellé saisissables (cf. §3.7). Et la variante
   déclarée devrait pouvoir être attestée par la capture en cours, ce que le flux `wouldAttest` (perception)
   ne permet pas : il faudrait que la déclaration s'ajoute aux labels de la capture.
5. **`RoomProfileBench`** initialise `selectedZoneId` à `"bet-button"` — l'id réel est `bet_button` (§5c).
   Confirmé maintenant que le catalogue de zones vient du profil : les ids sont les clés TOML, toujours en
   underscore, et ils VARIENT par room (le profil Unibet déclare `board_1..5`, `hero_1/2`, `villain_*` — pas
   `board`/`hero_cards`). Ne code aucun id de zone en dur dans le DS : ils arrivent tous par `data.zones`.

## Rappel — toujours en attente

L'itération « conflits de hotkeys de presets résolus inline » (`doc/ds-report-0.5.1-preset-hotkey-conflicts.md`)
reste due — indépendante de v3.
