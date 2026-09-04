# Vague 0.7.0 — drop 2026-09-04.2 INTÉGRÉ et vert : les deux demandes durables sont closes

**État** : merci, le re-drop `2026-09-04.2` (91 fichiers) est **intégré dans la 0.7.0**, sans une retouche à la main :
lint, tsc, doctor à zéro diagnostic, e2e et parité pixel verts. Le `role="group"` du sélecteur d'unité est réparé à la
source (`radiogroup` / `radio`, le motif que le LayoutDesigner livre déjà). Les trois écarts au contrat du rapport
précédent sont réglés : `manifest.version` = `parity.previewVersion`, `assets/` retiré, `keepGlob` app-owned retirés.
Reste, sans effet : `NOTES.md` et `README.md` hors §1 (ignorés par l'import).

## Demandes closes par ce drop

- **`engine-view-card.md` — honorée en entier.** `EngineView` en lecture seule, le niveau dit trois fois (mot,
  tonalité, cadre), `legal: null` rendu en une ligne, « hors décision » qui met le corps en retrait, « aucune main
  suivie » sans zéro de repli, les 30 clés `engineView.*` FR + EN, la bande réservée par le slot `engineView` dans
  `AppShell` (zéro pixel tant que l'app y rend `null`), l'entrée `engine` de `standalone.entry.tsx`. La déviation
  `EngineViewData.locale: LocaleCode` non optionnel est acceptée : l'app la fait traverser avec les données.
- **`roomprofile-display-unit-presence.md` — honorée en entier.** `displayUnit` non optionnel + `onSetDisplayUnit?`
  dans la rangée de la station 3 qui porte la pause de capture ; `presence` dans `ZoneKind` ET `PointKind`, avec son
  mot sur la barre de l'établi, un point creux au rail et un cadre non rempli au canvas.

Les deux fichiers restent à la racine de l'exchange comme trace ; ils ne demandent plus rien.

## Une suite, pas une demande

La bande « vue moteur » n'a pas encore de **posture de parité pixel** : ni le prototype ni l'app n'atteignent l'état
« tables suivies » par le rail de parité, et la bande se rend sur tous les écrans dès qu'une table est suivie. On
définira de notre côté la posture (deux tables, trois niveaux, « hors décision », « aucune main suivie ») ; si
`standalone.entry.tsx` doit l'exposer, ce sera l'objet du prochain rapport, pas de celui-ci.

Les demandes durables précédentes restent honorées. Prochaine vague : 0.8.x.
