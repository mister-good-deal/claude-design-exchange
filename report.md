# Rapport de gates — drop « Suppr + curseur » (import du 2026-07-04)

## Statut : ❌ REJETÉ — react-doctor rouge (no-giant-component) + page preview absente de l'export

Import : lint 0, tsc 0, **react-doctor 1 warning** → drop non committable (notre gate exige zéro diagnostic,
sans suppression ni retouche à la main). Le drop reste sur l'arbre de travail pour test manuel uniquement.

## 1 — BLOQUANT : scinder le composant `LayoutDesigner`

Erreur verbatim :

```
⚠ Maintainability: Component is too large
  → Pull each section into its own component, like `<UserHeader />` and `<UserActions />`.
  rule: react-doctor/no-giant-component
  src/ui/screens/LayoutDesigner.tsx:768
```

Le composant écran a dépassé le seuil avec l'ajout de la gestion Suppr/Backspace. Extraire les grandes
sections en sous-composants nommés — candidats naturels : `CanvasPanel`, `SlotTypesPalette`, `ScreensPanel`,
`ForcedRatioPanel`, `SavedLayoutsPanel` — sans changer ni le rendu ni le contrat (`data`/`on`). Purement
structurel : l'export précédent passait, c'est le handler Suppr qui a fait déborder.

Ce qui est par ailleurs validé dans ce drop (à conserver tel quel) :

- Suppr/Backspace supprime la tuile sélectionnée — fonctionnel, nos 110 tests passent, gardes champ-texte OK.
- Le letterbox canvas exclut déjà les tuiles réservées (`locked = winRatio && !reserved`) — cohérent avec les
  vraies fenêtres de preview (le forcedRatio n'y letterbox plus que les fenêtres de jeu). Rien à faire.

## 2 — `preview-window.html` corrigée jamais reçue : les pages ne voyagent pas dans l'export

Le retrait du `cursor: none` demandé n'était pas dans le zip : le manifest ne cible que `ui/`, `tokens/` et
`styles.css` — les pages standalone (checkout, preview) n'ont aucune entrée. Deux demandes :

1. Livrer la page corrigée (curseur normal partout).
2. **Étendre le contrat d'export aux pages** : nouvelle entrée manifest

   ```json
   { "from": "pages/", "to": "apps/web/public/", "mode": "replace-dir" }
   ```

   avec `preview-window.html` dedans (les pages checkout peuvent y migrer aussi, on adaptera leur consommation
   côté app). Notre `import-ds` gérera cette cible dès le prochain drop — plus jamais un fix de page perdu en
   route. Le contrat (`contract.md`) sera amendé en ce sens de notre côté.

## Contexte app depuis le dernier rapport (pour info)

- Preview v2 en production : fenêtres devant le cockpit, fermeture à la première touche DANS une fenêtre de
  preview (event `preview-stopped` → bouton resynchronisé), forcedRatio + anchor appliqués par cellule.
- `keyCapture.ts` partagé : AZERTY/numpad validés sur machine réelle. Merci — capture impeccable.
- Appliquer un layout sauvegardé recharge sa disposition dans le canvas (activate + re-fetch).
- Pixel-parity toujours 20/20 sur le drop précédent accepté.
