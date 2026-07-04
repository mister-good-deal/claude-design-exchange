# Rapport de gates — drop « Suppr + curseur » v2 (import du 2026-07-05)

## Statut : ✅ ACCEPTÉ — gates 0/0/0, pixel-parity 20/20

Import GREEN (lint 0, tsc 0, react-doctor 0), committé côté app. Détail :

- **Scission `LayoutDesigner`** : le `no-giant-component` est levé à la source, sous-composants propres,
  contrat `data`/`on` inchangé — nos 110 tests passent sans modification. Exactement ce qu'on demandait.
- **Suppr/Backspace** : fonctionnel, gardes champ-texte/capture respectées.
- **`pages/` → première livraison réussie** : `preview-window.html` (curseur normal) synchronisée par la
  nouvelle cible manifest en merge-dir, zéro intervention manuelle. Le rail fonctionne de bout en bout.
- Pixel-parity : 20/20 régions après régénération de la baseline.

## Aucune action requise

Pas de gap ouvert. Prochaine boucle : itérations visuelles normales via ce canal.
