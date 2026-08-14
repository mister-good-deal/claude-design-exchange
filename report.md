# Tatami app → Claude Design — retours TERRAIN de la validation Windows 0.6.1 (Room Profile v3 sur client réel)

Première vraie campagne de calibration de bout en bout sur le client Unibet (sessions 2026-08-12/13, rapport
complet : `recon/win-validation-2026-08-12/REPORT.md` sur `windows/validation-0.6.1`). Le moteur tient ses
promesses — métrologie reproductible en ~6 s, tuilage suspendu, captures attestées par objectif armé, quarantaine
honnête — mais **la station 4 (Établi) a dû être ABANDONNÉE en cours d'ajustage** : à toute taille de fenêtre
autre que la minuscule taille par défaut, l'outil ment. C'est le bloc A, et il conditionne la suite de la
campagne (clic à blanc D12, pipette, glyphes, dry-runs — tous reportés).

Classement par ce que ça coûte au joueur, pas par difficulté.

---

## A — L'Établi (station 4) est inutilisable dès qu'on redimensionne la fenêtre — BLOQUANT

**A1. Au resize de la fenêtre, le screenshot se met à l'échelle mais PAS l'overlay de ROI.**
Observé en live : on agrandit la fenêtre de l'app, l'image de la capture grandit, les rectangles de ROI restent
aux anciennes coordonnées écran — tout se désaligne, chaque drag devient une mesure fausse. Le joueur a arrêté la
station sur ce constat (« je ne serai pas précis »).
*Attendu :* ROI et image partagent le même repère : l'overlay est exprimé en coordonnées de l'image (fractions)
et rendu dans le même conteneur transformé, jamais en pixels écran figés.
*Recette :* ouvrir l'Établi, agrandir la fenêtre de 400 px → les cadres restent posés sur les mêmes pixels de la
capture, au pixel près.

**A2. Le canvas ne prend pas l'espace disponible.**
En étirant la fenêtre, la box de travail garde sa petite taille : la vue de la capture est tronquée et le seul
ajustage possible se fait dans un timbre-poste. C'est la même philosophie que le layout « surface d'abord » déjà
demandé : la surface de travail est le cœur du geste, elle doit occuper tout ce que la fenêtre offre.

**A3. Les raccourcis clavier annoncés sont tous morts.**
L'aide de l'écran dit « ou flèches pour affiner, Maj + flèches pour redimensionner de 0,2 % » — aucun effet, sur
aucune ROI sélectionnée (le drag souris et les poignées fonctionnent, eux). C'était le bloc A de l'itération
« finitions » : le chemin clavier ne tient toujours pas ses promesses sur le terrain.
*Recette :* sélectionner une ROI, `ArrowRight` → la ROI bouge ; `Maj+ArrowRight` → elle s'élargit de 0,2 %.

**A4. ROI dédoublées à l'écran.**
`HERO_2` et `VILLAIN_TOP_RIGHT` apparaissent avec un double contour (deux rectangles quasi superposés) sur la
capture. À investiguer côté rendu (double montage de l'overlay ?) — côté données le profil n'a qu'une entrée par
zone.

## B — Régression : les panneaux « Chemin critique » et « Exigences » ne scrollent plus

Overflow masqué, contenu tronqué, aucun scroll possible dans ces panneaux de l'épine. C'était l'écart 11 de la
campagne 0.6.0, déjà corrigé par un drop précédent — la correction a régressé ou n'a jamais atterri sur ces
panneaux-là. Le joueur re-signale le point avec agacement, à juste titre.
*Recette :* réduire la fenêtre à ~900 px de haut → chaque panneau de l'épine scrolle indépendamment, tout le
contenu reste atteignable.

## C — Station 3 (tour de capture) : l'inspection et la gestion des captures

**C1. Une capture chargée s'affiche en vignette au lieu de remplacer l'aperçu principal.**
Charger une capture depuis le rail l'affiche dans un petit encart coin bas-droit (« capture sélectionnée ») alors
que le cadre principal reste sur « Aucune frame live » : on inspecte un shot 1280×540 dans un timbre-poste.
*Attendu :* la capture chargée PREND le cadre principal ; un bouton explicite « repasser au live » rend le flux ;
la suppression de la capture chargée est accessible au même endroit (cf. C2).

**C2. Aucune UI de suppression de capture — bucket plein = impasse.**
La limite de 16 captures atteinte, le message dit « supprimez une capture avant d'en ajouter une nouvelle »…
et aucun écran n'offre ce geste (la commande `delete_shot` existe côté app, promotion du primary comprise).
Le déblocage a dû se faire à la main dans l'app-data.
*Attendu :* suppression sur les vignettes (rail de la station 3 ET Établi), avec confirmation.

**C3. Une capture n'atteste qu'UN état — l'écran promet l'inverse.**
Le bandeau dit « une capture prouve souvent trois ou quatre variantes — coche tout ce qu'elle montre », mais le
seul chemin d'attestation est l'objectif armé : un état par capture, en le surlignant AVANT. Le joueur veut :
capturer une fois, puis cocher toutes les variantes que le screen prouve, en un geste.
*(Note app : la validation des déclarations par familles est cassée côté profil — `board/*`, `hero_cards/*`
rejetés — le fix est chez nous. Mais le PARCOURS multi-attestation post-capture est un sujet d'écran.)*

**C4. Aucun geste pour « cet état n'existe pas dans cette room ».**
`actions/allin_confirm` n'a pas été observée sur Unibet NL5 : l'exhaustivité « /13 » est inatteignable et le
badge ne sera jamais complet. Le rail de variante différée avec motif existe côté moteur
(`variante_override_pose`) mais aucun écran ne l'expose.
*Attendu :* sur une cellule de la matrice, un geste « différer / marquer absente de cette room » avec motif tracé.

**C5. « Aucune frame live » est un message trompeur en première calibration.**
Sur un profil non calibré, la lecture moteur est suspendue : la source de l'aperçu live n'émet JAMAIS — le
message « l'engine en envoie une dès que la fenêtre de table est visible » promet un flux qui n'existera pas.
*Attendu :* l'écran distingue « pas encore de frame » de « pas de flux possible avant calibration » (message
dédié, ou une source de frame propre à la calibration).

## D — Station 2 (métrologie) : trois finitions d'affichage

**D1. Layout resté en 3 colonnes égales.** Journal | aperçu | Contraintes — le « surface d'abord » (1 + 2)
demandé n'est pas appliqué sur cette station.

**D2. Badge de provenance du MAX erroné.** Le panneau affiche « MONITEUR » sur MAX 2050×1080 alors que la mesure
dit `room_clamp` (moniteur 3840×1080 : c'est la room qui bride). L'étiquette dit l'inverse de la donnée — la
distinction « clamp room » vs « borne moniteur » était précisément un point du drop précédent.

**D3. Rendu final des contraintes faux.** En fin de campagne, le rectangle pointillé « 606×372 » est dessiné
VERTICAL (portrait) pour une contrainte paysage. Pendant la mesure, l'animation semblait correcte — c'est le
rendu statique post-campagne qui se trompe de repère.

## E — Station 1 (règles de fenêtres) et divers

**E1. Pas de préclassification des candidates.** Avec des règles committées qui matchent, la table ET le lobby
arrivent « ignorer » : le joueur reclasse tout à la main à chaque visite. *Attendu :* les selects par défaut
dérivés des règles (table→table, lobby→lobby), le joueur ne corrigeant que les erreurs.

**E2. L'ordre des candidates change à chaque re-scan.** L'énumération en poll (2,5 s) suit l'ordre brut
d'`EnumWindows` : les lignes bougent sous le curseur. *Attendu :* ordre stable (ancienneté d'apparition), les
nouvelles fenêtres s'ajoutent sans réordonner les existantes.

**E3. Les 3 ROI « Bet » sont opaques.** `bet_input` / `bet_button` / `bet_blur` sans explication nulle part.
*Attendu :* tooltips au survol dans la liste de ROI (ce que la zone couvre, exemple, rôle dans le clic à blanc).

**E4. « Absente de cette capture » devrait retirer la ROI du canvas.** Le marquage grise la ROI au lieu de la
faire disparaître ; la réintégration naturelle serait un drag & drop depuis la liste de gauche vers le screen.

**E5. Les sous-ROI d'actions n'existent qu'en UN exemplaire, alors que leur position dépend de la variante.**
En 2 boutons (fold/call), en 3 boutons (fold/call/raise) et selon le format de jeu, CALL/BET/RAISE ne sont pas
aux mêmes coordonnées — l'Établi ne montre qu'une seule géométrie `actions.call`/`actions.fold`/`actions.raise`.
*Attendu :* représenter les déclinaisons par variante (l'ajustage se fait sur un shot attestant la variante, la
liste de gauche dit laquelle est couverte / manquante).

---

Captures d'écran du joueur à l'appui dans le rapport de campagne (`recon/win-validation-2026-08-12/REPORT.md`).
Le bloc A d'abord : tant que l'Établi ment au resize, la calibration fine, le clic à blanc (D12) et toute la
suite de la campagne restent au sol.
