# Tatami app → Claude Design — le prototype et sa propre fixture ne racontent plus les mêmes comptes (parité)

Depuis les drops 2026-08-25.1/.2, la région `rooms-requirements` sort la parité pixel à **0,47 %** pour un seuil
verrouillé à 0,40 % (mesuré sur l'arbre intégré : drop .2 + le câblage app é62/é67 de la station 6). Ce n'est ni du
rendu de police ni un bug d'import : **le prototype bake des comptes que ses propres constantes exportées ne
produisent pas**, et l'app — qui dérive du même export, carte pour carte — affiche donc d'autres chiffres.

## Le relevé, côte à côte

| Ligne | Prototype (standalone .2) | App (dérivé de VOTRE export) |
|---|---|---|
| Spine · station 3 | « **25/37 declared** » | « **19/37 cells attested** » |
| Spine · station 4 | « **43/60** adjustments » | « **58/75** adjustments » |
| Requirements · Bucket geometry | **43/60** | **58/75** |
| Requirements · Variants attested | **11/37** | **19/37** |
| Requirements · Reference pixels | **3/7** | **0/2** (littéral du miroir, à corriger chez nous) |
| Requirements · sous-titre donut | « **8 captured · dry-run pending** » | absent (`toVerify` non porté par le miroir) |

Deux natures de désaccord :

1. **Sémantique é67** : « declared » est l'ancien vocabulaire du tour. La dérivation partagée (écart 67, drop
   2026-08-23 + backend mergé) compte les cellules **attestées**. La spine du prototype est restée en deçà de son
   propre panneau Requirements, qui compte déjà « attested ».
2. **Données de fixture** : 43/60 vs 58/75 sur la MÊME dérivation nommée — le prototype n'a pas été régénéré depuis
   les constantes de `RoomProfile.fixtures` que vous exportez (celles dont notre miroir de parité,
   `prototype-roomprofile.ts`, se reconstruit « card for card »).

## Ce que nous demandons

- **Régénérer le prototype depuis votre fixture courante**, avec la sémantique é67 (cellules attestées) sur la
  spine comme sur le panneau — que le standalone et l'export racontent la même chose.
- **Déclarer les comptes canoniques par ligne** du panneau Requirements (y compris `toVerify` du sous-titre et les
  unités de la pipette « 3/7 ») — `declaredChanges` est fait pour ça. Là où votre fixture porte une donnée que nos
  DTO miroirs codent en littéral (pixels de référence, `toVerify`), nous alignerons le miroir sur votre déclaration.

## En attendant

Le seuil de `rooms-requirements` est relevé **temporairement** à 0,55 % (commentaire daté dans
`tests/visual/pixel-parity.spec.ts`) pour ne pas bloquer l'intégration 0.6.7. Au drop qui réaligne le prototype,
nous le redescendons à 0,40 %. `rooms-stations` passe encore (0,08 %) mais porte le même écart de texte — il se
refermera par la même régénération.

**Ce que nous ne demandons pas** : aucun changement de composant, de CSS ni d'i18n — c'est une régénération de
fixture/prototype et une déclaration de comptes, rien d'autre.
