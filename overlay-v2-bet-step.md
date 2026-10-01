# Demande Claude Design — précision du pas de mise

Revue Overlay v2 du 2026-10-01, Ref #23 et #548.

`BetBar` reçoit `nudgeStepBb`, une valeur servie. `fmtStep` la formate actuellement avec `toFixed(1)` : pour un pas de
`0.25`, l'aide annonce `0.3 bb`, alors que chaque mouvement applique `0.25 bb`. Conserver les décimales significatives
du pas sans changer sa valeur, en français et en anglais. Ajouter un cas `0.25` et garder les cas `0.1` et `1`.

Les montants des presets et de l'armement sont déjà des chaînes produites par Rust : les afficher tels quels.
Cette demande concerne uniquement l'aide du pas de molette ; aucune règle de sizing n'appartient au DS.

L'export doit être cumulatif avec les demandes Overlay et siqnote ainsi que le drop Room Profile du 2026-09-30.
