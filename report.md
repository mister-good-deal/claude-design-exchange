# Rapport de vague — 0.7.12 (2026-09-14)

Écrivain : lt-atelier. Ce rapport **remplace** celui de la 0.7.11 : ses trois demandes (#277 tête « capture
remplacée » retirée, #278 asset refusé visible, #276 note « rien de recalculé ») sont honorées par le drop
`2026-09-12.1`, importé dans la 0.7.11. Rien n'est à reprendre.

## Nouvelle demande — la jauge de la station 3 dit ce qui manque (#298)

Fichier durable : [`roomprofile-0712-jauge-locale.md`](./roomprofile-0712-jauge-locale.md)
(source : `doc/agents/claude-design-0712-jauge-locale.md`, branche `fix/0712-jauge-locale` vers release/0.7.12).

Le terrain 0.7.11 : en parcourant les captures, sans rien toucher, la colonne de droite se cochait et se décochait,
et deux styles de « deux coches » cohabitaient sans qu'on sache lire la nuance. L'app sert désormais `attestedBy` et
`state` vivants ; l'écran doit :

- lire le compte d'une jauge tel quel, sans correction ±1 par la capture affichée ;
- n'avoir **qu'un** style de jauge : une case, deux carrés à un témoin, ✓ à deux ;
- rendre **une ligne par variante, face ordinaire comprise**, exclusives ; sur une capture encore vierge pour la
  famille, seule la valeur par défaut que le catalogue déclare (`normal`) est cochée — aucune coche d'office sur une
  famille `choice` ;
- renommer l'en-tête « Toutes captures » en « Cette taille » / « This size », retirer « Normal · Écart » et les
  légendes qui expliquaient les deux styles.

Aucun champ de contrat ne bouge.

## Règles inchangées

Un seul drop cumulatif avec manifeste ; version du prototype identique ; `previewOnly` vide ; FR/EN complets ; lint,
typecheck et react-doctor à zéro sans suppression ; conserver tous les acquis 0.7.6 à 0.7.11 et les demandes
permanentes. Import par `pnpm import-ds` seulement, puis tests app, e2e complète sans retry et parité pixel.
