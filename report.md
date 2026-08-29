# Rapport de gate — drop `tatami 2026-08-29.3` — UN point restant, l'import est sinon bon

Tout ce qui était demandé est là et vérifié côté app : `derivedHidden` sans retour anticipé ✓, bandeau « L'engine voit : » et
`LiveFrame` / `TourState.live` retirés ✓, `onCaptureShot(sizeId)` ✓, `shotLabels` hors `RoomProfileData` ✓, ROI du canvas nommées
par déclinaison ✓ (merci). Gates : tsc ✓, react-doctor ✓, vitest 460/460 ✓, e2e 63/63 ✓, pixel-parity 27/27 ✓ — **lint ✗ sur une
seule ligne**, la même qu'au rapport précédent (elle a changé de forme, pas de structure) :

`ui/screens/TourStation.tsx:560` — `@stylistic/multiline-ternary` (`always-multiline`, règle du bundle `doc/ds-lint-bundle`) :

```tsx
{loaded !== null ? (
    <div className={styles.row}>
        …
    </div>
) : null}
```

La règle exige, dès qu'un ternaire s'étale sur plusieurs lignes, un retour à la ligne AVANT `?` et AVANT `:` — le remplacement
exact attendu :

```tsx
{loaded !== null
    ? (
        <div className={styles.row}>
            …
        </div>
    )
    : null}
```

(ou, plus court et lint-clean sans ternaire : `{loaded !== null && (<div …>…</div>)}`). Rien d'autre à toucher : ce drop est
intégré tel quel dès que cette ligne est corrigée.
