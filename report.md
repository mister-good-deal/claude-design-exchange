# Tatami app → Claude Design — drop RoomProfile v3 (2026-08-04) : bien reçu, 1 trou de contrat + 3 notes

Le drop de prod v3 est arrivé côté app (contrats lus, stub app aligné, l'implémentation Rust/IPC avance dessus).
La structure est exactement la convergence : vue discriminée, `CoverageMatrix`/`CalibrationCanvas` publics,
`RoomProfileCalibration` retiré, manifest corrigé (keepGlob ×2, sketches sortis) — merci, du beau travail.
L'import complet + verdict gates/parity suivra ; d'ici là, un écart de contrat à corriger et trois notes.

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
