# Tatami app → Claude Design — station 5 : ce que la ligne « Cible de clic » doit dire

Demande autonome issue de la campagne terrain 0.6.6 (2026-08-25), suivie côté app par l'issue #43. Fichier
d'échange propre : elle survit à l'itération courante.

## Ce que le terrain a vécu

Station 5, panneau de droite, section **CIBLES DE CLIC**. Le « Pixel neutre » (`bet_blur`) offre son bouton
**« Test — clic à blanc sur la fenêtre live »**. Le bouton est actif, le joueur clique quatre fois, et le journal
dit quatre fois :

```
WARN calibration_refus kind=Calibration
  reason=clic à blanc refusé hors du tour des tailles (état « repos »)   ×4
```

Aucun `test_click_posted` : **rien n'a jamais été envoyé à la table**. Romain, lui, a conclu l'inverse — « ça a
bien cliqué mais pas de perte de focus de l'input bet » — et a cherché la cause du côté de la projection, pour un
clic qui n'avait jamais eu lieu.

**Le côté app est corrigé** : le bouton ouvre désormais la session de tour lui-même quand une table est adoptable
(même porte que le deep-link « capturer »), puis poste ; porte fermée, la session est refermée et le motif backend
part dans la bannière de refus du wizard, verbatim. Reste ce que seul le DS peut rendre.

## Ce qui manque à la ligne, côté DS

### 1. La ligne ne rend JAMAIS le verdict du clic — même réussi

`ActuatorRow` (`PipetteTool.tsx`) écrit toujours la même note :

```tsx
{absent ? t9.zoneAbsent : placed ? t9.testNever : t9.unplacedProbe}
```

`t9.testNever` = « jamais testé à blanc ». Donc **après un clic réussi la ligne dit encore « jamais testé à
blanc »**. C'est la moitié du malentendu terrain : l'écran ne distingue pas « rien ne s'est passé » de « ça a
marché ».

Or le contrat porte déjà la donnée, l'app la remplit, et le commentaire de `CalibPoint.test` l'annonce :

```ts
/**
 * C3 / D12 — outcome of the last dry click on an `actuator` point. The APP runs the
 * click and reports; the DS never fabricates one. Undefined = never tested.
 */
test?: { at: string; ok: boolean } | undefined;
```

*Attendu :* trois états distincts sur la ligne — **jamais testé** (`test` absent), **posé à `<at>`**
(`test.ok === true`), **non posé à `<at>`** (`test.ok === false` : hors Windows le POST est un no-op journalisé,
c'est un vrai cas, pas une erreur). Les libellés « posé à 15:07 » existaient dans l'intention (commentaire app,
écart 38) mais rien ne les rend.

### 2. `CalibPoint.hint` n'est rendu nulle part

Le contrat le décrit comme « app-supplied; the rail shows it on the entry » — l'app le remplit (« le champ de
montant : le clic à blanc y tape la taille »), `ActuatorRow` ne l'affiche pas. Un « Pixel neutre » sans son
pourquoi n'apprend rien.

### 3. Un refus doit rester lisible LÀ OÙ le geste se fait

La bannière de refus du wizard est en haut du voile ; le geste, lui, se fait tout en bas du panneau de droite.
Le terrain n'a pas fait le lien — et toute cascade de refetch (une géométrie committée en parallèle) remet
`data.rejection` à zéro, donc la bannière peut disparaître avant d'être lue.

*Attendu :* le verdict du dernier clic vit **sur la ligne** (point 1) et n'a pas d'autre source que `test` — il
survit donc aux refetch. La bannière garde son rôle pour le motif long.

### 4. Nous n'avons PAS demandé de bouton désarmé

L'issue offrait le choix « ouvrir la session soi-même » ou « désarmer le bouton avec son motif ». Romain a tranché
pour le premier : **le bouton reste actif**, il ouvre la porte lui-même. Rien à désarmer côté DS — c'est dit ici
pour que la prochaine itération ne l'ajoute pas par excès de zèle.

## Critère de fermeture (terrain)

Depuis la station 5 avec une table ouverte, le clic à blanc aboutit à un `test_click_posted` **et la ligne le
DIT** ; sinon il refuse visiblement, avec son motif. Verdict rendu par Romain sur la prochaine campagne Windows.
