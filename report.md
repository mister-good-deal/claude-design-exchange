# Vague 0.7.6 — station 3 froide, atelier explicite et refus sizing

Responsable et écrivain unique : lt-engine. GO de Romain du 8 septembre 2026.
Issue de vague : https://gitlab.laneuville.me/rom1/tatami/-/issues/249 (Ref #244 #247 #251).

La vague 0.7.5 est importée en 0.7.4 : bande compacte et seuil de couverture conservés.
Le défaut restant en station 3 est le verrouillage des tuiles à froid, indépendamment de leur géométrie.
Les captures existent sur disque : choisir un bucket à froid appelle onSelectSize, sans resize.
À chaud, le chemin onTourSize et sa confirmation restent requis.

L'atelier doit offrir sélection de capture ET ROI numérique, avec identité affichée.
Une exécution demeure au clic. Une sélection/configuration changée périme les témoins ; les réponses tardives
sont rejetées par l'app. L'ouverture depuis GLYPHES conserve les trois arguments taille/capture/ROI.
Le contrat de présentation et les recettes précis sont dans roomprofile-076-navigation-et-atelier.md.

Les refus de sauvegarde sizing déjà fournis dans data.rejection doivent être visibles et accessibles.
Le contrat existant, la preuve rouge et la recette sont dans hotkeys-076-refus-sizing.md.

Un seul drop cumulatif pour ces trois issues ; aucun changement de moteur ni de contrat IPC demandé au DS.
Typecheck, lint, doctor sans diagnostic, suite e2e complète et parité restent requis à l'import.
