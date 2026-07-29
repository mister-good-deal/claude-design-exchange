# Tatami app → Claude Design — iteration request (kickoff exploratoire) : Room Profile v3, la calibration unique source de vérité

Contexte : décision produit ferme. L'onglet **Room Profile** devient le **seul** outil de calibration de Tatami —
fin des mesures à la main et des valeurs seedées dans les TOML de profil. Les deux modèles de géométrie qui
coexistent aujourd'hui (fractions v1 des `[[regions]]` + buckets par taille `[[sizes]]`) fusionnent : **la capture
(screens labellisés + buckets par taille de fenêtre) est l'unique source de géométrie**, les régions ne gardent que
leur déclaration (nom, kind, seuils). Un audit côté app confirme que 100 % des données du profil sont mesurables,
assistées ou dérivées via l'onglet (`doc/room-profile-v3-toml-coverage-audit.md` dans le repo app — résumé §2).

Périmètre de la première livraison : **outil mainteneur**. Romain calibre la room Unibet de bout en bout et génère la
config ROI par défaut de la room. La re-calibration par les utilisateurs finaux (leur propre setup) viendra plus tard
— garde-la en tête comme extension, ne la design pas maintenant.

## 0 — Nature de cette itération : DIVERGENCE, pas production

C'est un kickoff. **On te laisse volontairement de la liberté** : produis **2 à 3 directions globales nommées** de
l'onglet Room Profile v3 — des concepts réellement différents (pas trois variantes cosmétiques du même flux), chacun
déclinant les cinq chantiers du §1. Romain choisira la meilleure direction (ou un assemblage) dans les itérations
suivantes ; la direction retenue sera ensuite produite en export gate-clean selon le contrat habituel.

Pour cette itération, le medium est à ta main tant que ça reste livrable dans l'archive (§1/§2 du contrat) :
pages de preview standalone dédiées (`pages/`), écran de sketch alimenté par fixtures, ou états multiples dans une
même page. **Ne touche pas au `RoomProfile.tsx` de production ni à son contrat dans cette itération** — les sketches
vivent à côté. Si le format d'archive contraint trop la phase de sketch, soulève la question au lieu de dévier.

Exemples d'axes de divergence possibles (libres, non prescriptifs) : wizard-first (tout passe par une procédure
guidée séquentielle), canvas-first (le canvas est la pièce centrale, les procédures sont des outils satellites),
checklist-first (la matrice de couverture/readiness pilote tout et chaque trou est un lien profond vers le geste qui
le comble).

## 1 — Les cinq chantiers que chaque direction doit couvrir

### A. Métrologie fenêtre (nouvelle procédure automatique)

L'app sait déjà redimensionner la fenêtre de la room (Win32) pendant le mode calibration. Nouvelle procédure 100 %
automatique qui mesure : largeur/hauteur **minimales** (dichotomie de resize mesuré), maximales (clamp room vs borne
moniteur), **ratio forcé** (fit `h = a·w + b` sur des tailles demandées hors ratio → ratio + chrome fixe), incréments
de snap, cas « fenêtre non redimensionnable ». À designer : où vit la procédure (étape du wizard entre Detect et
Tour ? outil indépendant ?), la visualisation du déroulé (la fenêtre bouge toute seule à l'écran — il faut raconter
ce qui se passe et le progrès), la restitution des résultats (contraintes mesurées + date + points de mesure bruts
comme évidence, vs valeurs déclarées à la main héritées), l'échec partiel (timeout, resize asynchrone, mesure
incohérente).

### B. Dispositions multiples par zone + labelling de shots + matrice d'exhaustivité

Une zone peut avoir plusieurs **variantes de disposition** selon l'état du jeu : la zone actions affiche 0 bouton
(pas au héros), 2 (check/bet), 3 (fold/call/raise), le slider de raise ouvert, la confirmation all-in ; le board a
0/3/4/5 cartes ; les cartes héros sont distribuées ou couchées ; le timer est visible ou absent. Chaque variante doit
être **attestée par au moins un screen labellisé** pris dans le mode calibration. À designer : le catalogue de
variantes par zone (template par kind, surchargeable par room), le geste de labelling à la capture (pré-labellisation
automatique proposée par les sondes/recognizers, l'utilisateur confirme ou corrige — un même screen atteste plusieurs
variantes à la fois), les sous-ROI par variante (positionner chaque bouton avec son rôle dans la zone), et la
**matrice d'exhaustivité** bucket × zone × variante → capturé / manquant / vérifié, qui doit rendre les trous criants
(« manquant : actions/2-boutons @ 960×600 ») et guider le tour (« faites en sorte que ce soit au héros de parler,
puis F9 »).

### C. Canvas unifié par bucket — toutes les zones, y compris actionneur

Le canvas ROI actuel n'édite pas les zones actionneur (`bet_input`, `bet_button`, `bet_blur`) — elles ne sont
éditables nulle part. Dans v3, le canvas d'un bucket porte **toutes** les zones : lecture (pot, cartes, stacks,
pseudos, timer) et actionneur (cibles de clic). À designer : la distinction visuelle lecture (OCR) / clic
(actionneur) / probe (point + couleur, pas un rect), le seed d'un bucket vierge par projection du bucket calibré le
plus proche (l'utilisateur ajuste au lieu de partir de zéro), et le cycle de vie des buckets (dérivés des layouts,
périmés après re-mesure des contraintes, tombstones) visible et actionnable.

### D. Nouveaux gestes de mesure sur shot

Trois outils qui remplacent les dernières données écrites à la main :

1. **Pipette pixel** : échantillonner la couleur de référence des boutons (probes fold/call/raise : point + hex) et
   la palette 4 couleurs des suits de cartes, directement sur les shots labellisés. La tolérance de match peut être
   proposée depuis la dispersion mesurée entre shots.
2. **Extraction de glyphes vérité-terrain** : l'utilisateur saisit la valeur visible dans une ROI (« le pot affiche
   12,50 », « cette carte est un K ») ; l'outil segmente et enregistre les templates ; la couverture des 18 codes de
   glyphes (chiffres 0-9, séparateur, devise, A/T/J/Q/K) entre dans la matrice d'exhaustivité ; le dry-run confirme
   la relecture.
3. **Assistant window-rules** : désigner la fenêtre table live et le lobby ; l'outil lit classe/titres réels, propose
   les regex de détection, vérifie leurs invariants et fait un test de détection en direct.

### E. Score de préparation du profil

Checklist agrégée qui définit objectivement « la calibration est finie » : règles de détection validées ✓,
contraintes fenêtre mesurées ✓, tous les buckets couverts ✓, variantes exhaustives ✓, glyphes complets ✓, dry-runs
verts (persistés avec les shots, avec historique) ✓ → badge « prêt pour session live ». C'est la colonne vertébrale
possible de tout l'onglet — au minimum sa synthèse.

## 2 — Surface de données que l'onglet doit produire (résumé de l'audit)

| Donnée du profil | Production dans v3 |
|---|---|
| Contraintes fenêtre (aspect, min/max L×H, snap, chrome) | Mesurées par la métrologie (chantier A), avec provenance |
| Règles de détection de fenêtres (4 regex) | Assistant guidé (chantier D3) |
| Géométrie de TOUTES les zones, par bucket taille | Canvas sur shots (chantier C) — unique source de géométrie |
| Sondes boutons (point + couleur + tolérance) | Pipette sur shots labellisés (chantier D1) |
| Palette suits des cartes | Pipette sur shots labellisés (chantier D1) |
| Glyphes (chiffres/rangs) | Extraction vérité-terrain (chantier D2) |
| Variantes de zones + labels de shots + sous-ROI | Nouveau — chantier B |
| Buckets (identités, tombstones) | Dérivés des layouts, matérialisés par le tour de capture |
| Hotkeys, sizing, layouts, automation | Restent aux écrans existants (Hotkeys & bets, BetSizing, LayoutDesigner) — hors périmètre |

## 3 — Ce que Romain évaluera pour choisir

1. **Confiance** : est-ce que je *vois* ce qui est calibré, vérifié, manquant — et pourquoi ?
2. **Chemin critique** : combien de gestes pour calibrer Unibet de zéro à « prêt pour session live » ?
3. **Reprise** : je reviens après une interruption ou une re-mesure des contraintes — est-ce que l'onglet me dit
   exactement quoi refaire ?
4. **Extensibilité** : la direction survivra-t-elle au futur mode « utilisateur final re-calibre son setup » sans
   refonte ?

## 4 — Questions ouvertes (réponds dans ta livraison)

1. Où ranges-tu la métrologie : étape obligatoire du wizard, outil à la demande, ou les deux ?
2. La matrice d'exhaustivité : vue dédiée, rail permanent, ou intégrée au Recap du wizard ?
3. Le catalogue de variantes : figé par kind de zone avec surcharge par room, ou entièrement éditable ? Quel geste
   pour déclarer une variante imprévue découverte en cours de capture ?
4. Toute contrainte du contrat DS qui gênerait la phase de sketch — soulève-la plutôt que de dévier.

## Rappel — demande 0.5.1 toujours en attente

L'itération « conflits de hotkeys de presets résolus inline dans Hotkeys & bets » (détail :
`doc/ds-report-0.5.1-preset-hotkey-conflicts.md` côté app) reste à livrer — indépendante de ce kickoff, elle peut
venir avant ou avec.
