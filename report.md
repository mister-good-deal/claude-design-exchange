# Vague 0.7.0 — drop 2026-09-03.3 intégré et vert, DEUX demandes durables

**État** : le drop `2026-09-03.3` (station 6 : `DryRun.zones`, `DryRunRow` déplie les zones avec leur `detail`) est
**intégré et vert** dans la 0.7.0 — lint, tsc, doctor, pixel-parity, sans une retouche à la main ; 4 fichiers DS ont
réellement changé (`ValidateStation.tsx`, `RoomProfile.fixtures.ts`, `RoomProfile.module.css`, `i18n.ts`), aucun
token, aucune page, aucune primitive. La demande station 6 est **honorée en entier** — le `<details>` sous la ligne
du bucket est le bon choix (la ligne porte déjà un bouton). Merci.

Trois écarts au contrat, aucun bloquant, à corriger au prochain drop : (1) `version` `2026-09-03.3` ≠
`parity.previewVersion` `2026-09-03` — §8 demande de bumper les deux à l'identique, sinon l'alarme de fraîcheur
devient du bruit ; (2) l'archive porte `assets/`, `NOTES.md`, `README.md`, hors de la §1 et non déclarés dans
`targets` (ignorés) ; (3) les `keepGlob` `ErrorBoundary.*` / `GlowConfig.*` visent `ui/` alors que ces fichiers
sont app-owned (§4) — no-op, à retirer.

La 0.7.0 relie la Room Profile calibrée au moteur de jeu : à chaque frontière de main l'état est relu à l'écran, à
chaque retour de l'action au héros les actions manquantes sont reconstruites et validées par le moteur, avec un
niveau de confiance à trois états. Le cœur, le contrat IPC et le container sont livrés ; **deux surfaces te
reviennent**, chacune dans son fichier durable à la racine de l'exchange :

1. **`engine-view-card.md`** — la carte « vue moteur » du cockpit : une carte par table suivie, badge de confiance,
   street/pot/sièges, actions légales seulement en Autoritatif, « hors décision », « aucune main suivie » ; la forme
   exacte des props et les 30 clés i18n `engineView.*` y sont ; c'est à toi de dire où la carte vit dans `AppShell`.
2. **`roomprofile-display-unit-presence.md`** — Room Profile : (a) le couple `displayUnit` / `onSetDisplayUnit`
   (même forme que `captureDelayMs` / `onSetCaptureDelay`, station 3, valeur servie, deux états jetons / BB, BB par
   défaut) ; (b) cosmétique, non bloquant : un mot `presence` dans `ZoneKind` / `PointKind`. Pour information : la
   matrice de couverture reçoit 4 déclinaisons de plus (états par siège), forme existante, rien à changer.

**Ce qui se débloque à ton drop** : l'import de la carte et ses tests de parcours, la déclaration de l'unité par
l'écran (la commande et la garde de dry-run sont déjà livrées). Un seul drop peut porter les deux surfaces ;
`manifest.version` bumpé à la date, lint-bundle à 0, `tsc` vert, comme d'habitude.

Les demandes durables précédentes (`activation-brief.md`, `hotkeys-presets.md`, `roomprofile-v3-field-fixes.md`,
`e5-variant-declinations.md`, `station5-*.md`) restent honorées ; rien de neuf de ce côté.
