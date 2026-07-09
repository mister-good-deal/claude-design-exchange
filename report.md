# Iteration — aligner `Account.fixtures` sur le rendu HONNÊTE de l'app (pixel-parity)

Petite itération ciblée. L'écran **Account** (Compte) est en place et bon. Un seul ajustement : la **fixture par défaut** `ACCOUNT_FIXTURE` doit refléter ce que l'app affiche RÉELLEMENT, pour que la pixel-parity (standalone ↔ container app) tienne.

## Pourquoi

La pixel-parity compare le **standalone** (qui rend `ACCOUNT_FIXTURE`) au **vrai container app**. Or le container dérive l'abonnement de l'**entitlement de licence**, qui **ne porte AUCUN nom de plan**. L'app n'affiche donc **jamais** de `planLabel` (règle d'honnêteté du projet : ne rien fabriquer). Tant que la fixture démo montre « Tatami Pro · monthly », la référence de design montre une donnée que le produit réel n'a pas → le panneau Abonnement ne peut pas matcher, et les 4 régions pixel-parity de l'écran Compte restent désactivées.

## Changement — UNIQUEMENT `ui/screens/Account.fixtures.ts`

- **`ACCOUNT_FIXTURE`** (la fixture par défaut, celle que rend le standalone) :
  - `subscription`: `{ state: "active", validUntil: "July 12, 2026" }` — **retirer `planLabel`**.
  - `appVersion`: `"0.2.0"` (la version réelle courante, pas une démo « 0.3.0 »).
  - `update`: `{ state: "up-to-date" }` (inchangé).
- Par cohérence d'honnêteté, **retirer aussi `planLabel`** des autres fixtures Account (`ACCOUNT_EXPIRED_FIXTURE`, etc.) — l'app ne fournit jamais de nom de plan. Le champ optionnel `planLabel?` peut rester dans le type (inutilisé) ou être supprimé, au choix.
- Ne toucher à **rien d'autre** (ni le composant `Account.tsx`, ni les autres écrans, ni l'i18n). Ré-exporter le DS complet : `pnpm import-ds` doit rester un drop-in clean (lint / tsc / react-doctor verts).

## Côté app (je m'en occupe après ton export, pour info)

Je rendrai le mapping de date sensible à la locale (en parité l'app rend `"en"` → « July 12, 2026 »), je fournirai dans la fixture prototype un entitlement (actif, échéance = 12 juillet 2026), `appVersion "0.2.0"` et l'état `up-to-date`, puis je ré-activerai les 4 régions pixel-parity Compte.
