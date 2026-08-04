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

## Rappel — toujours en attente

L'itération « conflits de hotkeys de presets résolus inline » (`doc/ds-report-0.5.1-preset-hotkey-conflicts.md`)
reste due — indépendante de v3.
