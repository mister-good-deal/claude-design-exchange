# Demande Claude Design — 0.8.0 : les réglages de lecture par style et par taille

Issues d'origine : [#500](https://gitlab.laneuville.me/rom1/tatami/-/issues/500) et
[#505](https://gitlab.laneuville.me/rom1/tatami/-/issues/505) (G1 note 12709). Écrivain exchange : lt-atelier. Ce
fichier appartient à la MR du lot ; il ne livre aucun écran, aucun CSS app, aucune édition de `ui/`. Publiée le
2026-09-28 sur l'accord de Romain : `roomprofile-080-reglages-par-style.md` sur l'exchange.

## Ce que le moteur change

La chaîne de lecture d'une zone se résout en quatre étages, du moins au plus précis : le **défaut** de la room, l'écart
de son **style** (le paquet de glyphes où la zone est rangée : « fin », « gras »), l'écart **taille × style**, et la
surcharge de la **zone** elle-même. Chaque étage ne porte que ses écarts. Le seuil de luminance n'est plus un réglage de
la taille : c'est un champ de la chaîne comme `series.gap`, réglable à chaque étage.

- Servi : `PipelineRunDto.profile` (la réponse de « Exécuter » à l'Atelier) = `{ style, chain, stages }`, la chaîne que
  le profil écrit pour la zone à la taille de la capture, et l'étage de chaque champ écrit (`stages["luma.threshold"]
  = "sizeStyle"`). Un champ absent de `stages` vaut le défaut du lecteur. L'essai en cours n'y est pas.
- Écrit : `setReading(room, sizeId, target, path, value)`, `target` = `{ stage: "default" }`, `{ stage: "style", style
  }`, `{ stage: "sizeStyle", style }` ou `{ stage: "zone", zone }` ; `path` = `"luma.threshold"`, `"series.gap"`… ;
  `value` = nombre, booléen, mot, ou `null` pour retirer l'écart. Rend la passe du banc de la taille (avant / après).
- Retiré : `AmountScaleDto.threshold` et le champ `threshold` de `setAmountTreatment`.

## Ce qui est attendu de l'écran

1. **Le panneau « Traitement de la taille » perd son champ « Seuil de luminance ».** Ses quatre réglages d'échelle
   (noyau, espace, facteur, plancher) restent.
2. **Chaque carte d'étape de l'Atelier** montre la valeur de l'essai et, pour chaque champ, l'étage qui fixe la valeur
   écrite (`stages`). Une valeur qui diffère de celle de l'étage au-dessus est **contrastée**.
3. **Trois gestes nommés**, qui écrivent chacun le champ touché à un étage :
   - « Sauvegarder pour cette taille » → `sizeStyle` du style de la zone ;
   - « Enregistrer comme défaut du style « fin » » → `style` ;
   - « Revenir » à côté d'un champ contrasté → `null` à l'étage qui le fixe.
   L'actuel « Enregistrer comme défaut du profil » reste (étage `default`).
4. L'écran ne résout rien : l'étage, la valeur et le style sont servis.

En attendant le drop, le champ « Seuil de luminance » du panneau taille est servi vide et refuse en nommant où le
réglage vit désormais ; les étages ne s'écrivent que par la commande.
