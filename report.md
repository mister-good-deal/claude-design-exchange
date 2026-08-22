# Drop 2026-08-22 — rapport de revue (app Tatami, AVANT import)

**Verdict : revu sur copie scratch, PAS encore importé.** La refonte pipette v2 est la bonne réponse aux écarts
51/52/54/62/63/66 — l'unité action × barre + palette d'enseignes colle au modèle du backend (`SuitPalette` et
`set_suits()` existent déjà côté moteur), et l'écriture automatique par unité est même plus propre que l'atomicité
demandée : il n'y a plus de geste d'adoption à oublier. La couche 2026-08-21 (extraction nommée, board sur une
ligne, colonne sticky, dérivation unique `attestationsOf`, dry-run « périmé », chemin clavier retiré) est conforme
au rapport terrain. Trois retours bloquent le drop-in ; on importe dès le re-drop.

## 1 — Le geste de pose n'existe pas dans le drop (bloquant)

`onPlaceColorSample(sizeId, targetId, index, at)` est déclaré **essentiel** dans `RoomProfileWiring`, mais aucun
écran ne le déclenche : `PipetteTool` n'affiche aucune surface de capture cliquable (le centre montre le nom de la
capture, les trois slots et la loupe — pas l'image), `CalibrationCanvas` ignore tout des relevés, et une cible
`unplaced` n'offre aucun bouton de pose (seuls les actionneurs ont « Poser sur le canvas »). Le `placeHint` dit
« le clic pose le relevé en cours » — le clic n'a nulle part où se faire. C'est l'exact inverse de notre garde-fou
maison (un callback essentiel que rien ne peut déclencher est aussi mort qu'un contrôle sans handler).

Deux façons de fermer, à votre main :

- **La surface de pose vit en station 5** (le prototype `pipette-v2` la montrait) : la capture attestante s'affiche
  dans le panneau de lecture et le clic y pose le relevé en cours — c'est elle qui déclenche `onPlaceColorSample`
  avec l'index du prochain slot libre (`nextSlot`).
- OU l'aller-retour station 4 reste le chemin (comme aujourd'hui) : alors `onPlaceColorSample` sort du Wiring —
  l'app traduit elle-même la pose canvas en relevé — et le `placeHint` raconte l'aller-retour.

Notre préférence va à la première : l'écart 50 nous a appris que l'aller-retour est un geste qui se perd.

## 2 — Les lignes enseignes ne chargent pas leur capture

`selectTarget` ne fait `onSelectShot` que si `variantId` est défini — une enseigne n'en a pas, donc cliquer
« ♠ — A♠ on the flop » ne charge rien : la même impasse que l'écart 53 venait de fermer pour les sondes. Il faut
que la ligne d'une enseigne charge une capture qui montre la carte visée (`SuitSwatch.target` sait laquelle) ; à
défaut, qu'elle le dise comme une ligne de barre non attestée le dit.

## 3 — La note « trois relevés » doit suivre `needed`, pas la constante

Le contrat dit `Probe.needed` = « the app's word » (`?? SAMPLES_PER_TARGET`), mais la note `threeReads` et le
compteur racontent « trois relevés » en dur. L'app compte s'en servir : la variance qui fonde la tolérance d'un
BOUTON est INTER-captures (le backend échantillonne déjà un point posé sur toutes les captures attestantes — c'est
elle que la tolérance runtime doit couvrir), tandis que trois poses sur la même face plate mesurent peu ; pour une
ENSEIGNE en revanche, trois relevés sur des pips différents ont un vrai signal. Le nombre final par famille de
cible est en cours d'arbitrage chez Romain — ce qui est sûr : la copy doit se conjuguer avec `needed` (« N relevés »)
pour que l'écran reste vrai quel que soit l'arbitrage.

## Acquis côté app, pour information

- Section E (chemin clavier retiré, `pointerdown` seul, affinage aux flèches conservé) : acquiescé — notre
  détecteur de geste transitoire (`useKeyboardPoseRef`) sera supprimé au câblage de ce drop, le retour en
  station 5 redevient inconditionnel.
- `pipette_adopt` (buffer par famille) meurt côté backend au profit de l'écriture par unité ; la palette
  d'enseignes s'écrira par `set_suits()`, qui existe déjà.
- Le glyphe `BB` entre au catalogue des codes : le set de templates backend le connaîtra.
