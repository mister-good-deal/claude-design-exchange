# Tatami app → Claude Design — station 5 : basculer entre la barre d'actions et le zoom du bouton

Demande autonome issue de la campagne terrain 0.6.6 (2026-08-25), suivie côté app par l'issue #42. Elle vit dans
son propre fichier d'échange : elle survit à l'itération courante et n'a pas à être écrasée par le prochain
`report.md`.

## Ce que le terrain a trouvé

Écran de prélèvement d'un bouton (station 5, pipette v2). La zone de travail montre la **barre d'actions
entière** — « SE COUCHER / SUIVRE 1 BB / RELANCER » — et, sous les trois relevés, le zoom 3×3 du voisinage du
pixel relevé. **Aucun bouton en haut de la zone de travail ne permet de choisir ce qu'on regarde.**

Le joueur a deux besoins successifs et incompatibles sur la même surface :

1. **se repérer** — voir la barre complète pour identifier LE bouton que la ligne sélectionnée désigne ;
2. **viser** — voir ce bouton en grand pour poser le pixel au bon endroit.

Aujourd'hui la surface ne sert que le premier. Sur un bucket 1048×540, la barre fait ~38 % de largeur de fenêtre
pour ~9 % de hauteur : rendue dans le cadre de la station, un bouton y occupe quelques dizaines de pixels. Poser
un relevé « au bon endroit » s'y fait à l'aveugle.

## Attendu

- Des **boutons de bascule dans l'en-tête de la zone de travail** (au-dessus de la `ColorSurface`), entre :
  - **la vue de la zone d'actions** — la barre complète, celle d'aujourd'hui, pour se situer ;
  - **le zoom sur le bouton à prélever** — le cadrage serré du seul bouton que la cible sélectionnée désigne.
- **L'état courant est visible** (une bascule à deux positions dont la position active se lit, pas deux boutons
  muets).
- **La bascule ne perd rien** : ni le relevé en cours, ni la position affinée aux flèches. C'est un état d'UI
  local à l'écran (`useState`) — aucun callback app, aucune donnée à réécrire. Les marqueurs déjà posés se
  re-projettent simplement dans le nouveau cadrage.

## Ce que l'app peut fournir — et l'ajout de contrat que ça demande

La géométrie du bucket porte **déjà** le rect propre de chaque bouton, à côté de celui de la barre :

```
"actions":       { left: 32, top: 85.5, w: 38, h: 9 }    ← la barre : ce que la surface recadre aujourd'hui
"actions.fold":  { left: 33, top: 86.5, w: 11, h: 7 }    ← le bouton
"actions.call":  { left: 45, top: 86.5, w: 11, h: 7 }
"actions.raise": { left: 57, top: 86.5, w: 11, h: 7 }
```

(et leurs déclinaisons scopées par variante, `actions.<variant>.<action>`, depuis la migration E5).

Aujourd'hui `Probe.zoneId` vaut toujours `"actions"` : **une cible ne porte qu'un seul cadre**, donc la surface ne
peut pas connaître le second. Il nous faut donc **un champ de plus au contrat**, que l'app remplit :

```ts
export interface Probe {
    /** La ROI qui CADRE la cible sur la capture — la barre d'actions. Inchangé. */
    zoneId?: string | undefined;

    /**
     * La ROI du seul bouton que cette cible désigne (`actions.<variant>.<action>`), quand le bucket la porte.
     * La vue « zoom » de la zone de travail recadre dessus ; absente, la bascule n'a pas de seconde vue.
     */
    zoomZoneId?: string | undefined;
}
```

Même remarque pour `SuitSwatch` si vous voulez la bascule sur les enseignes : la ROI de la carte y joue déjà le
rôle du « bouton », le cadre large serait la zone `hero_cards` / `board`. À votre main — le terrain n'a demandé
que les boutons.

Nous ne posons pas le nom du champ comme une exigence : si vous préférez `zoneIds: { frame, zoom }` ou tout autre
forme, dites-le et l'app s'y range. Ce qui compte est qu'**une cible puisse porter deux cadres**.

## États dégradés — à dessiner aussi (§8.4 du contrat)

- **Le bucket n'a pas calibré le sous-ROI du bouton** (`zoomZoneId` absent) : la bascule doit le DIRE, pas offrir
  une vue vide ni retomber en silence sur la barre. Un profil terrain non migré est exactement dans ce cas.
- **Aucune capture n'atteste la cible** : la zone de travail rend déjà son état « pas de capture » — la bascule
  n'a alors rien à commander et ne doit pas s'afficher active.

## Critère de fermeture (terrain)

Les deux vues sont atteignables par un geste explicite depuis l'en-tête de la zone de travail, l'état courant se
lit, et passer de l'une à l'autre ne perd ni le relevé en cours ni la position affinée. Verdict rendu par Romain
sur la prochaine campagne Windows.
