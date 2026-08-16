# Tatami app → Claude Design — gate du drop 2026-08-16.4 : TOUT VERT

`pnpm import-ds` sort **« DS import GREEN — drop-in clean »** pour la première fois de la série. Les quatre points
du rapport précédent sont traités à la source, sans une seule retouche à la main côté app.

| Gate | Verdict |
|---|---|
| react-doctor | ✅ **No issues found!** |
| tsc | ✅ |
| ESLint | ✅ |
| ds-sync | ✅ 82 fichiers |
| vitest | ✅ 412 / 412 |
| Playwright e2e | ✅ 64 / 64 |
| pixel-parity | ✅ 25 / 25 |
| workspace Rust | ✅ |

**La branche 0.6.4 redevient mergeable.** C'était la dernière marche.

## Ce qui mérite d'être dit

**La correction de la course est meilleure que ce que je proposais.** J'avais suggéré « un état local optimiste » ;
vous avez livré un overlay qui porte `base` — la valeur de props dont il a été calculé — et qui se périme **par
comparaison au rendu** dès que `Shot.variantIds` bouge. Résultat : pas d'effet de synchro de props, pas de seconde
source de vérité, et le cas de rejet applicatif est couvert gratuitement (la valeur revient en arrière, l'overlay
tombe). C'est la bonne forme, et elle passe react-doctor sans rien contourner.

J'ai durci le test app en **non-régression** : les trois décochages sont désormais enchaînés *sans* attendre le
refetch, et j'assert la monotonie des REPLACE successifs (`[b4, dealt]` → `[dealt]` → `[]`). C'est exactement le
scénario qui produisait la résurrection avant votre correctif.

**Le fix doctor est le bon diagnostic**, pas un contournement : le handler ne capturait effectivement rien.

## C3 — reçu, et le chemin est enfin ouvert

`PointKind` « actuator », `CalibPoint.hint`, `CalibPoint.test { at, ok }` et `onTestPoint` : les trois conditions
que j'avais posées pour sortir `bet_blur` des ROI **sans perdre le clic à blanc D12 ni les tooltips (écart 18)**,
tous deux validés terrain, sont réunies. Le distinguo « jamais testé » vs résultat daté est exactement ce qu'il
faut : le DS ne fabrique aucun verdict, l'app écrit le sien.

Côté app le câblage restant n'est pas cosmétique — il touche le modèle Rust (`bet_blur` doit passer des ROI aux
points, avec migration à l'écriture et tolérance en LECTURE pour ne pas mettre les profils terrain en quarantaine)
et la commande `test_click`. C'est planifié comme un lot à part, à l'arbitrage de Romain ; **rien n'est attendu de
vous là-dessus**.

## Rien d'ouvert de mon côté

Aucune demande en attente. Le prochain rapport partira de la prochaine campagne Windows ou d'une nouvelle demande
de Romain.
