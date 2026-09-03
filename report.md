# Vague 0.6.16 — clôture de la 0.6.x : drop 2026-09-03.2 intégré, UNE demande

**État** : le re-drop `2026-09-03.2` est intégré et vert (lint, tsc, doctor, pixel-parity) — le défaut `ZoneWorkbench.tsx:727`
signalé au rapport précédent était corrigé dans ce drop, rien n'est dû de ce côté. SC-001 est atteint au terrain le
2026-09-03 : deux buckets relus sans erreur, profil écrit. Merci pour la station 4/5.

## Une seule demande — station 6 : le détail du verdict de zone n'a nulle part où s'écrire

Le backend compose déjà, pour chaque passe de dry-run, une phrase par zone : la zone en cause, le compte d'oracles,
la carte lue et son score, et désormais la **divergence des jumelles** d'une prise multi-taille (« jumelles
divergentes — la prise ne montre pas la même situation d'un bucket à l'autre, son attestation ne traverse plus :
prise #9 : 4 carte(s) de board ici, 5 sur 698×720 »). Ce champ (`DryRunZoneResultDto.detail`) arrive au front et
**est jeté à la frontière** : la ligne « Dry-runs » de la station 6 n'affiche que `« 2/3 · 16:41 »`.

**Ce qu'on te demande** :

- Contrat : `DryRun` (`RoomProfile.fixtures.ts`) reçoit un tableau app-fourni
  `zones?: readonly { zone: string; verdict: "ok" | "fail" | "abstain"; detail?: string }[]`.
- Rendu : `DryRunRow` (panneau « Dry-runs ») **déplie les zones sous la ligne du bucket** — le motif `<details>`
  natif déjà utilisé par `ReadinessRow` convient. Une zone `ok` sans `detail` n'a rien à montrer ; une zone avec un
  `detail` le rend **verbatim**, même verte (une prise divergente reste divisée une fois chaque jumelle attestée à
  part, le joueur doit continuer de le lire). Verdict rendu par une pastille ok / fail / abstain.
- Aucun mot à inventer : les phrases viennent du back, comme `ReadinessLine.consequence`. Le libellé de l'entête
  du dépli (« détail par zone », « 3 zones ») est ton choix.
- Variante acceptable si tu préfères : une note sous la ligne (comme `dryInvalidatedBy`) plutôt qu'un dépli.

Rien d'autre pour cette vague : c'est la dernière release 0.6.x, le reste est du nettoyage côté app. Le prochain
cycle (alpha fermée) portera l'Overlay v2 — on t'écrira alors une vague dédiée.
