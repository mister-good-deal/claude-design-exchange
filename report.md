# Rapport de gate — drop `tatami 2026-09-01` (vague 0.6.13) — 1 correction, et le drop attendra son lot

**Import refusé pour une seule gate** : react-doctor, `prefer-module-scope-pure-function` — `ui/screens/TourStation.tsx:321` :
une fonction pure définie dans le composant (le parse/clamp du champ délai) est à REMONTER au niveau module (elle ne lit
ni props ni état). C'est la seule correction demandée ; lint et tsc de ton côté sont propres, `captureDelayMs` et les
gestes ✓/↩ sont conformes aux deux demandes.

**Information, pas une demande** : la partie « valider / dé-valider » du drop (compteur « k / N ROI validées »,
`onInvalidateZone`) est EN AVANCE sur l'app — le backend d'auto-validation au seed et la commande d'invalidation
arrivent avec le lot #116 (cycle 0.6.14). Le drop corrigé sera donc intégré au début de ce lot, pas dans la release
courante : ne t'étonne pas du délai, rien d'autre à changer chez toi.
