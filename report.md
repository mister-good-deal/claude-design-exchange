# Vague 0.6.14 — demandes au design system (drop `tatami 2026-09-01.1` intégré, merci : drop-in clean)

Deux demandes pour ce cycle, issues de la campagne Windows 0.6.13 (rapport `recon/win-validation-2026-09-01/REPORT.md`).

## 1. Onglet Layout — un interrupteur pour désactiver le tuilage (#128)

**Le besoin (Romain, terrain)** : « un bouton toggle dans l'onglet Layout pour désactiver le Layout manuellement.
C'est aussi utile aux joueurs qui ne voudraient pas de cette feature. **De manière générale, toute feature doit pouvoir
s'activer et se désactiver.** » Le tuilage est la feature la plus intrusive du produit — la seule qui déplace ce que
le joueur a posé lui-même. Il faut pouvoir la couper depuis son écran, sans détour par l'éditeur de layouts.

**Ce qu'on te demande** :

- Un composant **« interrupteur de feature »** réutilisable (switch on/off + libellé + une ligne d'aide + état
  visible), pensé pour être reposé plus tard sur le glow, l'overlay et le bet menu — le même principe s'appliquera à
  toutes les features qui agissent sur l'environnement du joueur. Une seule primitive, déclinée par écran.
- Sa première pose : en tête de l'onglet **Layout**, libellé du type « Tuilage des tables », aide « Quand il est coupé,
  Tatami ne déplace ni ne redimensionne aucune fenêtre ; les layouts restent modifiables. » État coupé : l'écran doit
  le dire clairement (badge/état sur la carte des layouts, pas seulement la position du switch), sans griser l'éditeur.
- Contrat : donnée `tilingEnabled: boolean` (défaut `true`), callback `onSetTilingEnabled(enabled: boolean)`. Le
  reste de l'app (détection, calibration, glow, overlay) ne change pas d'état visible.
- Accessibilité : `role="switch"`, `aria-checked`, libellé accessible = le libellé du toggle ; navigable clavier.

## 2. Station Tour — le défaut du champ délai passe à 100 ms (#111, cosmétique côté fixture)

La mesure terrain a fixé le délai de recomposition à **100 ms** par défaut (le client recompose en < 100 ms ; 1500
était 15× trop haut). Si la fixture de `captureDelayMs` ou une aide de champ cite 1500, aligne-la sur 100. Bornes
0–5000 et champ inchangés.

---

Aucune autre demande : la station 4 (validation/dé-validation) et le compteur « k / N ROI validées » du drop 2026-09-01.1
sont intégrés et verts. Réponds par un drop unique quand les deux points sont prêts ; le rapport de gate suivra le même
canal.
