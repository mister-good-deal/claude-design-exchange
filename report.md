# Drop 2026-08-18 — rapport de gate (app Tatami)

**Verdict : importé et câblé, toutes gates vertes** — tsc, lint, react-doctor « No issues found! », vitest 417/417,
Playwright 64/64, **pixel-parity 25/25**, ds-sync 82 fichiers, cargo fmt/clippy/test (270 desktop). Le drop répond à
tout le rapport terrain 0.6.4 : la sync 3↔4 dérive enfin (écart 36), l'outil glyphes montre toute la capture
(écart 49), le rail des pixels est lisible, groupé et laisse écarter un pixel absent (45/46b/47), les variantes du
joueur ont leur section (42), le mur d'abonnement a un état de restauration (39), et l'Établi n'a plus qu'UNE
adresse (24/37, clos par suppression). Merci — c'est un drop qui referme, pas qui déplace.

## Un défaut d'export à corriger à la source

**`GlowConfig` manque au paquet** : `ui/screens/GlowConfig.tsx`, `GlowConfig.fixtures.ts` et `GlowConfig.module.css`
ne sont pas dans l'archive, alors que le `manifest.json` liste `GlowConfig` dans ses `screens` et que
`ui/screens/index.ts` + `standalone.entry.tsx` de l'export lui-même l'importent. Comme la cible `ui/screens/` est en
`replace-dir`, l'import a supprimé les trois fichiers et le typecheck est parti rouge sur l'export.

Chez nous : les trois fichiers ont été restaurés depuis le drop précédent (aucune main dans le code DS, le lockfile
ds-sync les réintègre à leur hash d'origine). **À corriger au prochain export** : soit les fichiers reviennent au
paquet, soit `GlowConfig` sort du manifest et de `index.ts`. Un `replace-dir` mérite un garde-fou côté génération —
tout ce qu'un `index.ts` exporte doit être dans l'archive.

## Ce que le câblage a demandé côté app (pour information)

- **`Zone.requires` est SERVI PAR LE BACKEND**, pas construit par l'app : la règle « `board_4` n'existe qu'à partir
  du turn » vivait déjà dans la relecture de glyphes du moteur ; elle est désormais la seule définition et voyage
  jusqu'au contrat. L'écran masque donc exactement ce que le moteur ne relit pas.
- **Le rail des sondes est scopé** : `Probe.action` / `Probe.variant` nous ont fait remonter un vrai bug backend —
  un profil migré (FR-092) ne porte plus de clé plate `probe.<action>`, la station 5 refusait donc TOUTE mesure sur
  un profil terrain. La commande prend maintenant la déclinaison et vise `probe.<variant>.<action>`.
- **`Shot.absentPointIds`** : le backend range les absences d'une capture dans UNE liste ; l'app la partage entre
  ROIs et pixels d'après le catalogue. Rien à changer côté DS.
- **`onDeclareVariant("custom", …)`** : la déclaration atterrit sur la zone `actions` — les autres zones à variantes
  (board, cartes héros, timer) sont des états du moteur, ils ne varient pas d'une room à l'autre.

## Deux points d'écran encore ouverts

1. **C1/C2 n'ont touché que la station 5.** Les écarts 45/46 ont été relevés sur le rail « pixels à poser » du CANVAS
   (station 4) : ce sont ses puces qui affichaient « Fold · 3 boutons · … » tronqué, et c'est lui qui liste
   maintenant ~16 pixels à plat — déclinaisons scopées comprises, puisqu'elles sont la géométrie que le moteur lit.
   `PipetteTool` est lisible et groupé ; `CalibrationCanvas.UnplacedRail`, lui, est resté une file de puces.
2. **`fire()` est la bonne réponse à la leçon E** — nous avons posé la garde symétrique côté app (un test échoue si
   un écran appelle un `on.onX` qu'aucun container ne fournit). Elle a trouvé trois gestes que l'app **ne peut pas**
   honorer aujourd'hui et qui sont pourtant rendus : `onSelectLocale` (la langue est un choix de build),
   `onResendCredential` (aucun endpoint de renvoi), `onReanchor` (pas d'ancrage manuel de l'overlay). Demande
   inchangée : **un contrôle dont le callback est absent ne devrait pas être rendu** (ou l'être désactivé, avec son
   motif). Et oui — la version forte (callbacks essentiels non optionnels dans les types) nous intéresse : casser le
   build vaut mieux que perdre une session terrain.
