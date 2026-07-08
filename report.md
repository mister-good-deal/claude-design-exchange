# Iteration request — NOUVEL écran « Account » (Compte) + onglet nav (feature 017)

Verdict du dernier import (DS 2026-07-08) : GREEN. Cette itération **ajoute un écran** et **un onglet de nav** — elle ne modifie pas les écrans existants. Garder tous les gates verts (tsc + react-doctor = 0 au source, cf. `contract.md`). Ré-exporter le DS complet.

## Contexte produit

L'app desktop gagne un auto-updater (gaté par licence, non forcé) et il faut une surface de **gestion post-activation**. L'écran **Activation** existant (015) reste la porte d'entrée (hors-licence, saisie du code) — **ne pas y toucher**. Le nouvel écran **Account** est la gestion pour un utilisateur déjà licencié : abonnement, version de l'app, mises à jour.

## 1. Nouvel écran présentationnel `Account` (Compte)

Même patron que les autres écrans DS : présentationnel pur, props `{ data, on }`, primitives + tokens existants (Panel, Badge, Button, etc.), cohérent visuellement avec Overlay/Activation. Fichiers attendus : `ui/screens/Account.tsx` + `.module.css` + `.fixtures.ts`, et l'ajouter à `ui/screens/index.ts` + au manifeste.

**`AccountData`** :
- `subscription`: `{ state: "active" | "expired" | "unknown", validUntil?: string (ISO), planLabel?: string }`
- `appVersion`: `string` (ex. `"0.3.0"`)
- `update`: `{ state: "up-to-date" | "checking" | "available" | "downloading" | "ready" | "error", version?: string, notes?: string, progressPct?: number, error?: string }`

**`AccountCallbacks`** :
- `onCheckUpdate(): void` — bouton « Vérifier les mises à jour »
- `onApplyUpdate(): void` — bouton « Redémarrer pour appliquer » (visible seulement en état `ready`)
- `onOpenBilling(): void` — bouton « Gérer l'abonnement » (ouvre le portail)

**Sections de l'écran** (3 Panels) :
1. **Abonnement** — badge d'état (active = accent, expired = danger, unknown = neutral), échéance lisible (`validUntil`), `planLabel` si présent, bouton « Gérer l'abonnement ». Si `state="unknown"` ou `validUntil` absent → afficher « indisponible » honnêtement, **jamais** une valeur inventée.
2. **Version** — la version courante (`appVersion`) en évidence (mono), libellé « Version installée ».
3. **Mises à jour** — piloté par `update.state` :
   - `up-to-date` → « À jour » (état calme, discret) + bouton « Vérifier ».
   - `checking` → indicateur « Vérification… ».
   - `available` → « Version {version} disponible » + `notes` (zone de texte) — pas d'action de download (le téléchargement démarre automatiquement en fond côté app).
   - `downloading` → barre de progression (`progressPct` 0–100) + « Téléchargement… ».
   - `ready` → « Mise à jour prête » + bouton **« Redémarrer pour appliquer »** (accent). Message clair : l'app redémarrera.
   - `error` → message d'erreur honnête (`error`) + bouton « Réessayer » (rappelle `onCheckUpdate`). Jamais un faux « à jour ».

Honnêteté (contrainte projet forte) : aucune donnée fabriquée ; un champ absent = état « indisponible » explicite.

## 2. Onglet « Compte » dans la nav (AppShell)

Ajouter une entrée de nav **Compte** au rail de l'AppShell (icône type compte/utilisateur), après les écrans existants. Elle DOIT porter une **pastille discrète** (dot) quand une maj demande l'attention — piloté par une prop d'AppShell, ex. `data.accountBadge: boolean` (true quand l'update est `available` | `downloading` | `ready`). Pas de modale, pas d'interruption : juste la pastille sur l'onglet.

## Fixtures / états à couvrir

Fournir des fixtures couvrant : subscription `active` (avec échéance) et `expired` ; update dans chaque état (`up-to-date`, `available` avec notes, `downloading` à ~40 %, `ready`, `error`). Et une variante AppShell avec `accountBadge: true` pour exercer la pastille.

## Notes

- Ne modifie **que** : nouvel `Account.*`, `AppShell` (ajout onglet + prop badge), `index.ts`, `manifest.json`, fixtures. Aucun autre écran.
- Ré-exporter le DS complet (`pnpm import-ds` doit rester un drop-in clean).
