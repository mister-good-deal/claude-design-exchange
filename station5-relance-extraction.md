# Tatami app → Claude Design — station 5 : le geste de relance d'extraction doit être debout

Demande autonome issue de la campagne terrain 0.6.6 (2026-08-25), suivie côté app par l'issue #10 (écart 56b).
Fichier d'échange propre : elle survit à l'itération courante.

## Ce que le terrain a vécu

Le drop précédent a livré le bloc d'échec d'extraction — `Shot.extraction`, la ROI fautive nommée, le message
verbatim du backend — et son bouton **« Relancer l'extraction »**. Le rapport de campagne dit :

> **Mais le geste annoncé « la passe se rejoue d'un geste » est INTROUVABLE** — aucun bouton de relance nulle part
> (vérifié par Romain). Conséquence : l'écran lit un **cache périmé**.

Le bouton existe pourtant dans `GlyphTool.tsx`. Il n'est simplement jamais rendu, et la raison est structurelle :

```tsx
{shot === null || failure === undefined || failure.state === "ok"
    ? null
    : <ExtractionFailure … />}   ← le bouton ne vit QUE là-dedans
```

**Une passe qui saute une ROI en silence ne pose aucun `Shot.extraction`.** C'est exactement le défaut que la
campagne a rencontré : `board_4` de `#20260816T093311136` n'a jamais été découpé, `#20260816T094521547` affichait
« aucun crop » sur ses six ROI — et dans les deux cas *sans le moindre échec*, donc sans bloc, donc sans bouton.
Le seul geste de réparation n'était offert que dans le cas où il n'était pas nécessaire.

## Ce qui est corrigé côté app (MR !77)

La cause de fond est app-side et elle est traitée : la passe de crops se dérivait sur la liste de ROI de la
capture **chargée**, pas de la capture **visée**. Elle se dérive maintenant par capture (`glyphZonesOn(shotId)`),
donc le pager et un label posé après coup ne laissent plus de ROI sans crop. `onRetryExtraction` est câblé et
rejoue la passe entière de la capture nommée.

Il reste ce que seul le DS peut rendre : **le bouton**.

## Attendu, côté DS

### 1. « Relancer l'extraction » monte dans l'en-tête de la station, sur TOUTE capture

Le geste doit être **debout**, pas une consolation du bloc d'échec — parce que le cas qui en a besoin est
précisément celui qui ne produit pas d'échec :

- une ROI dont le crop n'est jamais parti (aucune `Promise` rejetée : aucun rapport) ;
- un **cache périmé** — les vignettes sur disque datent d'avant un correctif backend, l'écran les rend sans rien
  savoir de leur âge ;
- une capture **labellisée après coup** : elle gagne des ROI que la passe précédente ne connaissait pas.

Place proposée : la ligne `xrow` du panneau « Que lit-on dans cette capture ? », après `t.glyphRoiCount` —
le pager ‹ › est à gauche, le compte de ROI à droite, la relance ferme la ligne.

`t.extractRetry` existe déjà (« Relancer l'extraction » / « Run the crop pass again ») : rien à ajouter à l'i18n.
Le callback existe déjà au contrat (`onRetryExtraction(sizeId, shotId)`, offre de RÉCUPÉRATION hors `Wiring`) :
rien à ajouter au contrat non plus. **La demande est un déplacement, pas un ajout.**

### 2. Le bloc d'échec garde ce que lui seul sait dire

`ExtractionFailure` reste utile pour ce que la relance ne dit pas : la ROI sur laquelle la passe a cassé et le
message verbatim du backend. Il n'a plus besoin de porter le bouton — l'en-tête l'offre déjà juste au-dessus.

### 3. Ce que nous n'avons PAS demandé

Ni relance automatique, ni indicateur de fraîcheur du cache, ni bouton par ROI. Un seul geste, sur la capture
chargée, toujours disponible. Si le DS juge qu'un état « passe en cours » manque (le clic n'a aucun retour
visible aujourd'hui), c'est à sa main — l'app n'expose pas encore de drapeau de vol et peut en ajouter un si le
contrat le demande.

## Contexte connexe

L'issue #40 (rendre TOUS les candidats extraits et laisser le joueur juger la lisibilité) porte sur le même écran
et part dans son propre fichier d'échange. Les deux sont indépendantes : celle-ci ne déplace qu'un bouton.
