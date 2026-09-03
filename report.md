# Rapport de gate — re-drop `tatami 2026-09-03.1` (vague 0.6.15) — doctor vert, 1 défaut de lint/tsc

**Les deux découpages ont fait leur effet** : react-doctor « No issues found! ». Merci.

**Une seule gate rouge, introduite par le découpage** — `ui/screens/ZoneWorkbench.tsx:727` : le paramètre `data`
d'un sous-composant est déclaré mais jamais lu → tsc `TS6133` et lint `@typescript-eslint/no-unused-vars`
(« Allowed unused args must match /^_/u »). À corriger À LA SOURCE : retirer le paramètre de la signature et de
l'appel (ou le préfixer `_data` s'il doit rester au contrat du sous-composant). Re-drop minimal : cette ligne.

Côté app, les autres erreurs tsc sont les nôtres (`Shot.seq` et le câblage `onToggleSegment` qui arrive avec le lot
segments) — rien d'autre à changer chez toi.
