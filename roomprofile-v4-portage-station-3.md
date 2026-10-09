# Demande Claude Design — Room Profile V4 : portage de la station 3 (captures)

Rédigée par l'orchestrateur le 09/10 au soir, après l'import du drop `2026-10-09.1` (retrait V3 + station des lois B).

## Pourquoi maintenant

Le drop `2026-10-09.1` a retiré `TourStation`, et avec lui l'UI de deux réglages de room : l'**unité d'affichage**
(jetons ou BB, `room.display_unit`, dont dépend la lecture des montants) et le **délai de capture**
(`capture_delay_ms`). Tu as écrit que leur place serait dite par le drop de la station 3. Décision de Romain (09/10) :
la 0.8.8 attend ce drop, ces deux réglages ne peuvent pas rester sans écran. La station 3 passe donc devant les
stations 2, 4, 6 et 7.

## 1. Station 3 · Captures — portage dans `ui/`

Le contrat est le tien, `§ Station 3 · Captures` de « Composants et contrats » (9 oct.), avec les décisions de Romain
déjà appliquées au prototype : Q4 (densité uniforme : maximin glouton dans le domaine normalisé L × ρ, `abaque.next`
et `sweepPlan.stops` servis par l'app), Q5 (badge de validité par miroir avec ses zones `inkMoved`), Q6 (les arrêts
du balayage sont des miroirs de la principale choisie, `burst: "sweep"`), Q7 (domaine de départ L 640–1920,
ρ client 0,82–2,81). Le balayage du prototype est gardé tel quel.

- `CapturesStation` (station 3, `WizardState.captures: CapturesData`), callbacks `CapturesCallbacks` mot pour mot ;
  tous dans `RoomProfileWiring`.
- L'abaque de la station 3 reprend les composants de l'abaque de B (`AbaqueGrid`, `AbaqueCaptures`, `AbaqueCursor`)
  plutôt que d'en dupliquer : points des miroirs par validité, les 5 prochains (◇ numérotés, disque vide comblé),
  chemin du balayage.
- Pendant `run`, tout est désactivé sauf « Arrêter » ; la phase de la rafale (`BurstPhase`) et l'arrêt courant se
  lisent sans animation calculée par l'écran.
- Refus servis (`rejection`) : aucun point du domaine atteignable, siège héros vide, dealer sur un siège vide.

## 2. Unité d'affichage et délai de capture

Deux réglages de room, servis et écrits par l'app, tels qu'ils étaient dans `TourStation` :

```ts
// dans les données de la station 3 (ou là où tu juges qu'ils vivent, à dire dans NOTES.md)
displayUnit: "chips" | "bb";          // room.display_unit
captureDelayMs: number;               // le délai entre la taille atteinte et la capture, ms
// callbacks
onSetDisplayUnit?: ((unit: "chips" | "bb") => void) | undefined;
onSetCaptureDelay?: ((ms: number) => void) | undefined;
```

- Ce qui est affiché est ce qui est écrit : la valeur montrée est la servie ; un refus (`rejection.scope =
  "displayUnit" | "captureDelay"`) laisse la valeur servie.
- Le délai de capture sert la rafale (phase `delay`) : le placer près du lancement de la prise est naturel, mais la
  place est la tienne. L'unité est une propriété de la room, pas d'une prise.
- Reprends les textes FR/EN qui existaient (`displayUnitLabel`, `displayUnitHint`, `displayUnitChips`,
  `displayUnitBb`, `captureDelayLabel`, `captureDelayUnit`, `captureDelayHint`), retirés avec `roomProfileV3`.

## 3. Fixtures et parité

`CapturesStation.fixtures.ts` : aucune prise (première ouverture), une prise et ses 5 miroirs valides, un miroir
`inkMoved` (2 zones), un miroir écarté à la main avec sa note, une seconde rafale en cours (`run`, chaque `BurstPhase`),
un balayage en cours (24 arrêts), l'aperçu du plan à 12 / 24 / 40, chacun des trois refus, unité BB et jetons,
délai à 0 et au plafond. Postures `ROOM_PROFILE_CAPTURES_POSTURES` et parité `rooms-captures`.

## 4. Le bandeau « profil mis à jour » (même drop)

Petite demande indépendante, à livrer dans le même drop : `roomprofile-v4-bandeau-mise-a-jour.md`.

## 5. Hors de cette demande

Stations 2, 4, 6 et 7 : vague suivante.
