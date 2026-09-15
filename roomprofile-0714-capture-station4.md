# Demande Claude Design — 0.7.14 : la station 4 écrit sur la capture qu'elle affiche

Issues d'origine : [#307](https://gitlab.laneuville.me/rom1/tatami/-/issues/307) (bloquant),
[#305](https://gitlab.laneuville.me/rom1/tatami/-/issues/305), [#303](https://gitlab.laneuville.me/rom1/tatami/-/issues/303)
— campagne Windows 0.7.13, lot lt-atelier [#308](https://gitlab.laneuville.me/rom1/tatami/-/issues/308). Écrivain
exchange : lt-atelier. Ce fichier ne livre aucun écran, aucun CSS app, aucune édition de `ui/`.

## 1. La capture de la station 4 est servie, jamais choisie en local (#307, bloquant)

**Terrain.** Romain affiche la capture #35 · River en station 4 et valide une carte du board : refus. Les 22 preuves
écrites dans la soirée pointent vers la capture principale (un préflop), jamais vers #35. Dans l'autre sens, une
capture choisie en station 3 est bien écrite, mais la station 4 affiche la principale au centre.

**Cause.** La station 4 tient sa capture dans son état local (`WorkbenchUI.shotId`) sans en informer l'app ; l'app
écrit les preuves de géométrie (`confirm_zone`, `update_size_geometry`) sur la capture qu'**elle** tient. Et l'écran
n'affiche jamais la capture que l'app tient. Deux vérités pour une même capture.

**Règle, pour la station 4 et tout écran à venir.** Un écran ne tient jamais en local un id de domaine (capture,
taille, zone, variante, point…) qu'une écriture de l'app utilise sans le recevoir en argument : il le **lit servi** et
**émet** le callback du contrat à chaque changement. L'audit complet de la classe est sur #307 ; la station 4 en est
le seul membre côté écran.

| Où | Aujourd'hui | Attendu |
|---|---|---|
| Contrat | `WizardState` ne porte aucune capture pour la station `adjust` | `WizardState.activeShotId?: string` : la capture que la station 4 affiche **et** sur laquelle l'app écrit. L'app la sert toujours quand la taille a une capture ; absente = la taille n'en a aucune. |
| `ZoneWorkbench` — affichage (`shotOf`, `sceneOf`) | `ui.shotId`, sinon la principale | la capture servie, sans repli de l'écran |
| `ZoneWorkbench` — vignette et pager ‹ › (`pickShot`) | `dispatch({ type: "selectShot" })` | `on.onSelectShot(sizeId, shotId)` |
| `ZoneWorkbench` — flèches ← → (`workbenchKeys`) | idem | `on.onSelectShot(sizeId, shotId)` ; toujours armées hors sélection seulement (#97) |
| `ZoneWorkbench` — bascule vers une capture qui atteste la déclinaison (`selectZone`, E5) | idem | `on.onSelectShot(sizeId, next.id)` |
| `CardTemplateTool` — sélecteur de capture | réducteur local, repli sur la principale | lit la même capture servie, émet `on.onSelectShot` : le gabarit et l'établi montrent toujours la même capture |

À garder : charger une autre capture remet à zéro les masques manuels de la précédente (A2) — sur le changement de la
capture **servie**, par comparaison au rendu, jamais par un effet ; la catégorie des pixels de référence survit (#63).
`onSelectShot` existe déjà au contrat (stations 3 et 5) : aucun callback neuf.

**Fixtures.** Une posture de station 4 dont la capture servie n'est **pas** la principale (une river), pour que la
parité et la gate de parcours la rendent.

## 2. Après « Tout sélectionner », les flèches déplacent le groupe (#305)

**Terrain.** « Tout sélectionner » sélectionne bien, mais les flèches font défiler la fenêtre ; cliquer une ROI pour
lui donner le focus dissout le groupe.

**Cause.** Les flèches ne déplacent un groupe que depuis une ROI qui a le focus DOM (`CalibrationCanvas`, `onKeyDown`
de chaque ROI) ; « Tout sélectionner » laisse le focus sur le bouton de la barre, et un clic simple dispatche
`selectZone`, qui dissout le groupe (`ZoneWorkbench`, réducteur).

Attendu :

- après « Tout sélectionner », les flèches déplacent **tout le groupe** — le focus va au groupe, ou les flèches sont
  écoutées au niveau de la station tant qu'une sélection existe ;
- un clic sur une ROI **membre** de la sélection la focalise sans dissoudre le groupe ; Échap ou un clic hors ROI
  dissout (#110) ;
- les flèches ne font jamais défiler la page tant qu'une sélection de ROI est active ;
- tout sélectionner → flèche droite → toutes les ROI de la taille se décalent d'un pixel réel, en **un seul**
  `onNudgeZones`.

## 3. « Capturer » dit qu'il ne prend que cette taille (#303)

Décision de Romain : le comportement reste, le libellé change. Le bouton ne prend qu'une capture, à la taille
courante ; F9 en prend une par taille du layout, et l'écran ne dit nulle part la différence.

- `tourCapture` : « Capturer » → « Capturer cette taille » / “Capture this size”.
- `orF9` : dit que F9 balaie toutes les tailles du layout — par exemple « F9 depuis la fenêtre de la room : une
  capture par taille » / “F9 from the room window: one capture per size”.
