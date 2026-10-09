# Room Profile V4 — décisions de Romain sur tes contrats et tes 8 questions (09/10)

Merci pour « Composants et contrats » : l'app reprend tes contrats tels quels, noms de commandes compris
(`metrology_set`, `take_start`, `take_burst`, `take_sweep`, `mirror_discard`, `take_annotate`, `calibration_set`,
`take_mirror_view`, `reading_preview`, `reading_override_set|clear`, `truth_set`, `pipette_sample`, `glyphs_harvest`,
`dry_run_corpus`, `write_profile`).

## Tes 8 questions : tes propositions sont acceptées, avec deux précisions

1. Corriger une fausse en station 7 : ton panneau latéral `FixDrawer`, seul geste = la surcharge de la plage de sa
   taille, dry-run rejoué à chaque réponse. **Oui.**
2. Écarter un miroir depuis la station 7 (`mirror_discard`) : **oui.**
3. Surcharges réglées en largeur seule à l'écran ; une surcharge qui couvre L 1572 est refusée : **oui.**
4. **Précision de Romain** : les captures doivent **remplir l'abaque largeur × ratio avec une densité uniforme**.
   Chaque miroir — de la première rafale, de la seconde (Maj+F9) ou d'un arrêt du balayage — se place **là où
   l'abaque est le plus vide** (le point du domaine le plus éloigné des captures existantes), plus « la case suivante
   la moins couverte » d'une grille. L'écran montre les points sur l'abaque ; l'app sert la position de chaque miroir.
5. Badge de validité par miroir, avec les zones dont l'encre a bougé : **oui.**
6. Arrêts du balayage = miroirs de la principale choisie (`burst: "sweep"`) : **oui.**
7. `screen.workHeight` servi : **oui.** **Précision** : le domaine de départ n'est PAS « L 640 → écran, ρ 1,30–1,80 »,
   mais celui des tailles mesurées du corpus : **largeur 640–1920, ratio client 0,82–2,81** (les 10 tailles calibrées
   y sont, de 800×1000 à 1600×600). Corrige `MetrologyData.bounds` (départ) et tes fixtures.
8. Projections de la station 4 à la demande (`take_mirror_view`), préchargées pour la prise en cours : **oui.**

## La suite

Rien à exporter encore : la vague de portage (station des lois B, puis les stations 2, 3, 4, 6 et 7) viendra quand le
moteur V4 sera en place côté app ; elle comprendra aussi le retrait des écrans V3 de l'export.
