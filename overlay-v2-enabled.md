# Demande Claude Design — l'interrupteur de l'overlay dans l'atelier

**Publiée le 2026-10-01** sur l'exchange :
[overlay-v2-enabled.md](https://github.com/mister-good-deal/claude-design-exchange/blob/main/overlay-v2-enabled.md).
Suivi de la vague : #548. Export et import correctifs attendus.

L'écran `Overlay` (atelier d'affichage, 0.7.20) n'a pas d'interrupteur. Or l'overlay sur les tables est une feature
qui s'arme et se coupe (`overlay.enabled`, bloc de sa feature), **coupée par défaut** (amendement 2.2.0 de la
constitution). En attendant, l'app compose la primitive DS `FeatureSwitch` au-dessus de l'écran, avec ses propres mots
en fr et en en : c'est un écart, à retirer dès l'export suivant.

## Ce que l'app demande

1. **L'interrupteur dans l'écran `Overlay`**, en tête, comme `LayoutDesigner` rend celui du tuilage :
   `data.overlayEnabled: boolean` (servi, l'écran ne garde aucun état) et `on.onSetOverlayEnabled(next)`. Ses mots
   (libellé, aide, « Actif » / « Coupé ») servis par le DS dans `STRINGS[locale].overlay`, en fr et en en. L'aide dit
   ce que COUPER fait : rien n'est dessiné sur les tables, l'atelier reste modifiable.
2. **Une ligne de refus pour les gestes de l'atelier** (géométrie, croix, « Copier vers… », interrupteur) : un
   `data.refusal?: string` rendu verbatim, comme `tagRejection` l'est pour un tag. L'app l'affiche aujourd'hui sous
   l'interrupteur, hors de l'écran DS.
3. **La réserve de fenêtres épuisée** : rendre les comptes servis `reserve.capacity`, `reserve.tracked` et
   `reserve.uncovered` avec une phrase localisée fr/en, visible lorsque des tables ne peuvent pas recevoir d'overlay.
   L'app décide de cette indisponibilité ; le DS en porte les mots et le rendu.

La baseline de parité (`BaselineApp`) compose aujourd'hui l'interrupteur de l'app au-dessus de l'écran : à l'import,
elle reviendra à l'écran DS seul.
