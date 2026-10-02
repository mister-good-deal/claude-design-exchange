# Demande Claude Design — 0.8.2 : interrupteurs Hotkeys & bets et Halo des tables, pas de molette, note siqnote

Issue d'origine : [#561](https://gitlab.laneuville.me/rom1/tatami/-/issues/561) (G1 note 14054), lot A
[#559](https://gitlab.laneuville.me/rom1/tatami/-/issues/559) pour les points 3 à 5. Écrivain exchange : lt-atelier.
Ce fichier appartient à la MR du lot ; il ne livre aucune édition de `ui/`. Décisions de Romain du 2026-10-02 :
« un bouton ON/OFF global […] comme il existe pour le Layout designer, l'ajouter aussi dans Hotkeys & bets (désactive
tous les raccourcis de Tatami) » ; « pareil pour Window Glow, un bouton ON/OFF ».

L'export est cumulatif avec le drop `2026-10-02` (Overlay v2) et les demandes précédentes.

## 1. Hotkeys & bets : FeatureSwitch en tête de l'écran

Même primitive et même place que `LayoutDesigner` (`tilingEnabled`) et `Overlay` (`overlayEnabled`).

- `HotkeysData.hotkeysEnabled: boolean` (servi) ; `on.onSetHotkeysEnabled?: (next: boolean) => void`. L'écran ne garde
  aucun état : il rend la valeur servie.
- Coupé, l'écran reste entièrement modifiable (raccourcis, presets, sizing) : on coupe la feature, on n'efface rien.
- Mots fr/en dans `STRINGS[locale]` : libellé (« Raccourcis de Tatami »), aide (« Quand il est coupé, Tatami
  n'intercepte aucune touche : toutes vont à la room ; les raccourcis restent modifiables. »), « Actif » / « Coupé ».
- Fixture : un cas coupé.

## 2. Halo des tables : FeatureSwitch en tête de l'écran

L'écran `GlowConfig` vit côté app (`apps/web/src/app/components/`) ; l'app y a déjà posé le FeatureSwitch
(`GlowConfigData.enabled`, `on.onSetEnabled`) avec des mots locaux provisoires. Demandé :

- le même interrupteur dans le prototype du Halo des tables, au-dessus du panneau, libellé = le titre de l'écran ;
- ses mots dans `STRINGS[locale].glow` : aide (« Quand il est coupé, Tatami ne dessine aucun halo sur les tables ; les
  réglages restent modifiables. »), « Actif » / « Coupé » — l'app retirera alors ses mots locaux ;
- coupé, le bouton « Aperçu » est désactivé (l'app refuse déjà l'aperçu d'un halo coupé).

## 3. Le pas de molette se règle dans Hotkeys & bets (lot A)

La molette DANS la bet bar (et sur le ladder 019) ajoute ou retire déjà `nudgeStepBb` au montant armé ; le joueur ne
peut pas régler ce pas. Il vit dans le sizing de la room (`[sizing].nudge_step_bb`, en BB), à côté des presets.

- `SizingConfig.nudgeStepBb: number` (servi, en BB) ; l'écran `Hotkeys`, panneau du sizing, rend une ligne « Pas de la
  molette » sous `InstantRow`, comme elle : une saisie décimale LIBRE en BB (virgule ou point acceptés, aucun `step`
  HTML : un `step=0.1` ferait refuser 0,25 par le navigateur, et 0,25 doit rester 0,25), et
  `on.onSetNudgeStep?: (bb: number) => void` au commit (Entrée ou perte de focus), sans état gardé par l'écran.
- Refus rendu par la même mécanique que `sizing-instant` : clé `sizing-nudge` dans `rejectFor`, message verbatim.
  L'app décide de la validité (fini, ≥ 0,1) et refuse en le disant ; le DS ne borne rien d'autre.
- Mots fr/en dans `STRINGS[locale]` : libellé, aide (« ajouté ou retiré à chaque cran de molette sur la bet bar »).

## 4. SiqCluster : Entrée enregistre, Maj+Entrée va à la ligne (lot A)

Remplace Ctrl/Cmd+Entrée (enregistrer) et Entrée (à la ligne) : **Entrée** enregistre, **Maj+Entrée** insère un retour
à la ligne, Échap annule. Entrée pendant une composition IME (`isComposing`) ne valide pas. Mettre à jour l'aide de
l'éditeur et les fixtures.

## 5. SiqCluster : le brouillon rendu sur une fin imposée (lot A)

Aujourd'hui, une fin d'édition imposée par l'app (`data.editing` passe à `false`, ou un autre joueur est servi sur le
cluster) jette le brouillon. Romain : « Pour les fins non voulues, on sauvegarde l'état courant de la note et on ferme
tout. »

- Nouveau `on.onNoteDraft?: (playerId: string, text: string) => void`, appelé UNE fois, avant de fermer, quand une
  édition ouverte se termine sans enregistrement ni annulation du joueur : `playerId` = le `SiqPlayer.id` sur lequel
  l'édition a été OUVERTE (jamais le joueur servi après), `text` = le contenu courant de l'éditeur, tel quel.
- Pas de `onNoteEditEnd` dans ce cas (inchangé : cette fin est celle de l'app) ; l'éditeur se ferme, rien ne reprend le
  focus. Le DS ne compare rien : brouillon vide ou inchangé, c'est l'app qui décide de ne pas écrire.
- Un cas de fixture : édition ouverte, `editing` servi à `false` ⇒ `onNoteDraft` reçu avec l'id d'ouverture.

## Contrat du drop

Périmètre limité à ces cinq points, leurs types, chaînes et fixtures. Changements visuels déclarés dans
`parity.declaredChanges`. Export cumulatif conforme à `contract.md`, lint/typecheck verts, react-doctor à zéro
diagnostic. Câblage côté app au « DS ready » de Romain : points 1 à 3 par lt-atelier, 4 et 5 par lt-overlay.
