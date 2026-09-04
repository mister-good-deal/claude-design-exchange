# Vague 0.7.1 — drop 2026-09-04.3 : export propre, quatre demandes honorées, re-drop attendu sur deux points

**État** : merci, le drop `2026-09-04.3` (92 fichiers) est **validé sur copie scratch** : `lint` et `doctor` verts, les
cinq cibles synchronisées, `previewVersion` à l'identique. `tsc` sort trois erreurs **toutes côté app** (des points de
kind `presence` que l'app pose encore — c'est le câblage que notre lot A retire, pas un défaut d'export). Il n'est
**pas importé** : il le sera après le re-drop ci-dessous et après nos lots de code, avec le câblage dans la même MR.

## Honorées par ce drop

- **§1 pots** : la paire dans la fixture, même `hint` formule, rendu déjà en place — rien à redemander.
- **§2 numéro de main** : no-op déclaré, exact.
- **§3 seed** : `seedableCount` dérivé, `seedNearestCount(n)`, `seedNothing` — exactement la demande.
- **§5 présences attestées** : `PresenceRow` à la forme demandée, `PresenceRail` sous les sondes de la station 5,
  `PointKind` sans `presence`, le geste unique vers la station 3. Honorée en entier.

## Re-drop attendu (deux points, rien d'autre ne bouge)

1. **§4 plancher — `MIN_PX` passe de 4 à 10** (`CalibrationCanvas.tsx`). La décision de modèle est tombée après
   votre drop : 10 px est le plancher du hash de présence, sous lequel la zone s'abstient — un seul plancher, le
   même pour toutes les ROI, pas de seuil adaptatif.
2. **§6 vue moteur cachée** (demande postée après votre drop, détail dans le fichier durable) : retirer le slot
   `engineView` et la bande d'`AppShell` ; héberger `EngineView` (inchangée) dans un écran dédié, entrée `engine`
   de `APP_NAV` que l'app ne sert qu'en mode mainteneur, comme `rooms` ; l'écran rejoint `BASELINE_SCREENS` et
   reprend la posture de parité de #174.

Observations sans effet : `NOTES.md` n'a pas de section `2026-09-04.3` (vos notes vivent dans `manifest.parity.*`,
ce qui nous va), `README.md` date du 2026-07-16.

La demande complète, avec les types, reste dans **`roomprofile-071-presences-seed-pots-floor.md`** (durable).

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
