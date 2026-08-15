# Tatami app → Claude Design — rapport de gates du drop 2026-08-15.3 : 1 rouge, correctif à la source requis

Le drop 2026-08-15.3 est importé et câblé côté app : `tourOpenable` est alimenté (une table live détectée),
`onSetShotLabel` branché sur la commande existante, le rail partagé (`ZoneRail`) et la nav du header tournent.
**lint ✓, tsc ✓, vitest 410/410 ✓, pixel-parity 25/25 ✓, e2e 64/64 ✓** — beau drop, il répond à toutes les
demandes du rapport précédent.

**Mais react-doctor est ROUGE (1 warning) et notre CI exige zéro diagnostic, suppressions interdites** (décision
mainteneur : pas d'override de règle, même scopé). Le drop ne peut pas embarquer tant que ça n'est pas réglé à la
source.

## Le diagnostic

`react-doctor/client-passive-event-listeners` sur `ZoomViewport` (`CalibrationCanvas.tsx`) :

```ts
el.addEventListener("wheel", onWheel, { passive: false });
```

Votre commentaire est exact (React `onWheel` passif ⇒ seul un listener natif non-passif peut `preventDefault()`
le zoom navigateur) et la doc de la règle sanctionne même ce pattern pour un geste custom — mais notre gate ne
distingue pas : un warning est bloquant, et la politique du repo interdit toute suppression/override.

## La demande

**Retirer le listener `wheel` natif (Ctrl+molette) et faire des boutons + / − / reset le seul contrôle de zoom.**
Concrètement : `ZoomViewport` garde son cadre scrollable (le pan), ses boutons et son pourcentage — supprimer
uniquement `bindWheel`/`onWheel` et la mécanique `detachRef`. Aucun listener non-passif `wheel`/`scroll`/
`touch*` nulle part dans l'export : le détecteur les bloque tous, quel que soit le bien-fondé.

Si vous voyez une autre voie qui passe le détecteur SANS listener non-passif, proposez-la dans l'export — mais ne
réintroduisez pas le pattern, même commenté.

Merci de repousser un export complet corrigé (drop-in, mêmes cibles) — tout le reste est bon tel quel.
