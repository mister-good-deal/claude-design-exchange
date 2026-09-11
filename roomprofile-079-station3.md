# Demande Claude Design — 0.7.9 : la station 3 dit ce qu'elle refuse et ce qu'elle diffère

Issue d'origine : [#281](https://gitlab.laneuville.me/rom1/tatami/-/issues/281) (constats terrain #278, #276, #277,
campagne Windows 0.7.8). Écrivain exchange : lt-atelier. Base DS : drop `BucketCoverage` de #275 tel qu'importé en
0.7.8 (MR !259). Un seul drop cumulatif attendu. Ce fichier appartient à la MR du lot ; il ne livre aucun écran,
aucun CSS app, aucune édition de `ui/`.

## Ce que le terrain a montré

En station 3, douze aperçus existaient sur disque et **aucun ne s'affichait** : l'hôte (protocole asset de Tauri)
refusait chaque URL, et l'erreur n'existait que dans la trace. Le moniteur rendait un `<img>` cassé, les vignettes
du sélecteur une case vide — indistinguables d'une capture sans image. Le joueur ne pouvait ni juger ni attester une
prise qu'il ne voyait pas. L'app ne sait pas qu'une URL est refusée : le seul point de détection est l'élément
`<img>` lui-même, donc le markup DS. L'idiome existe déjà dans `PipelineFrame` : `onError` → `data-failed="true"` +
phrase `pipelineImgFailed`.

## #278 — un asset refusé se voit

| Élément | Aujourd'hui | Attendu |
|---|---|---|
| Moniteur de la station 3 (`MonitorSurface`, `<img className={styles.monitorImg}>`) | `<img>` cassé, silencieux | sur `onError`, la surface prend l'état d'échec : callout `data-tone="alert"` avec une phrase propre, nouvelle chaîne `tourShotRefused(label)` — « #3 — image refusée par l'hôte ». Distinct de `tourShotNoImg` (aucune image servie) : ici l'app a servi une URL et l'hôte l'a refusée. |
| Vignettes du sélecteur (`ShotStrip`, `backgroundImage` sur `shotImg`) | case vide, aucun événement | la vignette porte un `<img>` (ou une sonde `<img>` cachée derrière le fond) ; sur `onError`, `data-failed="true"` sur `shotImg` et le slot `shotNoImg` dit `shotImgRefused` — « refusée ». Le bouton reste cliquable : la prise existe, on peut la supprimer. |
| Aperçus des autres stations partagés par `ShotStrip` (4, 5) | idem | même rendu, gratuit par le composant partagé. |

Aucun champ de contrat : `Shot.imageUrl` reste ce qu'il est, la détection est celle de l'élément. L'app couvrira le
rendu par un test de container qui déclenche `error` sur l'`<img>` d'une capture fixture.

## #276 — rien de dérivé pendant la série, dit à l'écran

L'app ne relit plus la couverture à chaque F9 : pendant une série, seule la liste des prises est relue ; la
couverture se recalcule **une fois**, à la sortie de la station. Attendu : une note statique en station 3, sous la
`BucketRail` ou au pied de la colonne de capture — « Pendant la série, rien n'est recalculé : la couverture se met à
jour quand vous quittez la station. » Nouvelle chaîne `tourCoverageDeferred`, aucun champ.

## #277 — une capture par taille (sous réserve du contrat lt-engine)

Le backend va refuser ou remplacer une capture d'une taille déjà couverte dans la série. Si le refus passe par
`calibration-capture-failed`, la bannière existante (`CaptureFailureNotice`, phrase verbatim) suffit. Si une
**remplacée** passe par le même événement, la phrase de tête « Capture refusée sur k tailles sur n » est fausse.
Proposition, optionnelle tant que le contrat n'est pas posé :

```ts
// CaptureFailure.failures[]
{ sizeId: string; message: string; kind?: "refused" | "replaced" }
```

Tête : « Capture remplacée sur k taille(s) » quand toutes les lignes sont `replaced`, « Capture refusée ou remplacée
sur k tailles sur n » en mélange ; la ligne par taille reste le message du back verbatim. Rien à changer ailleurs.
