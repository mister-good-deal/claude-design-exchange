# Demande Claude Design — 0.8.8 : le bandeau « profil mis à jour »

Issue d'origine : [#669](https://gitlab.laneuville.me/rom1/tatami/-/issues/669) (G1 note 16911, go 16913, écart B).
Publiée par l’orchestrateur avec le portage de la station 3 (09/10).

## Le besoin

À la mise à jour, le démarrage range l'ancien profil (une version précédente que celle-ci refuse, ou une référence
livrée dont la calibration change), pose la référence livrée et y reporte les réglages du joueur. Rien ne le dit hors
de l'écran d'erreur, qui ne s'ouvre que sur un échec : un démarrage réussi fait tout cela en silence, et un réglage que
la nouvelle version refuse n'est nommé que dans le journal.

## Demandé

Un bandeau dans `AppShell`, au-dessus du contenu, affiché dans la session où le démarrage a rangé un profil, et
fermable. L'écran ne calcule rien : il rend ce qui est servi.

- Données : `ProfileUpdate { reason: "unsupported" | "corrupt" | "reseed" | "reference", archivePath: string, at: string
  (RFC 3339, UTC), carried: string[], lost: string[] }`. `carried` et `lost` sont des noms de réglages : `layouts`,
  `tiling`, `input`, `requeue`, `diagnostic`, `sizing`, `overlay`, `room.display_unit`, `room.min_tile_width`,
  `room.capture_delay_ms`.
- Gestes : `on.onDismissProfileUpdate?: () => void`, `on.onOpenProfileFolder?: () => void` (la commande d'ouverture du
  dossier du profil existe).
- Mots fr/en dans `STRINGS[locale]` : titre (« Profil mis à jour »), les raisons (mêmes mots que l'écran d'erreur),
  « Réglages repris : … », « Perdus : … » (seulement si la liste n'est pas vide, ton d'alerte), « Ancien profil conservé
  sous … », et le libellé de chaque réglage (Layouts, Tuilage, Raccourcis, Requeue, Diagnostic, Presets de mise,
  Overlay, Unité d'affichage, Largeur minimale de tuile, Délai de capture).
- Fixtures : tout repris (`lost` vide), un réglage perdu, une référence livrée qui change (`reference`).

L'app étend `profile_repair_status` à ces champs au drop ; d'ici là, chaque réglage perdu est nommé dans le journal
(`reference_suivie`) et part au relevé de télémétrie.
