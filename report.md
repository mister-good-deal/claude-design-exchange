# Vague 0.6.15 — demandes au design system (drop `tatami 2026-09-02` intégré, drop-in clean, merci)

Cinq demandes issues de la campagne Windows 0.6.14 (première traversée complète des stations 1 à 6 ; rapport
`recon/win-validation-2026-09-02/REPORT.md`). Toutes en station 4 et 5. Un seul drop quand tout est prêt.

## 1. Station 4 — les flèches déplacent d'UN pixel réel (#131)

Aujourd'hui `CalibrationCanvas` déplace de `STEP = 0.2` **% de la fenêtre** : 2,1 px en largeur, 1,4 px en hauteur sur un
bucket 1048×720 — pas un pixel, pas isotrope, et indépendant du zoom alors que l'écran annonce « un pixel réel ».
Demande : un appui = **un pixel de la capture**, sur chaque axe, quel que soit le bucket (le canvas connaît la taille du
bucket : convertir à l'appui, `1 / bucket.width` et `1 / bucket.height`, le rect reste en pourcentage). `Maj + flèches`
(redimensionner) prend la **même unité** — un seul vocabulaire dans le même geste ; le libellé d'aide suit (« 1 px »).

## 2. Station 4 — sélection multiple de ROI et déplacement de groupe (#132)

Le seed dérive par groupes (vilains trop hauts, barre d'actions trop basse) : il faut corriger un sous-ensemble d'un
même geste, pas tout. Demande :

- **Ctrl + clic** sur une ROI l'ajoute à la sélection ou l'en retire (rail et canvas) ; état multi-sélection visible
  (les ROIs sélectionnées se distinguent de la ROI focus).
- Un bouton **« Tout sélectionner »** près du focus, et un moyen de vider la sélection (Échap ou bouton).
- Les **flèches s'appliquent à toutes les ROIs sélectionnées**, du même vecteur (en pixels réels, cf. 1).
- Contrat : `selectedZoneIds: string[]` ; callbacks `onToggleZoneSelection(zoneId)`, `onSelectAllZones()`,
  `onClearSelection()`, **`onNudgeZones(zoneIds, dxPx, dyPx)`** (un seul appel par appui pour tout le groupe — l'app
  fait un seul commit). Le drag souris reste mono-ROI.

## 3. Sélecteur de captures — numéro de prise et état sélectionné franc (#134)

Sous chaque vignette : **`#1`, `#2`, …** (le numéro de prise, déjà servi dans les données depuis #107) à la place de
l'heure — l'heure passe en tooltip. La vignette **active** doit se voir : bordure épaissie **et** un second indice (fond
ou teinte) — un liseré de 1 px ne se lit pas sur six vignettes sombres.

## 4. Station 5 — le crop d'une carte se tient en hauteur, le zoom en option (#138)

Sur une cible d'enseigne, un crop de 54×63 px est rendu sur plus de 700 px de haut : le chiffre déborde, il faut
défiler pour voir la carte et les relevés. Demande : **la vue tient le crop entier en hauteur par défaut** (sans
défilement, quelle que soit sa taille) et le **zoom est une option** pour viser un pixel — l'inverse d'aujourd'hui. Le
même onglet le fait déjà bien sur un bouton (148×59 px tient dans la vue) : aligner le crop de carte sur ce comportement.

## 5. Station 5 — écarter UN segment de la découpe d'un montant (#139)

La segmentation des montants est « assez propre », mais un segment d'artefact de trop (5 segments pour `25BB`) force
aujourd'hui à **écarter toute la ROI** — quatre glyphes justes perdus pour un faux. Demande :

- Chaque **segment est cliquable pour l'écarter** (et le reprendre) — état écarté visible (barré/atténué), cohérent avec
  « Écarter cette ROI » un niveau au-dessus.
- **La saisie fait foi comme signal** : quand le nombre de caractères saisis ≠ nombre de segments gardés, l'écran le
  dit à l'endroit de la saisie (« 4 caractères, 5 segments — écartez le segment en trop ») au lieu d'un refus muet.
- Contrat : `rejectedSegments: number[]` par crop dans les données ; callback `onToggleSegment(shotId, zoneId, index)`.
  Le verdict d'écart vient de l'app (`segmentMismatch: { typed, kept } | null`).

---

Rien d'autre ne change : l'interrupteur de feature et le compteur « k / N ROI validées » du drop précédent sont
intégrés et verts. Le rapport de gate suivra le même canal.
