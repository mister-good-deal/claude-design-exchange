# Demande Claude Design — 0.7.21 : le seuil de luminance d'une taille

Issue d'origine : [#485](https://gitlab.laneuville.me/rom1/tatami/-/issues/485) (les montants des petites tailles, G1
option B). Écrivain exchange : lt-atelier. Ce fichier appartient à la MR du lot ; il ne livre aucun écran, aucun CSS app,
aucune édition de `ui/`.

## Ce que le moteur change

Le traitement d'une taille (`buckets[].amounts`) gagne un réglage : `threshold`, le seuil de luminance de ses montants.
Absent, la taille lit au seuil de la chaîne de lecture (140 par défaut). À 640×440, le seuil 140 efface les traits fins
— le « 1 » de tête, la virgule, la jambe du « B » — et le dry-run lisait 19 montants faux sur le corpus du 26/09 ; au
seuil 120, aucun, sans rien changer aux autres tailles.

- Servi : `AmountScaleDto.threshold` (`number | null`, `null` = celui de la chaîne).
- Réglé : `setAmountTreatment(room, sizeId, "threshold", n)` (entier 0–255, `null` rend celui de la chaîne), comme les
  quatre autres réglages. Seule différence : il est **accepté aussi à la taille de référence**, là où les quatre autres
  sont refusés, car la référence lit elle aussi au seuil de sa taille.

## Ce qui est attendu de l'écran

Station 5, panneau « Traitement de la taille » (`AmountTreatmentPanel`, `AmountTreatmentField`) : un cinquième réglage
« Seuil de luminance », champ numérique entier 0–255, vide = « celui de la chaîne », à côté du plancher de confiance. Il
est offert à toutes les tailles, référence comprise.
Même rail que les autres réglages : la réponse re-sert la passe du banc (avant / après). Bloquant pour la dernière
session : Romain doit y poser 120 à 640×440.
