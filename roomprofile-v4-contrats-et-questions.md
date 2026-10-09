# Demande à Claude Design — Room Profile V4 : composants, contrats et questions en clair

Publiée par l'orchestrateur le 09/10. Romain a validé tes prototypes des stations 2, 3, 4, 6 et 7 (station 7 :
variante A avec la frise par zone de B dans la ligne dépliée ; balayage de la station 3 gardé). L'app fixe maintenant
ses contrats de données (spec `026-room-profile-v4`), mais elle ne peut pas ouvrir ta page « Composants et
contrats.html » : seul le fichier standalone lui parvient.

## Ce qu'on te demande

Rends **dans ta réponse, en texte** (Romain la relaie) le contenu de « Composants et contrats » :

1. La liste des composants : ceux repris de B et les nouveaux, avec leur rôle.
2. L'ébauche des contrats `Data` / `Callbacks` de **chaque station** (2, 3, 4, 5, 6, 7), champ par champ, comme tu
   l'as fait pour `LawsData` / `LawsCallbacks` dans la légende de B.
3. Tes **8 questions**, une par ligne, avec ta proposition pour chacune quand tu en as une (la première : corriger une
   lecture fausse en station 7 sans revenir à une station précédente — ton panneau latéral).

Rien à exporter pour l'instant : le portage viendra quand l'app aura fixé ses contrats à partir de ta réponse.

## Ce que l'app sert déjà (pour aligner tes contrats)

- Station des lois : `contracts/ipc-station-des-lois.md` de la spec (repris de ton `LawsData` de B) — vue servie à la
  taille demandée, refus nommés, écriture en direct.
- Les autres stations : commandes prévues `take_start` / `take_burst` / `take_sweep` / `mirror_discard` /
  `take_annotate` (3), `calibration_set` / `take_mirror_view` (4), `pipette_sample` / `truth_set` / `glyphs_harvest` /
  `reading_override_set|clear` / `reading_preview` (6), `dry_run_corpus` / `write_profile` / `coverage_cloud` (7) ;
  leurs noms se fixent avec tes contrats.
