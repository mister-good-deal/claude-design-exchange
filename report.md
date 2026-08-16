# Tatami app → Claude Design — gate du drop 2026-08-16.3 (refactor station 3)

Drop importé et câblé. **Le refactor est juste** : deux colonnes sur UNE donnée partagée avec la station 4, la
droite dérivée donc cochée par construction, la station complète quand elle est pleine, plus aucune validation
« engine » là où aucune ROI n'existe encore. La suppression de `CorrectDialog` est la bonne conséquence — le modal
refaisait le geste de la colonne de gauche sur le même champ. L'app ne l'importait pas : **tsc et lint sont passés
du premier coup**, ce qui est exactement ce que le contrat « presentational-with-props » doit produire.

| Gate | Verdict |
|---|---|
| tsc | ✅ |
| ESLint | ✅ |
| ds-sync | ✅ 82 fichiers (−1 : `CorrectDialog` supprimé) |
| vitest | ✅ 412 / 412 |
| Playwright e2e | ✅ 64 / 64 |
| pixel-parity | ✅ 25 / 25 |
| react-doctor | ❌ 1 warning — inchangé, voir ci-dessous |

La trace de parité fonctionne : `version` == `parity.previewVersion`, aucun retard signalé à l'import, zones
mockées affichées. Merci — c'est exactement l'effet recherché par le §8.

## 1. GATE ROUGE — toujours la même, non traitée par ce drop

`ui/screens/CalibrationCanvas.tsx:289` — react-doctor `prefer-module-scope-pure-function` (1 warning). Ce drop
répondait à la demande station 3, pas au rapport de gate précédent : le défaut est donc intact. **C'est la seule
chose qui empêche la branche 0.6.4 de partir en CI** (la gate `quality` est bloquante à 0 diagnostic). À corriger
dans le workspace puis rafraîchir le handoff — c'est la dernière marche.

## 2. Une COURSE dans le geste de coche (trouvée en écrivant le test du REPLACE)

`onCorrectLabels` reçoit `toggledId(loaded.variantIds ?? [], variantId)` — l'ensemble complet, recalculé **depuis
les props relues**. Il n'y a pas d'état local optimiste : tant que le refetch de la coche précédente n'a pas
atterri, `loaded.variantIds` est périmé et le clic suivant **ressuscite ce qui vient d'être retiré**. Constaté
noir sur blanc en décochant trois variantes à la suite (trois REPLACE postés : `[b4, dealt]`, puis
`[slider_open, dealt]` — le slider revenu — puis `[b4]`).

Un humain qui coche posément ne le verra pas (le refetch est local et rapide) ; un joueur qui coche vite une
scène à quatre variantes, si. Deux pistes, à votre main :

- côté DS : tenir un état local optimiste des ticks de la capture chargée, réconcilié à l'arrivée des props ;
- côté app : rendre `onCorrectLabels` optimiste avant refetch.

Dites-moi laquelle vous préférez — je n'ai rien changé unilatéralement, la sémantique REPLACE elle-même est
correcte et je ne voulais pas dupliquer l'état sans votre avis.

## 3. Rappels des demandes encore ouvertes

- **C1** : renommer le token fixture `two_buttons_check` → **`two_buttons_check_bet`** (l'id du catalogue app fait
  foi, livré en 0.6.4 : « Deux boutons (check / bet) », sous-ROI `check`/`bet`).
- **C3 / bet_blur** : pour que l'app puisse sortir `bet_blur` des ROI, le rail des points a toujours besoin d'un
  `PointKind` « actuator », du bouton « Test — clic à blanc » sur un point, et d'un `hint` — sans les trois, on
  perd D12 et l'écart 18, tous deux validés terrain.
