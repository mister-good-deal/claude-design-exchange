# Room Profile v3 — correctifs terrain (validation Windows 0.6.0)

La calibration v3 a été jouée en conditions réelles sur Windows (vraie room, vraies fenêtres, vraie campagne de
métrologie). Les stations 1 et 2 sont validées fonctionnellement ; les stations 3 et 4 sont bloquées ou amputées par
des trous **côté écrans DS**. Ce fichier est la liste de travail — elle survivra à plusieurs itérations, coche les
points au fil des drops. Tout est observé sur le build réel, rien n'est spéculatif.

Priorité de haut en bas dans chaque section. Les callbacks cités existent déjà dans `RoomProfileCallbacks`
(`RoomProfile.fixtures.ts`) sauf mention « NOUVEAU ».

## A — Station 3 (TourStation) : l'aperçu n'affiche jamais rien 🔴

`TourStation.tsx` — la surface d'aperçu est `<div className={styles.monitor} />`, une boîte décorative sans enfant.
`live.imageUrl` est calculé et transmis par l'app, puis ignoré : pendant le tour le joueur pilote À L'AVEUGLE (il
doit regarder la vraie fenêtre à côté), et la vignette d'un shot sélectionné dans le menu « Capture » ne s'affiche
pas non plus. Le DS sait déjà rendre ces images (`CalibrationCanvas.tsx` et `CoverageMatrix.tsx` consomment
`imageUrl`).

Demandé : rendre la frame live (`tour.live?.imageUrl`) dans `.monitor`, et le shot sélectionné (`activeShotId`)
quand il y en a un. Le câblage data existe des deux côtés — il manque l'`<img>`.

## B — Station 4 (AdjustStation) : aucun de ses gestes n'est réalisable 🔴

Constaté en live : on peut déplacer des rectangles, c'est tout. Pas de sélection, donc pas de resize ; pas de
changement de capture ; pas de « Test » ; pas de confirmation de zone. Tout existe pourtant dans l'Établi
(`RoomProfileBench.tsx`). `AdjustStation.tsx` construit le canvas sans `selectedZoneId` ni `onSelectZone` — or
`RoiBox` ne rend ses poignées QUE si `selected` (`CalibrationCanvas.tsx`) : le redimensionnement y est
structurellement impossible. Le shot est figé sur `bucket.shots[0]` (même pas le primaire), et `AdjustStation`
passe `onTestClick`/`onConfirmZone` au canvas qui ne les référence pas (câblage mort — aucun bouton ne les
déclenche).

Demandé, dans l'ordre :
1. Sélection de zone dans la station 4 (`selectedZoneId`/`onSelectZone`, comme l'Établi) → poignées de resize.
2. Choix de la capture de fond (bande de vignettes ou équivalent, primaire par défaut — `onSelectShot`).
3. Les gestes de l'inspecteur de zone accessibles depuis la station : « Confirmer l'ajustement »
   (`onConfirmZone`) et « Test — clic à blanc » (`onTestClick`). C'est LE geste central de la station selon le
   parcours — aujourd'hui il faut connaître l'onglet Établi pour le trouver.

## C — Zones absentes d'une capture (station 4 / Établi) 🟠

Plusieurs zones n'existent que dans une situation précise (`actions.slider`, `bet_input`, `bet_button` slider
ouvert ; `raise/fold` en 3-boutons). Sur une capture où elles sont invisibles, le joueur les place à l'aveugle —
aucune affordance ne permet de dire « cette zone n'est pas sur ce shot ». Le mécanisme « différée » ne couvre que
les variantes de la station 3, pas les zones.

Demandé : une affordance « absente de cette capture » sur la zone sélectionnée. NOUVEAU callback proposé :
`onMarkZoneAbsent?: ((sizeId: string, zoneId: string, shotId: string) => void)` — optionnel comme les autres,
l'app le câblera au drop suivant.

## D — Vignettes de captures sans image (Établi, ShotStrip) 🟠

`RoomProfileBench.tsx` (ShotStrip) : `<span className={styles.shotImg} />` est un span vide — `.shotImg` déclare
déjà `background-size: cover` et réserve 50 px, tout est prêt pour une image de fond et il n'y en a aucune.
Choisir la bonne capture parmi 12 horodatages est une devinette. Une ligne :
`style={{ backgroundImage: \`url(${s.imageUrl})\` }}` quand `imageUrl` est présent.

## E — Layouts « surface d'abord » (station 2 + Établi) 🟠

Demande produit verbatim : « un layout 1 pleine largeur (la surface de travail) et les 2 autres colonnes en
dessous ». Deux écrans concernés, même cause :

- **Station 2 (métrologie)** : l'aperçu de géométrie occupe le tiers central et rend un rectangle en pointillés
  quasi vide, libellé minuscule, échelle illisible. L'aperçu est une SURFACE, le journal et les résultats sont des
  LISTES qui se lisent très bien en demi-largeur. Aperçu pleine largeur, déroulé + résultats en dessous sur deux
  colonnes.
- **Établi** : la capture de table — l'objet travaillé au pixel près — est dans une colonne centrale étroite et
  apparaît ROGNÉE ; sur un écran de 1280 la zone utile fait moins de la moitié de l'espace. Image pleine largeur
  (non rognée), rail des buckets + inspecteur en dessous.

## F — L'épine ne défile pas : contenu inatteignable 🟠

Sur la home des 6 stations, « Chemin critique — 18 gestes » n'en affiche que 9 et le panneau « Exigences » est
coupé au ras du bas de fenêtre — les gestes 10→18 et les blocages restants sont inatteignables, or ce sont les
listes qui disent au joueur quoi faire ensuite. `RoomProfile.module.css` mêle `overflow: hidden` sur le conteneur
racine et `overflow: auto` sur des colonnes internes — le `hidden` racine coupe vraisemblablement le défilement.
Demandé : les panneaux de l'épine défilent (ou le conteneur racine cesse de rogner).

## G — Navigation du wizard (6 stations) 🟠

Demande produit verbatim : des **flèches précédent/suivant** entre stations et un **bouton de retour au menu
principal** dans l'en-tête de station (« Station N/6 — … »). Aujourd'hui rien ne permet de quitter une station ni
d'aller à la suivante — le seul moyen est de changer d'onglet. Aucun nouveau callback nécessaire : `onSetView`
couvre les trois gestes (`{ wizard: { station } }` / `"spine"`).

## H — Provenances de métrologie : « clamp moniteur » affiché à tort 🟠

Le type `Provenance` n'a qu'une valeur `clamped`, libellée « clamp moniteur » — or la mesure réelle a rendu un max
clampé PAR LA ROOM (`room_clamp`, moniteur 3840×1080 qui ne bride rien) : l'écran nomme la mauvaise cause et
l'opérateur ne peut pas faire la distinction demandée par la procédure de validation.

Demandé : scinder `clamped` en `roomClamped` (« clamp room ») et `monitorClamped` (« clamp moniteur ») dans
`Provenance` + i18n. L'app mappera `room_clamp`/`monitor_bound` dessus dès l'export.

## I — Station 2, honnêteté des résultats 🟡

- Un badge d'état est posé sur chaque ligne du panneau de résultats MÊME sans valeur (ex. « CHROME FIXE — DÉRIVÉ »
  sur une valeur vide, constaté après une campagne en échec) : trompeur — pas de badge sans valeur.
- Ligne MAX : la valeur `2050×1080` est recouverte par ses deux badges (« clamp moniteur » + « MESURÉ ») — seule
  ligne à deux badges, elles se superposent au texte.

## J — Canvas : sélectionner ≠ déplacer 🟡

`CalibrationCanvas.tsx` : le `pointerdown` sur une boîte démarre simultanément la sélection ET un déplacement —
une simple sélection décale la zone de quelques pixels, sur une station dont le but est la précision au pixel.
Demandé : seuil de déplacement (~3 px de mouvement pointeur avant que le move ne commence), et poignées visibles
au survol (pas seulement à la sélection) pour la découvrabilité.

## K — Copy : l'estimation « ~40 s » de la métrologie 🔵

`metroRun` / `metroWarn` annoncent « ~40 s » ; la campagne réelle mesurée dure ~6 s (trois campagnes : 6,3 / 6,28 /
6,23 s). Remplacer par « ~10 s » ou retirer le chiffre.

## Contexte utile (pas d'action DS)

- L'app atteste désormais l'objectif armé à la capture (la station 3 marche sur un profil neuf) ; « Corriger… »
  re-poste encore les prélabels vides — si vous ajoutez une sélection manuelle de variantes au dialogue de
  correction, l'app suivra.
- La liste des fenêtres de la station 1 est désormais rafraîchie en continu côté app — pas besoin de bouton
  « Actualiser ».
