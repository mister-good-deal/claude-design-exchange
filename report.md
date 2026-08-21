# Tatami app → Claude Design — retours TERRAIN de la validation Windows 0.6.5

Session du 2026-08-21 (rapport : `recon/win-validation-2026-08-21/REPORT.md` sur `windows/validation-0.6.5`).
**Première campagne qui atteint le bout du parcours** : les six stations ont été traversées, `write_profile` a
refusé proprement en nommant ses sept lignes, les dry-runs se sont persistés puis correctement invalidés. Vos
drops tiennent : la station 5 s'ouvre à froid, l'outil glyphes montre enfin toute la capture d'un coup (« c'est
mieux » — écart 49), les variantes désactivées ont disparu partout, la barre d'onglets navigue.

Ce qui suit est ce que le terrain a trouvé au-delà. Rappel de la règle : tout retour est traité, seul Romain
décide d'un report. **Romain reprend par ailleurs la conception d'ensemble de la station 5 avec vous** — les
points ci-dessous en sont la matière.

## A — Le chemin critique du badge vert : l'extraction des glyphes (écart 56)

Sans templates de glyphes, `board` et `hero_cards` s'abstiennent au dry-run, donc pas de dry-run vert, donc pas de
badge, donc pas de `write_profile`. Tout le reste du score est du travail de calibration ordinaire ; **ceci est le
verrou**. Trois symptômes, une enquête, trois causes distinctes :

**A1. La géométrie n'est PAS en cause** — vérifié au pixel : sur une capture 1048×540 nette, le board occupe
397→600 px et les rects du profil tombent exactement dessus (`board_1` 0.379→0.424 … `board_4` 0.527→0.571).
Toutes les captures font bien la taille du bucket.

**A2. `board_3` explose en 7 « cartes » parce que le DÉCOR chevauche la carte.** Le jeton de mise (0.01) et le
badge du pot (« 9,6 BB ») sont dessinés PAR-DESSUS le bas de la troisième carte, donc à l'intérieur de la ROI —
aucun réglage de géométrie ne peut les éviter. Preuve dans le cache : pour un même shot, `board_1-0` et
`board_2-0` existent seuls, tandis que `board_3` va de `-0` à `-12` (13 composantes : bandes orange, carrés
beiges…). *Attendu :* ne retenir que ce qui peut être un rang de carte (position en haut-gauche de la ROI,
gabarit plausible) et rejeter le reste — jamais en faire des cartes supplémentaires.

**A3. Certaines captures ne produisent qu'UN crop, en silence.** Un shot parfaitement net (board T♠ J♥ Q♦ Q♠,
héros J♦ 9♦) n'a qu'un seul crop en cache (`board_1-0`) : rien pour board_2..5 ni pour les héros — d'où le
« aucune ROI n'est lisible » du terrain, sans le moindre message. *Attendu :* un état d'échec conçu (« extraction
interrompue », avec la ROI fautive), jamais des boîtes vides.

## B — Mise en forme de l'outil glyphes (écarts 57 à 60)

- **B1 (57).** Une ligne « board » unique montrant les cartes présentes côte à côte (trois pour un flop) plutôt
  qu'une section par `board_N` ; idem une seule ligne pour les deux cartes héros.
- **B2 (58).** Ne pas répéter en rouge, sur les touches de rang/enseigne de chaque carte, les codes restant à
  trouver : la colonne « Couverture glyphes » le dit déjà, et la redondance rend illisible ce que l'utilisateur
  vient de cliquer (couleur et glyphe sélectionnés).
- **B3 (59).** Le panneau de vérification reste fixe au scroll — étant entendu qu'avec B1 la page ne devrait plus
  scroller.
- **B4 (60).** Nommer la capture courante : le bandeau liste les métadonnées mais ni id ni label, impossible de
  désigner la capture dont on parle.

## C — Station 5, pipette : le modèle est bon, l'écran ne le raconte pas (51, 52, 53, 54, 62, 63, 66)

Verdict joueur : « on ne comprend rien », et il reprend la conception avec vous. Les points précis :

- **C1 (52).** Les pastilles de couleur à gauche n'ont **aucun mapping** avec la colonne de sondes à droite : on
  ignore à quelle sonde appartient ce qu'on regarde. Et ce que le joueur attend en voyant un « pixel », c'est la
  **loupe du voisinage** ; ce qu'il voit, ce sont les échantillons PAR CAPTURE (un par shot attestant, chacun
  déjà médiane 3×3) — jamais expliqué.
- **C2 (54).** La dispersion et la tolérance proposée arrivent sans un mot : ce qu'elles mesurent, d'où elles
  sortent, pourquoi une adoption explicite reste nécessaire.
- **C3 (63/62).** L'adoption est **bufferisée par famille** : adopter `fold` puis `call` n'écrit rien tant que
  `raise` manque, et l'écran n'en dit rien — le joueur croit son geste sans effet, et la station 6 affiche
  « Pixels de référence prélevés : jamais effectuée » alors que deux mesures ont réussi. Il faut au minimum
  montrer l'état du buffer (« fold ✓ · call ✓ · reste : raise ») là où le geste se fait ET sur la ligne du score.
- **C4 (66).** Décision de Romain : **l'adoption doit être atomique** — soit elle écrit, soit elle refuse en
  disant ce qui manque ; pas d'état intermédiaire invisible.
- **C5 (51).** Le prélèvement doit **suivre la pose** : après avoir posé le pixel, exiger encore un clic
  « Prélever » sur chaque sonde est un geste de trop — le joueur vient de désigner l'endroit, il n'a rien d'autre
  à dire. Contrainte app à garder en tête dans le parcours : la géométrie part en commit débouncé et
  `pipette_sample` résout le point côté backend, la mesure se chaîne donc APRÈS le commit, pas en parallèle.
- **C6 (53).** Sélectionner une déclinaison dans le panneau de droite ne charge pas son pixel — l'aperçu reste
  vide. Le parcours refondu doit dire ce que la sélection d'une déclinaison affiche.

## D — Station 6 et vue Couverture : dire la vérité des états (61, 64, 65, 67)

- **D1 (67, le plus structurant).** **Trois écrans dérivent la même donnée et n'en disent pas la même chose.** Le
  store porte 28 attestations sur 7 captures (`dealt`×6, `absent`×6, `two_buttons_check_bet`×4, `b5`/`b4`/`b0`…) ;
  la station 3 affiche ses coches, la station 6 compte « Variantes attestées 12/26 », et la vue Couverture annonce
  **CAPTURÉ · 0 / VÉRIFIÉ · 0**. Une seule dérivation partagée, et l'état « capturé » doit pouvoir être attribué.
- **D2 (64).** Un dry-run invalidé s'affiche « **jamais lancé** » alors que le journal dit `dry_runs_purges … 
  purged=1` : l'invalidation marche, le mot la nie. Attendu « périmé — à relancer », avec ce qui l'a invalidé ;
  « jamais lancé » réservé aux buckets vierges.
- **D3 (65).** Pouvoir **déplier une ligne du score** : « 14/32 » ne dit pas CE qui manque. Un clic déroule le
  détail, avec le lien vers la station et la cellule concernées.
- **D4 (61, côté app mais visible ici).** Le refus de `write_profile` ne laisse aucune trace au journal — l'écran
  nomme bien ses lignes, mais rien n'est journalisé.

## E — Le chemin de pose au clavier est abandonné

Entrée/Espace ne posent pas le pixel sur le terrain, alors que les tests fixture passent : chemin vert en test,
mort en vrai. Romain tranche : « je ne poserai jamais le pixel comme ça, tu peux enlever ce path ». Le cadre de
pose focusable et son `onKeyDown` peuvent disparaître du DS ; l'app retirera son détecteur de geste en même temps.
*(En attendant, la pose à la souris revient en station 5 et la pose clavier reste sur le canvas — correctif app
livré en session pour ne pas casser l'affinage aux flèches tant que le path existe.)*

---

Rappel du reste ouvert des campagnes précédentes, non re-testé faute de temps : convergence de l'Établi
standalone (24/37, commandée depuis 0.6.3) et sync 3↔4 (36) — cette dernière est livrée en 0.6.5 mais n'a pas pu
être vérifiée cette session.
