# Demande durable — 0.7.3 : F9, un échec de capture doit rester visible à l'écran

Vague Claude Design de la **0.7.3** — les retours de la campagne Windows 0.7.1 (issue #220, méta #34). Cette
demande est celle de l'issue **#218** : rendre un échec de capture, avec le message du backend, et distinguer
« refusé partout » de « refusé sur une taille ».

## 1. Ce que le joueur voit

> « Je ne peux plus prendre de screenshot de la table ça bug à la capture on dirait. »

Rien n'avait bugué. Les journaux de la session disaient tout, et exactement :

```
WARN  f9_capture_refusee bucket=1048x720
      error=Limite de 16 captures atteinte pour cette taille : supprimez une capture avant d'en ajouter une nouvelle.
WARN  f9_capture_refusee bucket=698x720   (même message)
INFO  f9_capture_multi_taille tailles=0 demandees=2
```

Le message était juste, actionnable, et **invisible**. F9 n'a aucune réponse de commande : l'événement
`calibration-state` est son seul signal de succès (son `lastShotId` avance à chaque capture stockée) et le chemin
d'échec n'a pas d'équivalent — le hook journalise et s'arrête là.

**Le plafond de 16 captures par bucket est levé, purement et simplement** (décision de Romain du 2026-09-05) : il
protégeait un coût de dérivation qui ne tourne plus à l'édition, et le ménage se fait à la main. Plus de refus pour
bucket plein — et, ce qui suit pour Claude Design, **plus de compteur « 15 / 16 » nulle part**.

Ce qui reste : un F9 qui échoue pour une AUTRE raison (fenêtre disparue, taille inatteignable, disque, encodage)
doit se voir à l'écran comme le succès se voit.

## 2. Ce qu'on demande à Claude Design

### 2.1 Un bandeau, pas un toast

L'échec se rend **à la station 3**, dans la rangée de capture, à côté du bouton qui vient de le produire — au même
endroit que la bannière froide (`CaptureNotice`), et avec la même permanence. Un toast qui s'efface est exactement
ce que le terrain a perdu : le joueur regardait sa table, pas l'app.

- Ton **alerte** (le refus n'est pas une étape de la procédure, c'est un défaut).
- Il reste jusqu'à ce que le joueur le renvoie, ou jusqu'à ce qu'une capture réussisse.
- Un bouton de renvoi explicite (`onDismissCaptureFailure`), rendu seulement là où l'app le câble.

### 2.2 Ce que le bandeau dit

Une phrase de tête qui distingue les deux cas, puis **le message du backend, verbatim, une ligne par taille** — il
est déjà juste, il nomme déjà le geste à faire, l'écran ne le reformule pas (même posture que
`DryRunZone.detail` et `ReadinessLine.consequence`) :

- **refusé partout** — aucune taille n'a stocké : « Capture refusée sur les 2 tailles — rien n'a été stocké. »
- **refusé sur une partie** — au moins une taille a stocké : « Capture refusée sur 1 taille sur 2. » Les tailles
  qui ont réussi ne sont pas listées : elles sont déjà à l'écran, dans le rail des captures.

Puis, par taille refusée : `1048×720 — <message backend>`.

Le compte « partout / en partie » se dérive de la donnée servie (`captured.length === 0`), il n'est pas servi
deux fois.

### 2.3 Ce qui disparaît

`RoomProfileData.maxShotsPerSize` **quitte le contrat**. Il est servi par l'app depuis toujours et **aucun écran
ne le rend** : le garder n'aurait plus qu'un usage, fabriquer le compteur que la décision de Romain refuse.

## 3. L'événement : nom et forme

L'événement est émis par l'app (lot #218 côté code) ; cette demande en fixe le NOM et la FORME, pour que le rendu
et l'émission ne se croisent pas.

- **Nom** : `calibration-capture-failed`, à côté de `calibration-state` dans
  `apps/desktop/src-tauri/src/ipc/events.rs`.
- **Quand** : à la fin d'un geste F9 qui a produit au moins un refus. Jamais sur un geste entièrement réussi. **F9
  seulement** : le bouton de capture passe par une commande (`calibration_capture`) dont les refus remontent déjà
  en `IpcError` à la webview, et une seconde voie pour la même erreur la ferait dire deux fois.
- **Charge utile** — le vocabulaire est celui que `CalibrationStateDto.lastCaptureBuckets` emploie déjà (ids de
  bucket `"1048x720"`, composés par `size_bucket_id`) :

```ts
export interface CalibrationCaptureFailedDto {
    /** Horodatage RFC3339 UTC du geste — un événement est un FAIT daté, jamais un état. */
    at: string;

    /** Le numéro de PRISE que le geste portait, quand le store a pu en tirer un. */
    takeId: number | null;

    /** Les buckets que le geste visait, dans l'ordre où il les a parcourus. */
    requested: string[];

    /** Ceux qui ont réellement stocké une capture. Vide = refusé partout. */
    captured: string[];

    /** Un refus par taille, message backend VERBATIM (celui des `f9_capture_refusee` / `f9_taille_inatteignable`). */
    failures: { sizeId: string; message: string }[];
}
```

`capture_every_size` (`apps/desktop/src-tauri/src/calibration_mode.rs`) tient déjà les trois listes : il parcourt
les buckets demandés, rend ceux qui ont capturé, et journalise chaque refus avec son message. L'événement ne fait
que porter à l'écran ce que la fonction sait déjà.

## 4. Contrat de données

Types touchés : `apps/web/src/ui/screens/RoomProfile.fixtures.ts` (`TourState`, `RoomProfileData`,
`RoomProfileCallbacks`).

```ts
/** Ce qu'un geste de capture a refusé — la projection DS de l'événement `calibration-capture-failed`. */
export interface CaptureFailure {
    /** Horodatage déjà FORMATÉ par l'app (heure locale) : l'écran ne connaît pas le fuseau du joueur. */
    at: string;

    /** Le numéro de prise du geste, quand il y en a un. */
    seq?: number | undefined;

    /** Les tailles visées, ids de bucket, dans l'ordre du geste. */
    requested: readonly string[];

    /** Celles qui ont stocké. Vide ⇒ « refusé partout ». */
    captured: readonly string[];

    /** Un refus par taille — `message` rendu VERBATIM, jamais reformulé par l'écran. */
    failures: readonly { sizeId: string; message: string }[];
}

export interface TourState {
    /* … inchangé : sizeId, targetVariantId?, activeShotId?, window, capturedSizes? */

    /**
     * AJOUTÉ — le DERNIER geste de capture qui a refusé quelque chose, ou `null`. L'app le pose sur l'événement
     * `calibration-capture-failed` et le remet à `null` sur une capture réussie ou sur le renvoi. Absent = jamais
     * de refus dans cette session — la même lecture que `null`, donc UNE seule façon de rendre (#111).
     */
    captureFailure?: CaptureFailure | null | undefined;
}
```

Rappel ajouté à `RoomProfileCallbacks` :

```ts
/** OFFRE — renvoyer le bandeau d'échec. Sans rappel, pas de bouton : le bandeau part à la capture suivante. */
onDismissCaptureFailure?: (() => void) | undefined;
```

Il reste **hors de `RoomProfileWiring`**, comme `onDismissWriteVerdict` et `onDismissTransition` : la procédure se
termine sans lui.

**Retiré du contrat** : `RoomProfileData.maxShotsPerSize`. Aucun écran ne le lit ; l'app cesse de le servir.

Ne changent pas : `Shot`, `SizeBucket`, `onCaptureShot`, `onDeleteShot`, `TourState.capturedSizes` (« N tailles
capturées en un appui » reste le pendant heureux du bandeau), le moniteur et le pager.

## 5. i18n — clés FR/EN à prévoir dans `ui/screens/i18n.ts`

- `captureFailedAll(n)` — le pluriel se conjugue dans la clé, comme `presencePresent` le fait déjà
  - FR : « Capture refusée sur les {n} tailles — rien n'a été stocké. » (n = 1 : « sur la taille demandée »)
  - EN : "Capture refused on all {n} sizes — nothing was stored." (n = 1: "on the requested size")
- `captureFailedSome(k, n)`
  - FR : « Capture refusée sur {k} taille(s) sur {n}. » · EN : "Capture refused on {k} of {n} sizes."
- `captureFailedLine(sizeId, message)` — FR et EN : « {sizeId} — {message} » ; le message vient du backend et
  est déjà français, comme tous les refus d'IPC
- `captureFailedTake(seq)` — FR : « Prise #{seq} » · EN : "Take #{seq}"
- `captureFailedDismiss` — FR : « Renvoyer » · EN : "Dismiss"
- `captureFailedDismissAria`
  - FR : « Renvoyer l'avis d'échec de capture » · EN : "Dismiss the capture failure notice"

## 6. Fixtures

`RoomProfile.fixtures.ts`, postures de la station 3 :

1. **refusé partout** — `requested: ["1048x720", "698x720"]`, `captured: []`, deux `failures` portant le même
   message backend : c'est la posture EXACTE de la campagne, et la seule qui prouve que « rien n'a été stocké » se
   lit ;
2. **refusé sur une taille** — une taille stockée, une refusée (« taille 698×720 inatteignable : la fenêtre a
   disparu »), le bandeau à côté du rail de captures qui, lui, a bougé ;
3. **aucun échec** — `captureFailure` absent : la rangée de capture rendue comme aujourd'hui, non-régression.

## 7. Ce qui ne bouge pas

- Le bouton de capture, son `Kbd F9`, la bannière froide et « N tailles capturées en un appui ».
- Le rail des captures, le renommage, la suppression en deux temps, le pager `‹ ›`.
- `calibration-state` et son `lastShotId` : ils restent le signal du SUCCÈS, et le nouvel événement ne s'y
  substitue pas.
- Aucun compteur de budget de captures, nulle part, sous aucune forme.
