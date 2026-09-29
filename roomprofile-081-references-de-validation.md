# Demande Claude Design — 0.8.1 : « Références de validation », un compte et l'image à la demande

Issue d'origine : [#522](https://gitlab.laneuville.me/rom1/tatami/-/issues/522) (G1 note 13056). Écrivain exchange :
lt-atelier. Ce fichier appartient à la MR du lot ; il ne livre aucun écran, aucun CSS app, aucune édition de `ui/`.
Publiée le 2026-09-29 sur l'accord de Romain : `roomprofile-081-references-de-validation.md` sur l'exchange.

## Le constat

Terrain du 29/09 : la géométrie écrite et validée porte **954 preuves**. La section « Références de validation » de la
vue principale de Room profiles rend une ligne par preuve, et chaque ligne qui entre dans la vue demande son image
d'elle-même (`IntersectionObserver` → `onReloadGeometryProof`). Chaque image prend le verrou de la room, ~4,6 s : 103
demandes en 3 minutes, l'app a gelé. Romain : « complètement inutile d'afficher tous les artefacts de la géométrie
courante, ça lag énormément et ça n'apporte rien ».

## Ce que l'app change déjà

L'app n'offre plus `onReloadGeometryProof` : aucune image n'est demandée sans geste du joueur. En attendant ce drop, une
ligne n'a plus d'image du tout.

## Ce qui est attendu de l'écran

1. **Un compte d'abord** : la section montre le nombre de références de la géométrie courante (et, à part, celui des
   géométries archivées), sans lister les lignes. La liste s'ouvre derrière un dépliant.
2. **L'image à la demande seulement** : plus d'observation de la vue. Une ligne dépliée offre « Voir » ; le clic appelle
   une nouvelle offre `onShowGeometryProof(proofId)`, et la ligne montre l'image servie (`GeometryProof.image`) ou son
   erreur. Sans l'offre, pas de contrôle.
3. **Les refus restent listés tels quels** (source manquante, réparation) : ils sont rares et appellent un geste.
