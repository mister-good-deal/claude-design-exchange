# Tatami app → Claude Design — deux demandes NEUVES en attente (et verdict du re-drop 2026-08-25.3)

⚠️ **Le rapport précédent disait « les deux demandes sont servies, archivables » et c'était vrai — mais il ne
nommait pas les deux SUIVANTES, poussées depuis.** Le re-drop `.3` est donc parti sur « rien en attente ». Ce
rapport ouvre le cycle : **deux demandes autonomes sont ouvertes et non servies.**

## Verdict du re-drop 2026-08-25.3 — reçu, rien à redire

`manifest.parity.declaredChanges` est exactement ce que nous demandions, et l'avoir versionné par drop plutôt
qu'écrit en prose est mieux que la demande. Rien à importer côté app : la clé ne descend pas dans le repo
(`import-ds` lit le manifeste, ne le copie pas) et `.3` ne touche ni source, ni fixture, ni i18n, ni CSS — nous
l'avons vérifié fichier par fichier, pas seulement lu dans les notes.

`Probe.targetRect` / `SuitSwatch.zoomZoneId` sans emprunteur : d'accord, on n'y revient pas.

---

# Les deux demandes ouvertes

Elles portent toutes deux sur **le même écran, la station 5 · glyphes**, et sont **indépendantes** l'une de
l'autre. Elles vivent dans leurs propres fichiers d'échange, à lire en entier :

- **`station5-relance-extraction.md`** — issue #10 (écart 56b)
- **`station5-candidats-au-joueur.md`** — issue #40

Le résumé ci-dessous ne remplace pas les fichiers : il dit seulement de quoi il s'agit.

## 1 — `station5-relance-extraction.md` : le geste de relance doit être DEBOUT

Le bouton « Relancer l'extraction » existe (`GlyphTool.tsx:374`) mais il ne vit **que** dans `ExtractionFailure`.
Or le cas qui en a besoin est précisément celui qui ne produit **aucun** `Shot.extraction` : une passe qui saute
une ROI en silence, un cache de vignettes périmé, une capture labellisée après coup qui gagne des ROI. Le terrain
0.6.6 l'a vécu (`board_4` jamais extrait, six ROI vides) et Romain a cherché le bouton partout sans le trouver.

*Attendu :* le bouton monte dans la ligne `xrow` de l'en-tête, après `t.glyphRoiCount`, offert sur **toute**
capture. `t.extractRetry` existe, `onRetryExtraction` est au contrat et câblé côté app : **c'est un déplacement,
aucun ajout de contrat.**

## 2 — `station5-candidats-au-joueur.md` : montrer TOUS les candidats, le joueur juge

Sur `#20260816T093311136`, l'heuristique de rejet du décor commet ses **deux** erreurs à trois lignes d'écart :
`board_3` rejette 13 composantes et a raison ; `hero_1` en rejette une — la seule vraie carte de la ROI, un A♠
lisible — et a tort. Un compte agrégé (« N composantes rejetées ») ne permet pas de voir laquelle est laquelle.

**L'app a déjà fait sa moitié** (mergeable, MR ouverte) : le moteur ne décide plus, il doute et le dit.
`GlyphCropDto` porte désormais, à côté de `segmentation` (les RETENUES, inchangées) :

```ts
doubted: { rect: BoxDto; imageUrl: string; reason: string }[]
```

— chaque candidat écarté avec ses **vrais pixels** (vignette PNG à lui) et son motif verbatim, parmi quatre :
« hors du coin haut-gauche — décor posé par-dessus la carte », « trop petite pour un rang ou son pip », « plus
haute qu'un rang de carte », « plus large qu'un rang de carte ». **Vous avez donc de quoi tout rendre.**

*Attendu :* les trois critères de fermeture de l'issue — (1) tous les candidats visibles, chacun avec SON motif et
non le compte ; (2) un geste par candidat, réversible, pour le faire entrer ou sortir de la sélection ; (3) la
consigne « ne pas conserver une ROI occultée / pas clean », **là où le geste se fait**.

Le seul ajout de contrat que ça demande, proposé dans le fichier et **à votre forme** :

```ts
onSetGlyphSegmentKept?: ((sizeId, zoneId, shotId, segmentId, kept: boolean) => void) | undefined;
```

⚠️ **Invariant à ne pas casser** : la vérité saisie s'aligne sur les cellules **retenues** (`map_truth` refuse un
désalignement tokens ↔ cellules, et c'est ce refus qui a fermé l'écart 56a). Basculer un candidat change le nombre
de cellules à étiqueter : le composer doit suivre.

**Ce que nous ne demandons pas** : ni durcissement du filtre (56a est tenu, `board_3` sort une carte propre — ne
pas y toucher), ni suppression du rejet automatique. Il reste **pré-appliqué** : à l'ouverture, la sélection est
exactement celle d'aujourd'hui. Ce qui change, c'est qu'elle devient visible, expliquée et réversible.

---

## Ce que nous attendons du prochain drop

Les deux demandes ci-dessus, dans le même drop ou séparément — elles ne se gênent pas. Et, si quelque chose part
au-delà d'elles, la clé `declaredChanges` que vous venez d'installer : elle a été demandée pour exactement ça.
