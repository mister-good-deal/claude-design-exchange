# Vague 0.7.1 — drop 2026-09-04.4 VALIDÉ : les six demandes honorées, export propre — vague CLOSE côté DS

**État** : merci, le drop `2026-09-04.4` (92 fichiers) est **validé sur copie scratch** : `lint` et `doctor` verts,
les cinq cibles synchronisées, `previewVersion` à l'identique. `tsc` sort cinq erreurs **toutes côté app** — deux
`engineView=` que notre shell passe encore (§6, notre câblage) et trois points de kind `presence` que notre mapping
pose encore (§5, notre lot A). Ce n'est pas un défaut d'export. Il n'est **pas encore importé** : il le sera après
nos deux lots de code, avec le câblage dans la même MR. Aucun re-drop attendu.

## Honorées par ce drop (les six)

- **§1 pots**, **§2 numéro de main**, **§3 seed**, **§5 présences attestées** — inchangées depuis le `.3`, exactes.
- **§4 plancher** : `MIN_PX = 10`, symétrique, drag et flèches — exactement la révision.
- **§6 vue moteur cachée** : slot et bande retirés d'`AppShell`, entrée `engine` (icône `cpu`) filtrée par l'app en
  mode mainteneur comme `rooms`, `ENGINE_BASELINE_ID` conservé, posture de #174 reprise. Les deux déviations
  déclarées (plus de `border-bottom`, grille `auto-fit` des cartes) sont **acceptées**.

## Écarts au contrat, sans effet (à reprendre au prochain drop, pas avant)

- `manifest.screens[AppShell].slots` liste encore `engineView` que le composant n'a plus.
- `parity.roiFloorPx` dit toujours 4 px à côté de `roiFloorTenPx` qui dit 10.

Verdict d'import (parité pixel, e2e) au prochain rapport, après le câblage. Prochaine vague : 0.7.2 ou 0.8.x.

La demande complète reste dans **`roomprofile-071-presences-seed-pots-floor.md`** (durable, honorée).

## Les six demandes

1. **Pots (#178)** — libellés servis « Pot total (mises comprises) » / « Pot au centre (hors mises de la street) » ;
   la formule `pot = pot_collected + Σ mises de la street` arrive dans `Zone.hint` : la rendre lisible à l'établi, là
   où la ROI se pose, et présenter les deux pots comme une paire. Fixtures DS à aligner.
2. **Numéro de main (#178)** — `hand_number_value` disparaît du catalogue : une seule zone « Frontière de main
   (empreinte) ». Une entrée de moins dans `zones`, rien d'autre.
3. **Seed non destructif (#177)** — `onSeedFromNearest` inchangé ; le bouton compte : « Seeder les N ROI sans
   géométrie » / « Seed the N ROIs without geometry », désactivé avec son mot quand N = 0. N dérivable des données
   servies ; sinon `SizeBucket.seedable?: number`, dites-le.
4. **Plancher de ROI (#182)** — `CalibrationCanvas` : `MIN_SIDE` passe de 2 % de la fenêtre à **10 px du
   bucket** (symétrique, drag et clavier — `pxUnit` fait déjà la conversion) : c'est le plancher du hash de présence,
   sous lequel la zone s'abstient (G1 #181).
5. **Rail station 5 (#181)** — les présences ne se prélèvent plus, elles s'attestent : `RoomProfileData.presences`
   (`PresenceRow` : états attestés présent/absent avec leurs captures, état de la référence « calibrée » / « à
   attester » / « dérivée à la session »), sans couleur, tolérance ni cible ; `PointKind` perd `presence` ; plus de
   `Probe` de présence. Le seul geste : aller attester une capture (station 3). #180 sans objet.

6. **Vue moteur hors du shell (retour Romain sur le drop 2026-09-04.2)** — le bandeau en haut de toutes les pages
   n'est pas voulu : **retirer le slot `engineView` et la bande de `AppShell`** (le shell redevient ce qu'il était,
   sur tous les écrans) et héberger la carte `EngineView`, inchangée, dans **un écran dédié et caché**, gaté comme
   Room Profile : une entrée `engine` de `APP_NAV` que l'app ne sert qu'en mode mainteneur (`useMaintainerMode`,
   `Ctrl+Alt+Shift+R`), exactement comme `rooms` — le DS rend le `nav` servi, il ne gate rien. L'écran rejoint
   `BASELINE_SCREENS` et reprend la posture de fixture de #174. Rien d'autre ne bouge dans le cockpit.

## Ce qui ne bouge pas

Le badge « présence » de la barre de l'établi (station 4), le sélecteur d'unité de la station 3, le composant
`EngineView` lui-même, les demandes durables précédentes (toutes honorées). Le contrat d'export et le bundle lint sont inchangés.

Verdict d'import au prochain rapport, après le drop.
