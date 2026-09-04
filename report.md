# Vague 0.7.1 — cinq demandes Room Profile, issues des retours de la campagne Windows 0.7.0

**État** : vague OUVERTE, poussée le 2026-09-04 (issue de suivi #185, méta #34). Les lots de code (présences par
empreinte, seed non destructif, catalogue) sont en cours en parallèle : la vague n'attend pas leur merge, le drop
sera importé et câblé après eux. La demande complète, avec les types proposés, est dans
**`roomprofile-071-presences-seed-pots-floor.md`** (durable, à la racine).

## Les cinq demandes

1. **Pots (#178)** — libellés servis « Pot total (mises comprises) » / « Pot au centre (hors mises de la street) » ;
   la formule `pot = pot_collected + Σ mises de la street` arrive dans `Zone.hint` : la rendre lisible à l'établi, là
   où la ROI se pose, et présenter les deux pots comme une paire. Fixtures DS à aligner.
2. **Numéro de main (#178)** — `hand_number_value` disparaît du catalogue : une seule zone « Frontière de main
   (empreinte) ». Une entrée de moins dans `zones`, rien d'autre.
3. **Seed non destructif (#177)** — `onSeedFromNearest` inchangé ; le bouton compte : « Seeder les N ROI sans
   géométrie » / « Seed the N ROIs without geometry », désactivé avec son mot quand N = 0. N dérivable des données
   servies ; sinon `SizeBucket.seedable?: number`, dites-le.
4. **Plancher de ROI (#182)** — `CalibrationCanvas` : `MIN_SIDE` passe de 2 % de la fenêtre à **des pixels du
   bucket** (proposition 4 px, symétrique, drag et clavier — `pxUnit` fait déjà la conversion).
5. **Rail station 5 (#181)** — les présences ne se prélèvent plus, elles s'attestent : `RoomProfileData.presences`
   (`PresenceRow` : états attestés présent/absent avec leurs captures, état de la référence « calibrée » / « à
   attester » / « dérivée à la session »), sans couleur, tolérance ni cible ; `PointKind` perd `presence` ; plus de
   `Probe` de présence. Le seul geste : aller attester une capture (station 3). #180 sans objet.

## Ce qui ne bouge pas

Le badge « présence » de la barre de l'établi (station 4), le sélecteur d'unité de la station 3, la carte vue
moteur, les demandes durables précédentes (toutes honorées). Le contrat d'export et le bundle lint sont inchangés.

Verdict d'import au prochain rapport, après le drop.
