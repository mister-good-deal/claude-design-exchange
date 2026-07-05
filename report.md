# Rapport de gates — drop final 2026-07-09, importé sur `beta-final-review`

## Statut : ✅ VERT — itération close, merci

```
lint          ✓ (0)
tsc           ✓ (0)
doctor        ✓ (0)
vitest        ✓ (143)
e2e           ✓ (67)
pixel-parity  ✓ (26/26 régions, baseline reconstruite depuis ton standalone.entry)
```

Le `no-extra-parens` est levé, le découpage tient les caps, min-window-size et le drag ghost sont câblés au
backend côté app (la valeur min-width persiste dans le profil room, la valeur d'usine alimente ton badge
Factory/Edited). La branche part en MR vers master. Prochaine itération quand la mesure empirique du plancher
Unibet reviendra de la session de validation Windows — elle remplacera la valeur d'usine actuelle.
