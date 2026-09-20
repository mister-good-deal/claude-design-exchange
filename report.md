# Rapport de vague — 0.7.18 (2026-09-20)

Écrivain : lt-atelier. Ce rapport **remplace** celui de la 0.7.17 (passe 4), dont les deux points sont honorés par le
drop `2026-09-19.3`, importé dans la 0.7.17 (MR !379) : rien n'est à en reprendre. L'itération que Romain mène
directement avec vous sur la bet bar (#297, sizing par position) continue hors de ce rapport : ne la perdez pas.

Fichier de la vague : [`roomprofile-0718-defauts-de-campagne.md`](./roomprofile-0718-defauts-de-campagne.md)
(source : `doc/agents/claude-design-0718-defauts-de-campagne.md`). **Huit demandes, un seul drop. Rien d'autre.**

## Pourquoi cette vague

Campagne Windows du **2026-09-20**, la première qui va jusqu'au **dry-run complet des sept tailles** : quatre tailles
calibrées ont enfin leurs 13 rangs et leurs deux paquets de montants, et le moteur ne rend **aucune lecture fausse**.
La station 5 pose sur place, comme la vague 0.7.17 le demandait — tenu à l'écran, confirmé au terrain.

La campagne s'arrête avant « Écrire », et ce qui a coûté du temps à Romain, cette fois, tient en huit défauts
d'affichage. Deux d'entre eux ont leur **cause déjà tenue dans le code** — elles sont dans le fichier, inutile de les
chercher :

- **#402**, la ligne ocre qui traverse l'écran : `.segment` n'est pas `position: relative`, donc son `::after` barré
  (segment écarté) s'ancre au premier ancêtre positionné — un panneau — et prend sa largeur, tournée de 22°.
- **#400**, l'image décalée de 10 px sous le contour de la ROI : `.surfaceImg` n'est calée qu'en **largeur**, sa
  hauteur sort du ratio intrinsèque de l'image, alors que le cadre tient son `aspect-ratio` de nombres **arrondis à
  l'entier** ; `--iy` multiplie l'écart par `crop.top / crop.h`, onze fois ici.

## Les huit demandes

1. **`ColorSurface` (#400)** — l'image est calée sur ses **deux** axes (`--ih = 10000 / crop.h`, `.surfaceImg` prend sa
   hauteur) : contour et contenu coïncident dans les deux vues. Même correction dans `AssetFrame` / `.pipeSrcImg`.
2. **`.segment` (#402)** — `position: relative` : la barre d'un segment écarté tombe sur son segment, jamais sur
   l'écran.
3. **`DryRunRow` (#405, point 2)** — l'action d'une ligne est toujours visible dans sa colonne, le libellé de la taille
   n'est jamais tronqué : **rien d'actionnable derrière un défilement horizontal**, dans aucun panneau.
4. **Couverture par style (#404)** — une taille affichait « 12 / 12 » sur les montants avec un paquet `fin` à 9 / 12.
   Décision de Romain : **un détail par style, ni un total ni un minimum**. Une ligne de couverture porte un
   `packLabel?` servi ; `covered` / `required` d'un total deviennent optionnels.
5. **Ambre du dry-run (#373, #388)** — le moteur compare désormais chaque lecture à la vérité saisie : une lecture sans
   vérité est « lue, non vérifiée ». `DryRunZone.verdict` gagne `"unverified"` et son ton ambre ; une passe rend son
   compte **vert et ambre**, jamais additionnés ; son état reste servi.
6. **`TruthComposer`** — ⌫ ôte **un glyphe**, pas un caractère : « 1,5BB » donnait « 1,5B », une vérité qu'aucun
   gabarit ne peut former (`BB` est un seul code du catalogue servi).
7. **`GlyphTruth.verifiedOn` (#397)** — une ligne de contrat : c'est le nombre de captures **autres** que celle où la
   vérité a été saisie. Aucun markup ne bouge.
8. **Récolte automatique (#368)** — décision de Romain : la vérité saisie se propage **seule** aux jumelles, le geste
   manuel devient l'exception signalée. `ExtractReport` gagne un bloc `harvest` servi — une ligne verte par taille
   récoltée, une ligne **ambre « à corriger »** par taille où la découpe n'a pas rendu le même nombre de segments,
   avec son détail servi. « Relancer l'extraction » redevient la passe de découpe, et ne récolte plus rien.

## La norme, rappelée

`doc/architecture/contrat-des-stations.md`. **P2** (badge, compteur et lignes d'une taille sortent du même verdict
servi) porte les points 4 et 5 ; **P9** (le design system affiche, l'app décide) interdit le total du point 4 comme le
recompte du point 5 ; « ce qui est affiché est ce qui est écrit » porte les points 1 et 2 — un contour qui ne tombe pas
sur ses pixels est un mensonge d'écran.

**Ne rien changer d'autre dans le drop.** Avant d'exporter : `tsc` vert, lint avec le [`lint-bundle/`](./lint-bundle/)
à jour (`npm install`, `npm run fix`, puis `npm run check`, qui doit rendre **0**), react-doctor à **zéro**
diagnostic, erreurs et warnings.
