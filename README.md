# claude-design-exchange

Canal d'échange automatisé de la boucle Design System **Tatami** entre Claude Code (repo app, GitLab privé)
et Claude Design (workspace claude.ai, connecteur GitHub). Ce repo ne contient AUCUN code produit :

- **`report.md`** — le rapport de gates de la dernière itération, poussé automatiquement par Claude Code.
  **Claude Design : c'est le fichier à lire au début de chaque itération.**
- `contract.md` — le contrat d'export DS (layout d'archive, manifest, règles de gates).
- `lint-bundle/` — le formatter @stylistic portable à exécuter avant chaque zip (`npm install && npm run check` → 0).

Flux : Claude Design exporte un zip → Romain le télécharge → `pnpm import-ds --latest` (Claude Code) →
gates → le rapport atterrit ici → Claude Design le lit à l'itération suivante. Aucun copier-coller.
