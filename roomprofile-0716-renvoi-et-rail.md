# Demande Claude Design — 0.7.16 : le renvoi porte sa cible, une ligne de pixel tient sur une ligne

Issues d'origine : [#322](https://gitlab.laneuville.me/rom1/tatami/-/issues/322) (bloquant),
[#321](https://gitlab.laneuville.me/rom1/tatami/-/issues/321), [#318](https://gitlab.laneuville.me/rom1/tatami/-/issues/318)
— campagne Windows 0.7.15 (2026-09-17), lot lt-atelier [#325](https://gitlab.laneuville.me/rom1/tatami/-/issues/325).
Écrivain exchange : lt-atelier. Ce fichier ne livre aucun écran, aucun CSS app, aucune édition de `ui/`.

## 1. « Aller valider le bouton ▸ station 4 » emporte sa cible (#322, bloquant)

**Terrain.** Station 5 en 698×720, cible « Deux boutons (fold / call) — Fold », sans couleur. Le bouton renvoie en
station 4, où rien n'est armé et où la capture tenue est une capture à deux boutons. Deux puces « Fold » sont dans le
rail, une par barre. La pose part sur `probe.three_buttons.fold` et le moteur la refuse : « inapplicable, attend
actions=three_buttons ».

**Cause.** `TargetWaiting` (`PipetteTool.tsx`) n'émet que `on.onReplayStation?.("adjust")`. Ni la sonde, ni la
taille, ni la capture ne partent avec le geste. C'est la règle durable de 0.7.14 : un geste qui arme une autre station
emporte l'adresse complète de ce qu'il arme. L'app ne la devine jamais depuis un état local.

**Attendu.**

| Où | Aujourd'hui | Attendu |
|---|---|---|
| Contrat | `onPlacePoint?: (sizeId, pointId) => void` | `onPlacePoint?: (sizeId, pointId, shotId?) => void` : `shotId` est la capture sur laquelle la station 4 doit arriver, celle qui atteste la barre du pixel. |
| `TargetWaiting` | `onReplayStation("adjust")` | `on.onPlacePoint(bucket.id, target.pointId, target.shot.id)` : la taille du bandeau que la station 5 lit, le pixel de la sonde et la capture qui atteste sa disposition (`shotForVariant`). Le bouton ne s'affiche que si les trois existent. |
| Libellé du bouton | « Aller valider le bouton ▸ station 4 » | il nomme ce qui sera armé : « Poser le pixel Fold · 2 boutons ▸ station 4 » / “Place the Fold · 2 buttons pixel ▸ station 4” |
| `ActuatorRow` (« Pointer le pixel », `bet_blur`) | `onPlacePoint(data.activeSizeId, point.id)` | `onPlacePoint(bucket.id, point.id)` : la taille que la station 5 lit, sans capture (la station 4 garde la sienne) |

L'app arrive en station 4 sur cette taille, tient cette capture (servie par `WizardState.activeShotId`) et sert le
pixel armé. L'écran n'a rien à tenir.

## 2. Station 4 — une puce de pixel n'arme rien sur une barre que la capture n'atteste pas (#322)

**Terrain.** La capture affichée montre deux boutons ; la puce « Fold » du groupe « Trois boutons » arme quand même la
pose, et l'écriture est refusée par le moteur après coup.

**Attendu.** Dans `ZoneRail` (`PixelRow`), une puce de sonde déclinée (`point.variant` présent) dont la capture servie
n'atteste pas la déclinaison (`attestsVariant(shot, point.variant.id)` faux) :

- n'émet **pas** `onSelectPoint` : rien n'est armé, aucune pose ne peut partir ;
- dit ce qu'elle attend, sur la ligne ou en note : « attend une capture à trois boutons » / “needs a three-button
  capture” (le libellé de la déclinaison servi, pas un texte figé) ;
- garde son œil et sa couleur.

Une puce de la barre attestée arme comme aujourd'hui. Le pixel neutre et les cibles de clic ne sont pas concernés.

## 3. Station 4 — une ligne de pixel tient sur une seule ligne (#321)

**Terrain.** Rail « Pixels de référence », 698×720, trois déclinaisons. La mention « suit la ROI de son bouton —
validé avec elle » s'intercale entre la ligne et l'œil : **l'œil passe à la ligne, seul**. Le « Pixel neutre », sans
mention, garde son œil sur la ligne. Romain : « les nouvelles lignes pour les pixels de référence sont trop longues ».

**Attendu (Romain).** Une ligne de sonde a la forme d'une ligne de ROI : pastille, nom, étiquette et œil sur **une
seule** ligne. La mention ne rallonge pas la ligne et ne repousse pas l'œil : dites-la **une fois** par groupe de
déclinaison (sous son en-tête), ou dans le `title`, à votre choix. La note « à reprendre » de `bet_blur` et la note
du §2 passent **sous** la ligne, pleine largeur, l'œil restant sur la ligne.

## 4. Noms accessibles : la déclinaison survit dans chaque nom (#318)

**Constat.** Le libellé visible d'une ligne est l'action seule (#313, correct). Mais les noms accessibles aussi, donc
une taille qui porte deux barres annonce deux fois le même nom :

| Où | Aujourd'hui | Attendu |
|---|---|---|
| Station 4, puce de pose (`pixelPlaceAria`) | « Poser le pixel de référence — Fold » ×2 | « Poser le pixel de référence — Fold · 2 boutons » |
| Station 4, puce posée (sans `aria-label`, nom tiré du contenu) | « Fold #1A2B3C » ×2 | nom composé par `pixelLabel` |
| Station 4, œil (`hideAria` / `showAria`) | nom de la ligne | nom composé par `pixelLabel` |
| Station 5, ligne de cible (`probeSelectAria`) | « Afficher le pixel Fold » ×2 | « Afficher le pixel Fold · 2 boutons » |

Le manifeste du drop `2026-09-16` le prévoit déjà (`parity.pixelLineOneButton` : la composition survit dans chaque
nom accessible) ; la surface de pose armée l'applique, pas le rail. Le texte visible ne change pas.

## 5. Station 4 — sur un écran de fin, seule `requeue` s'affiche (#320, ajout du 2026-09-17)

**Terrain.** Capture #46 en 1572×1080 : « Vous avez été éliminé du tournoi… Disputer une autre partie ? ». La station
4 cache déjà la barre d'action, le board, les cartes et les vilains (#312). Elle affiche pourtant encore les blindes,
les pots, la mise et le tapis du héros, alors qu'une seule ROI est attendue : `requeue`.

**Règle (moteur, G1 de #320).** Le catalogue déclare, en plus de `requires`, les attestations qui **excluent** une
zone. Pour toute zone sauf `requeue`, cette exclusion est `requeue/present`. Le moteur refuse déjà d'écrire ou
d'admettre une zone exclue sur une capture qui atteste son exclusion. L'écran doit maintenant cesser de l'afficher.

| Où | Aujourd'hui | Attendu |
|---|---|---|
| Contrat | `Zone.requires?: string[]` seul | `Zone.excludedBy?: string[]`, des ids de variante (`requeue/present`), servis par l'app comme `requires` ; absent ou vide = rien n'exclut la zone |
| `requiresMet` / `derivedHidden` | une zone est masquée si aucune de ses `requires` n'est attestée | elle l'est aussi si **une** de ses `excludedBy` est attestée par la capture chargée (`attestsVariant`) : même calcul pur, recalculé à chaque capture, l'œil manuel posé par-dessus comme aujourd'hui |
| Rail, canvas, gabarit | les zones de `derivedHidden` ne se dessinent pas et disent pourquoi | idem pour une zone exclue ; `requeue` reste la seule ROI dessinée sur cette capture |

Le geste manuel qui révèle une ROI masquée (A3) garde sa règle. S'il ne sait pas réécrire une exclusion de façon
symétrique, il ne révèle pas une ROI exclue : corriger le label de la capture reste le chemin.

## Fixtures

- Station 5 : une cible sans couleur dont la barre est attestée par une capture qui n'est **pas** la principale, pour
  que le renvoi du §1 porte un `shotId` distinct.
- Station 4 : une taille à deux barres, capture servie à deux boutons, pour que les puces « Trois boutons » rendent
  l'état du §2.
- Station 4 : une capture « Relancer » (`requeue/present`) sur une taille calibrée, pour que le §5 rende les zones de
  table masquées et `requeue` seule.
