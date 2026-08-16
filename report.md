# Tatami app → Claude Design — gate du drop 2026-08-16 (réponse au rapport terrain 0.6.3)

Drop miroité depuis `_handoff/tatami-ui-package/`, importé, gates jouées. **Le bloc `parity` du manifest est ADOPTÉ**
— l'importeur lit désormais `parity.previewVersion` / `previewOnly` / `mockedInPreview` (le contrat `contract.md`
§2/§8 est mis à jour dans ce sens). Merci pour la couverture du rapport : A1, A2 (les onglets, enfin), A3
(ZoneWorkbench partagé — la bonne réponse, structurelle), B1, B2, C2, D1, D2 et le mandat de parité honoré.

## GATE ROUGE — une correction attendue à la source

- **react-doctor** : `ui/screens/CalibrationCanvas.tsx:289` — `prefer-module-scope-pure-function` (1 warning,
  gate CI bloquante à 0 diagnostic). À corriger dans le workspace puis rafraîchir le handoff ; aucun autre
  diagnostic, lint et tsc verts côté DS après recâblage app (ci-dessous).

## Incohérence transitoire attrapée à l'import (info importante pour la boucle)

Au premier miroir, le handoff portait la **TourStation v1** (3 colonnes, `tourCounters` à 3 arguments,
`onDeclareCoverage`) avec l'`i18n.ts`/`fixtures` v2 (`tourColShot`/`tourColAll`, `tourCounters` à 2 arguments) —
tsc rouge immédiat, exactement la classe de fuite de l'écart 29, cette fois VUE à l'import grâce aux gates. Une
relecture a trouvé la TourStation v2 cohérente : le handoff bougeait pendant l'import. Deux demandes :

1. **Rafraîchir le handoff en BLOC cohérent** (jamais un composant en avance sur son contrat i18n/fixtures).
2. **Bump `manifest.version` + `parity.previewVersion` à CHAQUE rafraîchissement du handoff** — le miroir est lu en
   direct ; un handoff partiellement rafraîchi sous version inchangée est invisible pour l'importeur.

## Demandes restantes (non bloquantes pour ce drop, à embarquer dans le prochain)

- **C1 — id de la variante check/bet** : l'id app autoritaire est `two_buttons_check_bet` (catalogue backend livré
  en 0.6.4 : « Deux boutons (check / bet) », sous-ROI `check`/`bet`). Renommer le token fixture
  `two_buttons_check` → `two_buttons_check_bet` pour que preview et app parlent la même langue.
- **C3 — bet_blur en point** : vos fixtures le déplacent (`probe.blur`) mais le rail des points n'a toujours ni
  `PointKind` « actuator », ni bouton « Test — clic à blanc » sur un point, ni `hint` — les trois conditions posées
  au rapport pour que l'app bascule le rôle sans régresser D12/écart 18 (validés terrain). L'app garde donc
  `bet_blur` en zone actuator au runtime en attendant.
- **Station 3** : Romain prévoit une nouvelle passe de conception — le modèle v2 (coches par capture + colonne
  dérivée) est intégré côté app ; attendez son brief avant de retoucher.

## État côté app — VERDICT COMPLET

Le drop est **intégralement câblé et vérifié**, une seule gate reste rouge et elle est chez vous (doctor ci-dessus).

| Gate | Verdict |
|---|---|
| tsc | ✅ |
| ESLint | ✅ |
| ds-sync | ✅ 83 fichiers DS |
| vitest | ✅ 412 / 412 |
| Playwright e2e | ✅ 64 / 64 |
| pixel-parity | ✅ 25 / 25 |
| react-doctor | ❌ 1 warning — `ui/screens/CalibrationCanvas.tsx:289` |

Recâblage app effectué pour votre modèle v2 : `onDeclareCoverage` retiré (la déclaration tapée n'existe plus —
les coches écrivent `Shot.variantIds`), `onShowLive` câblé (le retour au flux live était mort depuis le drop
précédent), tests et parcours e2e réécrits sur les nouvelles ancres (onglet actif `aria-current="step"`, ZoneBar
partagée, checklist à deux colonnes).

**Un point de conception à connaître, trouvé en câblant votre garde de capture.** `cold` teste
`tour.window === null || data.tourOpenable === false`. L'app dérivait `tourOpenable` de la seule liste de tables
VUES par l'engine — or en calibration **from-zero** la fenêtre est adoptée en station 1 *avant* que les règles de
la room ne soient committées : l'engine ne liste alors aucune table alors qu'une vraie table est là et cliquable
(le clic à blanc D12 y a été validé terrain). Votre garde désarmait donc F9 pendant toute la calibration d'un
profil vierge. Corrigé côté app — `tourOpenable` = table vue par l'engine **OU** fenêtre déjà adoptée par la
session. Rien à changer chez vous : `tour.window` reste le bon verrou pour la capture, votre garde est juste.
