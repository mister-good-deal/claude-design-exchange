# Tatami app → Claude Design — retours TERRAIN de la validation Windows 0.6.3 (calibration from-zero complète)

Session du 2026-08-16 (rapport : `recon/win-validation-2026-08-16/REPORT.md` sur `windows/validation-0.6.3`).
Grande première : **calibration from-zero jouée de bout en bout** — profil vierge → stations 1+2 en ~40 s →
campagne de captures multi-attestées → ajustage par variante → **clic à blanc D12 validé** (les 3 actionneurs
cliquent juste dans la fenêtre live). Beaucoup de drops tiennent : œil/focus, zoom, tooltips, labels de sièges,
chips nommées, préclassification, multi-coche « Corriger… ».

**Règle de traitement posée par Romain : TOUT retour doit être traité — lui seul décide d'un report.** Le registre
inter-campagnes vit dans le rapport de session ; les items ci-dessous en sont la part écrans/design, avec leur âge.

## Message de Romain — parité preview HTML ↔ app réelle : ça suffit

Romain en a marre de constater des DIFFS entre ce que la preview HTML montre dans Claude Design et ce que la vraie
app Tatami rend une fois le drop importé. Il sait que la preview est beaucoup moins dynamique et reste en partie
mockée — ce n'est pas le reproche. Le reproche est que l'écart n'est ni tracé, ni borné, ni honnête, et qu'il
ressort en campagne terrain release après release. Trois symptômes dans ce seul rapport :

- **Écart 29 (3ᵉ signalement)** : le prototype montre une barre d'onglets que l'export n'a JAMAIS contenue —
  la preview promet une navigation que l'app ne peut pas avoir.
- **Écarts 24/37** : la preview ne rejoue pas la divergence des deux vues Établi — invisible chez vous, subie
  sur le terrain.
- **C5/écart 6 (3 releases)** : la preview montre un aperçu peuplé là où l'app réelle est structurellement vide —
  l'état vide n'a jamais été conçu.

Effort attendu, concret et durable :

1. **Chaque itération visible dans la preview doit être DANS l'export suivant.** Si un composant est prototypé
   mais pas exportable en l'état, il est listé comme tel dans les notes du drop — jamais silencieux.
2. **Tracer la version prototype ↔ drop** dans le manifest/contrat (demande de l'écart 29) pour que tout retard
   preview→export soit VISIBLE au moment de l'import, pas découvert en campagne Windows.
3. **Les zones mockées de la preview sont marquées comme mockées** (annotation dans la preview et dans les notes
   du drop), et **les états vides/dégradés réels sont conçus aussi** (pas de frame avant calibration, liste vide,
   fenêtre perdue…) — la preview doit montrer ce que l'app montrera VRAIMENT dans ces conditions.
4. **Toute vue livrée en plusieurs déclinaisons dans l'app (session / standalone) existe en preview dans les deux
   déclinaisons**, ou la déclinaison manquante est déclarée non couverte.

Le contrat d'échange (`doc/claude-design-DS-export-contract.md`) sera amendé côté Tatami dans ce sens ; merci
d'appliquer ces règles dès la prochaine itération.

## A — Dettes anciennes, à traiter en priorité (3 signalements ou plus)

**A1 (écart 6/C5, 3 releases).** L'aperçu live de la station 3 est structurellement vide en cours de calibration
et le message ment (« l'engine en envoie une dès que la fenêtre est visible » — la table EST visible). L'écran
doit dire la vraie condition, ou la calibration doit avoir sa propre source de frame.

**A2 (écart 29, 3 signalements).** La barre d'onglets de navigation du prototype (DETECTION | METROLOGY | …)
n'a jamais été exportée — l'app n'a que les pastilles. Vérifier que le composant à onglets est DANS le prochain
export, et tracer version prototype ↔ drop importé dans le contrat pour rendre tout retard visible.

**A3 (écarts 24/37, aggravé).** Les deux vues Établi divergent toujours : la standalone (onglet de l'écran
principal) cache la liste des ROI, le marquage d'absence ET le rail de déclinaisons E5 — elle contredit le modèle
par variante. Une seule vue Établi, ou la standalone disparaît.

## B — Conception station 3 : le tour à froid et la multi-coche

**B1 (écart 34).** Table quittée → retour station 3 impossible (« Refusé : confirmation sans fenêtre détectée »)
et retombée silencieuse en station 1 (fallback DetectStation du wizard). La station 3 est AUSSI une étape à froid
(matrice, déclarations, chargement de shots, « Corriger… ») : seule la CAPTURE exige la détection — bouton
désarmé + message, jamais de refus d'entrée ni de fallback.

**B2 (écart 30).** Supprimer la pré-sélection d'objectif (un clic par état, mono-état, pénible) : le seul chemin
d'attestation devient la multi-coche post-capture — prouvée excellente en session (7 shots, 2 à 4 attestations
par screen via « Corriger… »).

**B3 (écart 33).** Le battement `prelabel_propositions count=0` spamme le journal DEBUG à cadence fixe (1,5 s)
dès que des déclarations existent — n'émettre qu'au changement.

## C — Catalogue de variantes Unibet

**C1 (écart 31).** Il manque le layout 2 boutons « Check / Bet » (distinct de Fold/Call — shots à l'appui dans
le store de la campagne) et l'action « check » n'existe nulle part.

**C2 (écart 32, remplace l'écart 9).** Retirer `slider_open` et `allin_confirm` du catalogue Unibet : ni l'un ni
l'autre n'existent comme états (le slider est permanent). L'exhaustivité « /13 » doit devenir atteignable.

**C3 (écart 38).** `bet_blur` est un pixel (sa description le dit) — le sortir de la liste des ROI, sa place est
avec les points de sonde.

## D — Outillage Établi, 2ᵉ vague

**D1 (écart 35).** En zoom : pan à la « main » (clic gauche maintenu, façon Google Maps) et contrôles + / − / 1:1
ancrés au VIEWPORT (toujours visibles), pas au contenu.

**D2 (écart 36, « le must »).** Sync stations 3↔4 : le shot chargé étant labellisé, auto-masquer les ROI absentes ;
ré-afficher via l'œil met à jour les labels du screen (l'élément est finalement présent). Captures aux métadonnées
complètes, validées humainement.

---

Validés terrain cette session (ne pas retoucher) : œil/focus/zoom (25), tooltips Bet (18), labels de sièges (17),
chips nommées (28), préclassification y compris au poll (2/21), ordre stable (4), scroll (1), pastilles cliquables
(22 fonctionnel), multi-coche « Corriger… », station 4 sans éjection sur « Capturer au tour » (27 — le trou
restant est l'entrée station 3, cf. B1).
