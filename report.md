# Vague 0.6.11 — Tatami app → Claude Design (2026-08-29)

Retours de la campagne de validation Windows 0.6.10 (session 2026-08-29, calibration from scratch). Cinq demandes,
compilées par le coordinateur ; le contrat et le lint bundle de l'exchange ne bougent pas. Ordre = priorité.

| # | Demande | Issue | Nature |
|---|---|---|---|
| 1 | Station 3 : le contrôle de suppression reste ARMÉ après une suppression (perte de données) | #96 | **bloquant** — `TourStation.DeleteControl` : désarmer sur confirmation + `key={loaded.id}` |
| 2 | Sélecteur de captures : boutons ‹ › + pas-à-pas clavier (stations 3, 4, 5) | #97 | markup + hotkeys DS en station 4 (désarmé sous sélection de zone) ; l'app câble déjà ← → en station 3 |
| 3 | Station 3 : bandeau « L'engine voit : » — n'afficher que s'il porte quelque chose, ton d'information | #98 | conditionnel + tonalité ; le producteur app est réparé en parallèle (#104) |
| 4 | Station 4 : retirer la bande rouge « N pixels à poser », les non-posés en lignes fantômes du rail | #101 | retrait `UnplacedRail` + `PixelCategory` liste les non posés |
| 5 | Station 3 : compteur « N tailles capturées » après un F9 multi-taille | #100 | contrat proposé `TourState.capturedSizes` (l'app le sert déjà : `lastCaptureBuckets`) |

Le drop se valide comme d'habitude : `pnpm import-ds <zip>` → lint:fix → tsc + react-doctor ; un rouge d'import
revient ici en rapport de gate. Côté app, le test « deux suppressions d'affilée » est posé en `it.fails` et se
plaindra au drop : c'est le signal attendu.

---

# Tatami app → Claude Design — le contrôle de suppression reste ARMÉ après la suppression

Campagne de validation Windows 0.6.10 (session 2026-08-29, branche `windows/validation-0.6.10`), station 2 du
parcours terrain — la **station 3 du wizard** dans le code (`TourStation.tsx`). Suivi côté app par l'issue #96.
Perte de données silencieuse : c'est la demande bloquante de la vague.

## Ce que le terrain a vécu

> « Quand on supprime une capture, le bouton "Confirmer la suppression" apparaît correctement et supprime bien la
> capture une fois qu'on clique dessus, mais ensuite l'état reste sur "Confirmer la suppression" au lieu de
> repasser dans un état "supprimer la capture" ; et quand on re-clique sur le bouton ça supprime directement la
> capture courante. »

Le garde-fou à deux temps ne protège que la PREMIÈRE suppression. Après elle, le contrôle reste armé, il pointe
désormais la capture **suivante** — celle que l'écran vient de charger à la place — et le clic suivant la détruit
sans rien demander.

## La cause, dans le composant

`DeleteControl` (`apps/web/src/ui/screens/TourStation.tsx:237`) porte un état local `armed` qu'aucun chemin de
suppression ne remet à `false` :

```tsx
function DeleteControl({ label, aria, confirmLabel, cancelLabel, onDelete }: DeleteProps) {
    const [armed, setArmed] = useState(false);

    if (!armed) return <Button … onClick={() => setArmed(true)}>{label}</Button>;

    return (
        <span className={styles.row}>
            <Button … variant="danger" onClick={onDelete}>{confirmLabel}</Button>   {/* ← ne désarme pas */}
            <Button … onClick={() => setArmed(false)}>{cancelLabel}</Button>        {/* ← seul reset */}
        </span>
    );
}
```

Seul « Annuler » désarme. Le composant appartient à la STATION, pas à la capture : il survit à la capture qu'il
vient de détruire, reste monté, reste armé.

## Attendu — les deux gestes, pas l'un ou l'autre

1. **Désarmer sur confirmation** : `onClick={() => { setArmed(false); onDelete(); }}`. Le geste est consommé par
   la confirmation qui l'a autorisé.
2. **Remonter le contrôle par capture** : `<DeleteControl key={loaded.id} … />` au point de montage
   (`TourStation.tsx:500`). Une confirmation armée sur une capture ne vaut pas pour une autre — le changement de
   capture au sélecteur (ou la navigation ‹ › de la demande jumelle, `ds-report-rpv3-selecteur-captures-navigation.md`)
   doit ramener le contrôle au repos, exactement comme une suppression.

Le point 1 seul laisserait un armement traverser un changement de capture ; le point 2 seul ferait dépendre la
correction d'un remontage qui n'a lieu que si l'id change (supprimer la DERNIÈRE capture d'un bucket, par exemple,
ne remonte rien). Les deux ensemble ferment le cas par construction.

## Ce que le rail voisin fait déjà bien — à ne PAS toucher

`ShotStrip` (`ShotStrip.tsx`, la bande de vignettes de la station 4, montée en `ZoneWorkbench.tsx:500`) porte son
propre contrôle à deux temps, `ThumbDelete`, et lui **désarme sur confirmation** (`setArmedId(null)` avant
`onDelete`), avec un armement adressé PAR capture (`armedId === s.id`). C'est le comportement demandé ici. L'issue
#96 annonçait le défaut partagé avec `ZoneWorkbench.tsx:505` : après relecture, la station 4 est saine, seul
`TourStation` est atteint. Aucune modification attendue sur `ShotStrip`.

## Côté app : le test est écrit, il est rouge

`apps/web/src/app/screens/RoomProfile.test.tsx` — « station 3 : deux suppressions d'affilée exigent chacune leur
confirmation (#96) » supprime deux captures de suite sur le bucket 960×600 (six captures fixture) et exige la
double confirmation à chaque fois. Il échoue aujourd'hui exactement sur l'assertion utile : après la première
confirmation, `Supprimer la capture …` n'est pas revenu. Il est porté par `it.fails` — vert tant que le drop n'est
pas là, et il SE PLAINT le jour où il passe : c'est le signal de retirer le `.fails`, pas une gate rouge laissée à
plaider.

## Critère de fermeture (terrain)

Supprimer deux captures d'affilée en station 3 demande deux fois « Confirmer la suppression » ; changer de capture
avec une suppression armée ramène le bouton au repos. Verdict rendu par Romain sur la prochaine campagne Windows.

---

# Tatami app → Claude Design — sélecteur de captures : deux boutons ‹ › et le pas-à-pas au clavier

Campagne de validation Windows 0.6.10 (session 2026-08-29, branche `windows/validation-0.6.10`), station 2 du
parcours terrain — la **station 3 du wizard** dans le code. Suivi côté app par l'issue #97. La demande vaut pour
toutes les surfaces qui travaillent sur une capture chargée (stations 3, 4, 5).

## La demande de Romain

> « Il serait bon de pouvoir changer de capture avec les raccourcis clavier flèche droite et flèche gauche (et les
> mettre en boutons dans l'UI). »

Changer de capture demande aujourd'hui d'ouvrir le sélecteur et d'y désigner une entrée. Or le geste est SÉRIEL :
on parcourt les captures d'un bucket pour attester ce que chacune montre, comparer une géométrie de l'une à
l'autre, ou chercher celle qui porte une enseigne donnée (#81). Un pas-à-pas précédent / suivant est ce qu'on fait
réellement.

## Ce que le DS doit rendre

### 1. Deux boutons ‹ › à côté du sélecteur

- **Station 3** — à côté du `Select` des captures (`TourStation.tsx:527`, la rangée `t.shotField`) : « ‹ » à
  gauche, « › » à droite. Boutons `size="sm" variant="ghost"`, chacun avec son nom accessible (une chevron sans
  texte n'est pas un fait) : proposition de clés `shotPrev` / `shotNext`, fr « Capture précédente » /
  « Capture suivante », en « Previous shot » / « Next shot ».
- **Station 4** — même paire, à côté de la bande de vignettes `ShotStrip` (`ZoneWorkbench.tsx:500`). Le composant
  est partagé : les deux boutons y ont leur place, à la même adresse que la sélection.
- Un bucket à moins de deux captures : les boutons sont `disabled`, jamais absents — une commande qui disparaît
  fait douter de son existence.

### 2. Bouclage en fin de liste : OUI

C'était le point laissé ouvert par l'issue. **Valeur retenue : la liste boucle** (dernière → première, première →
dernière). Deux raisons : un bucket de six captures se parcourt en rond pendant une attestation, et un bouton qui
se désarme en bout de liste demande au joueur de savoir où il est dans une liste qu'il ne regarde pas. À
contredire par Romain si le terrain le dément — le comportement est écrit ici pour qu'il ait quelque chose à
contredire.

### 3. Le point de départ : la DERNIÈRE prise

Quand l'app ne nomme aucune capture (`TourState.activeShotId` absent), la station charge déjà la dernière prise
(`latestShot`, #94). Le premier pas part donc d'ELLE : « ‹ » va à l'avant-dernière, « › » boucle sur la première.
C'est ce que le câblage app-side implémente ; les boutons doivent lire la même capture chargée, jamais un index
local.

### 4. Une suppression armée ne survit pas au changement de capture

Le contrôle de suppression de la station 3 reste armé aujourd'hui (demande jumelle,
`ds-report-rpv3-station3-suppression-armee.md`). Avec un pas-à-pas au clavier, un armement qui traverse une
capture devient un piège à deux touches. Le `key={loaded.id}` demandé là-bas ferme aussi ce cas-ci.

## Le raccourci clavier — ce qui est câblé, ce qui reste au DS

**Câblé côté app (livré avec cette vague)** : flèches ← / → en **station 3**, bouclage compris, dans
`RoomProfileContainer` (`useShotArrows`). Le raccourci est désarmé quand la frappe vient d'un champ de saisie
(`INPUT` / `SELECT` / `TEXTAREA` / `contentEditable`) — le renommage de capture et le sélecteur lui-même gardent
leurs propres flèches — et quand un modificateur est enfoncé. Test :
« station 3 : les flèches ← / → parcourent les captures du bucket et bouclent en fin de liste ».

**Ce que l'app ne PEUT pas câbler** : la capture chargée des stations 4 et 5 n'est pas une donnée de l'app. Elle
vit dans l'état local du DS (`WorkbenchUI.shotId`, `ZoneWorkbench.tsx:95`), que rien ne remonte au container. Le
pas-à-pas y est donc à la charge du DS, avec **une contrainte non négociable en station 4** :

> les flèches y déplacent la ROI (ou le pixel de référence) SÉLECTIONNÉE d'un pixel — `onNudge` sur `RoiBox` et
> `PointDot`. Le raccourci de capture doit rester DÉSARMÉ dès qu'une zone ou un pixel est sélectionné
> (`ui.zoneId !== null || ui.pointId !== null`), et ne s'armer que hors sélection. Les boutons ‹ ›, eux, restent
> actifs en permanence : ils ne se disputent aucune touche.

Si le DS préfère armer les flèches en station 4 même sous sélection, la seule forme acceptable est un
modificateur (`Alt` + flèches) — jamais un partage silencieux : un affinage au pixel qui saute de capture est une
perte de travail, pas une gêne.

## Critère de fermeture (terrain)

Depuis la station 3 comme depuis la station 4, ‹ et › changent de capture, les flèches font la même chose au
clavier, la liste boucle, et en station 4 une ROI sélectionnée continue de se déplacer au pixel. Verdict rendu par
Romain sur la prochaine campagne Windows.

---

# Tatami app → Claude Design — station 3 : le bandeau « L'engine voit : », permanent et vide

Campagne de validation Windows 0.6.10 (session 2026-08-29, branche `windows/validation-0.6.10`), station 3. Suivi
côté app par l'issue #98.

## Ce que le terrain a vécu

> « J'ai une alerte orange `L'engine voit :` qui ne sert à rien et qui est vide. Soit il ne doit y avoir aucune
> alerte parce que l'engine ne voit rien, soit tout simplement on retire cette alerte qui est inutile pour moi. »

Le bandeau occupe une bande pleine largeur, en couleur d'alerte, juste au-dessus du bouton « Capturer F9 » — et il
n'a jamais rien à dire, sur profil terrain comme sur profil vierge.

```tsx
<p className={`${styles.callout} ${styles.grow}`} data-tone={!cold && live?.good === true ? "act" : "warn"}>
    {cold ? t.tourCaptureCold : t.tourEngineSees(seen)}
</p>
```
`TourStation.tsx:510` — `seen = seenLabels(data.variants, live?.variantIds ?? [])` (ligne 380).

## Ce que l'app y sert — vérifié avant de demander

L'issue laissait deux sorties, à trancher sur la question « ce champ a-t-il un producteur ? ». Réponse : **oui,
et il est réel** — mais l'app le jette en route.

- Le contenu du bandeau, ce sont les cellules qu'une capture attesterait : `LiveFrame.variantIds`, projeté par
  `liveFrameOf` (`RoomProfileContainer.tsx:263`) depuis `PrelabelDto.wouldAttest`.
- `prelabel_preview` (`apps/desktop/src-tauri/src/ipc/commands.rs:1433`, `prelabel.rs`) est un producteur RÉEL
  sous Windows : sondes couleur du bucket + lectures des régions, filtrées par fraîcheur. La station le sonde
  toutes les 1,5 s pendant tout le tour.
- Mais `liveFrameOf` sort sur `if (!live) return undefined;`, et `CalibrationStateDto.live` vaut
  **`None` inconditionnellement** dans le back : `calibration_mode.rs:189`, `to_dto` — sur toutes les plateformes,
  Windows comprise. Les pré-labels n'atteignent donc JAMAIS le DS, et `seen` est la chaîne vide par construction.

Le bandeau n'est donc pas vide « parce que l'engine ne voit rien » : il est vide parce qu'une jonction app-side
laisse tomber ce que l'engine voit. C'est un défaut d'app, pas de DS — il est rapporté au coordinateur pour son
issue propre (il emporte un second effet, hors de cette demande : `onCaptureShot` reçoit `live?.variantIds ?? []`,
donc sous Windows la capture F9 ne poste aucun pré-label, seul l'objectif armé est attesté).

## Attendu, côté DS

**Option 1 de l'issue — le bandeau ne s'affiche que lorsqu'il porte quelque chose, et perd la couleur d'alerte.**

1. **Rien à dire ⇒ rien à l'écran.** `seen === ""` : pas de `<p>` du tout, pas de bande vide, pas de bande à
   hauteur réservée. Aujourd'hui, l'écran satisfait donc Romain sans rien perdre — le bandeau disparaît jusqu'au
   jour où l'app le nourrit.
2. **Couleur d'INFORMATION, jamais d'alerte.** Une lecture d'engine est un renseignement, pas un refus.
   `data-tone` doit sortir du couple `warn`/`act` de cette bande : une note neutre (la classe `note` de l'écran,
   ou un `callout` de tonalité informative) est le bon registre. L'orange est réservé aux refus et aux
   avertissements de cet écran (« Bucket seedé depuis 1048×540 », « Refusé … ») : un bandeau d'alerte permanent
   et vide use ce signal, et le joueur apprend à ne plus regarder la bande — il manquera le jour où elle porte un
   vrai message.
3. **Le cas FROID garde sa bande d'avertissement.** `cold` (`t.tourCaptureCold` : « Capture désarmée — aucune
   fenêtre de table détectée ») est un vrai refus, il reste en `warn` et reste permanent tant qu'il vaut. Ce sont
   deux messages différents qui partagent aujourd'hui un `<p>` et une tonalité : à séparer.

## Ce qui n'est PAS demandé

Supprimer le champ du contrat. `LiveFrame.variantIds` a un producteur backend réel et un consommateur utile en fin
de calibration — c'est la jonction app qui est à réparer, et elle le sera. Un champ retiré du contrat serait à
remettre au prochain drop.

## Critère de fermeture (terrain)

Station 3 sur un profil vierge : aucune bande orange sous le moniteur tant que l'engine n'a rien à dire ; table
fermée, la bande « Capture désarmée » reste et reste orange. Verdict rendu par Romain sur la prochaine campagne
Windows.

---

# Tatami app → Claude Design — station 4 : retirer la bande rouge « N pixels à poser »

Campagne de validation Windows 0.6.10 (session 2026-08-29, branche `windows/validation-0.6.10`), station 4. Suivi
côté app par l'issue #101. Demande DS pure : aucun câblage app-side n'est en jeu.

## Ce que le terrain a vécu

> « La barre "11 pixels à poser" rouge en dessous du screenshot ne sert plus à rien, il faut l'enlever. Les pixels
> à poser vont apparaître dans les ROI dans la barre de gauche, et la station suivante servira à les positionner. »

La bande, c'est `UnplacedRail` (`apps/web/src/ui/screens/CalibrationCanvas.tsx:300`, montée ligne 821) : titre
`t.unplacedTitle(n)` = « N pixels à poser », pleine largeur sous le canvas, en couleur de refus
(`.unplaced` : `--alert-line` / `--alert-bg`, `.unplacedTitle` : `--alert-text`).

## Pourquoi elle est devenue redondante — deux changements récents

1. **#63 (livré en 0.6.10)** a donné aux pixels de sondes leur propre catégorie dans le rail ROI de gauche —
   « PIXELS DE RÉFÉRENCE », une ligne par sonde, masquable. Ce que la bande énumère est désormais listé là, au
   même endroit que toutes les autres zones.
2. **La station 5 (pipette) est l'écran du prélèvement** : elle présente les cibles, compte les relevés, et porte
   déjà le geste de pose — chaque ligne sans position offre « Poser sur la capture » (`PipetteTool.tsx:545`,
   `onPlacePoint`), qui amène en station 4 avec le pixel ARMÉ. La station 4 place des géométries ; elle n'a pas à
   tenir le compte d'un travail qui se fait ailleurs.

La bande dit donc, en rouge et en permanence, ce que le rail dit déjà et ce que la station suivante fera — le même
coût de signal que le bandeau vide de #98 (`ds-report-rpv3-station3-bandeau-engine-voit.md`) : une couleur d'alerte
qu'on apprend à ne plus voir.

## Attendu

**Retirer `UnplacedRail`** de la station 4 (composant, styles `.unplaced*`, clé `unplacedTitle`) — le rail ROI et
la station 5 gardent le compte là où il sert.

Une seule précaution : la bande n'était pas qu'un compteur, elle était aussi **l'adresse d'armement** — cliquer un
trou arme le pixel, et le clic suivant sur la capture le pose (`onArm` → `onSelectPoint`). Le geste doit garder une
adresse dans la station, et la demande de Romain la nomme : **le rail de gauche**.

- La catégorie « PIXELS DE RÉFÉRENCE » (`ZoneRail.tsx`, `PixelCategory`) ne liste aujourd'hui que les pixels
  POSÉS — `placedPoints(bucket.points)` (`ZoneWorkbench.tsx:151`, filtre `p.at !== undefined`). Attendu : elle
  liste aussi les **non posés**, en ligne fantôme — pastille vide au lieu de la couleur échantillonnée, mention
  « à poser » à la place du code couleur, et pas d'œil (il n'y a rien à masquer). Les sélectionner ARME la pose,
  exactement comme le trou de la bande le faisait.
- Le reste du protocole de pose ne bouge pas : la consigne armée (`t.placeHint`, la ligne au-dessus du canvas) et
  la surface de pose (`placeSurface`) restent — ce sont elles qui disent au joueur ce que son prochain clic va
  faire.

Si le DS préfère que la station 4 ne montre **aucun** pixel non posé, c'est acceptable aussi : la station 5 reste
alors la seule adresse d'armement, et elle est complète. Ce qui ne l'est pas : retirer la bande en laissant
l'armement sans adresse.

## Critère de fermeture (terrain)

Station 4 : plus aucune bande rouge sous le canvas ; les pixels restant à poser se lisent dans le rail de gauche
et s'arment depuis là (ou depuis la station 5), et la pose au clic sur la capture fonctionne comme avant. Verdict
rendu par Romain sur la prochaine campagne Windows.

---

# Tatami app → Claude Design — iteration request (0.6.11) : station 3, « N tailles capturées »

Contexte : issue #100 (campagne Windows 0.6.10, station 3). Le terrain a pris 67 captures et les 67 sont tombées
dans le MÊME bucket (`1048x720`) ; le second bucket du layout (`698x720`) n'a jamais rien reçu — la capture refuse
une taille live différente du bucket (FR-044) et rien ne redimensionnait la fenêtre. Forme arbitrée par Romain :
**un appui F9 capture la situation courante dans TOUTES les tailles déclarées par le layout** (resize → capture →
resize → capture → retour à la taille d'origine). Une situation de poker ne se commande pas et ne se rejoue pas :
c'est le seul geste qui couvre le second bucket.

Le back-end le fait depuis cette MR. Ce qui manque est la seule chose que l'app ne peut pas écrire elle-même : la
station 3 ne DIT pas combien de tailles le dernier appui a couvertes. Le joueur appuie une fois, quatre captures
partent, et l'écran n'en montre qu'une (celle du bucket qu'il regarde).

## Ce que l'app fournit déjà

`CalibrationStateDto` (event `calibration-state`, `packages/contracts/src/bindings.ts`) porte un champ neuf :

```ts
lastCaptureBuckets: string[]   // ["1280x720", "1280x360"] — les buckets couverts par le DERNIER geste
```

- Il est remis à zéro à CHAQUE geste de capture — un clic du bouton « Capturer » y met exactement un bucket (le
  bouton reste mono-taille : il capture ce que la station montre), un appui F9 y met une entrée par taille
  réellement capturée, **la taille courante en premier**.
- Une taille que la fenêtre refuse de rendre (non redimensionnable, écran trop petit, ratio forcé) n'y figure pas :
  elle est journalisée en refus nommé côté engine. Le compte affiché est donc un compte de captures RÉELLES, jamais
  une promesse.
- `lastShotId` ne change pas de rôle (le signal de rafraîchissement de l'écran, rail #92) — il avance à chaque
  capture stockée, donc N fois par appui F9, et la matrice de couverture se rafraîchit taille par taille.

## Demande — station 3 (`TourStation.tsx`) : dire le compte du dernier geste

1. **Un compteur, à côté du bouton « Capturer F9 »** : « N tailles capturées » quand le dernier geste en a couvert
   plus d'une, rien (ou le silence actuel) quand il n'y en a qu'une — un compteur qui affiche « 1 tailles capturée »
   après chaque clic du bouton serait du bruit. La formulation exacte est à vous ; ce qui compte est que le joueur
   qui appuie UNE fois voie que son geste a couvert plusieurs tailles, alors que l'écran ne lui montre que le
   bucket courant.
2. **Contrat** : `TourState` (`RoomProfile.fixtures.ts`) gagne `capturedSizes?: string[] | undefined` — les
   buckets couverts par le dernier geste, dans l'ordre, tels quels (`"1280x720"`). L'app les câble depuis
   `calibrationState.lastCaptureBuckets` au drop suivant. Une liste vide ou absente = aucun geste depuis l'entrée
   dans le mode ⇒ pas de compteur.
3. **Fixtures** : une fixture station 3 avec deux buckets couverts (`["1152x770", "960x642"]`) pour que le gabarit
   se voie, et une à zéro/un bucket pour l'état nominal.

Hors périmètre de cette demande : la matrice de couverture (elle se rafraîchit déjà bucket par bucket, rail #92) et
le bouton « Capturer », qui reste mono-taille.

## Ce qui reste rouge tant que le drop n'est pas là

Le compte n'est PAS affiché aujourd'hui : `apps/web/src/ui/` appartient à Claude Design et l'app ne s'y écrit pas.
Le e2e station 3 du compte affiché attend donc ce drop — la couverture actuelle du multi-taille est
`premierLancement.test.tsx` (#100, les deux buckets peuplés par le vrai backend et servis à l'écran) et
`RoomProfile.test.tsx` (#100, le bucket voisin offre sa capture fraîche après un seul F9).


---
