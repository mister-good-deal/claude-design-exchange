# Claude Design brief — Activation screen (feature 015: subscription & licensing)

> Hand this to Claude Design. It adds ONE new presentational screen, `Activation`, to the Tatami DS export, following the
> existing export contract (`contract.md` on the exchange repo). Everything below obeys that contract — presentational
> with props, gate-clean, added to `manifest.json` + `standalone.entry.tsx`. Romain will ask for a few sketch directions,
> pick one, and the app team ports the chosen export via `pnpm import-ds --latest`.

## Why this screen exists

Tatami is becoming a paid app (single subscription, 30-day free trial). Until a device is licensed, the app is **fully
walled**: the ONLY thing the user can reach is this Activation screen. Once licensed, they never see it again (except a
small credential panel in settings, and an offline banner — see states). There is no login, no password, no code to
paste: the user clicks Subscribe, pays in their browser, and the app activates itself automatically.

This is a window-management/table tool for online poker players (the existing Tatami look — dark, dense, technical,
`lucide-react` icons, the `var(--…)` token system). The Activation screen is the first thing a new user sees, so it
should feel trustworthy and premium, but stay in the family of the existing screens (same tokens, same chrome). It
renders inside the existing AppShell window chrome (the `windowControls` slot still shows).

## The screen is a state machine — design ALL of these states

`Activation` renders one of several states driven by a single `data.state` prop. Design each; they share a frame.

1. **`subscribe`** (default / logged-out wall) — the pitch + primary CTA.
   - Product name, a one-line value prop, the price (`data.priceLabel`, e.g. "29 €/mois"), and the trial offer
     (`data.trialLabel`, e.g. "1er mois offert · sans engagement").
   - Primary button **"S'abonner"** → `on.onSubscribe()`. A secondary, quieter affordance **"J'ai déjà un abonnement"**
     → `on.onRestore()` (for reinstalls — triggers the email-recovery path).
   - A reassurance line: card required, cancel anytime, secure payment via Stripe. Keep it honest and calm, not
     salesy-loud.

2. **`activating`** — checkout opened in the browser, app is waiting.
   - A calm progress/waiting state: "Terminez le paiement dans votre navigateur…" with an indeterminate indicator.
   - A secondary "Ouvrir à nouveau la page de paiement" → `on.onReopenCheckout()` (in case they closed the tab), and a
     "Annuler" → `on.onCancel()` back to `subscribe`.
   - This state can persist across an app restart (the app resumes polling), so it must read as "we're on it", not
     "frozen".

3. **`activated`** — success flash before the app unlocks.
   - Brief confirmation ("Abonnement actif — bienvenue"), then the app swaps to the real UI (the container handles the
     swap; you just design the confirmation moment).

4. **`error`** — activation could not complete.
   - A clear, non-alarming message from `data.errorMessage`, a **"Réessayer"** → `on.onRetry()`, and the same
     "J'ai déjà un abonnement" recovery affordance. Never a dead end.

5. **`expired`** (was licensed, subscription lapsed) — a returning user whose access ended.
   - Distinct from first-run `subscribe`: acknowledge they were a customer ("Votre abonnement a expiré"), primary
     **"Renouveler"** → `on.onSubscribe()`. Reuse the frame; change the copy/emphasis.

Also design two **licensed-state fragments** (they appear elsewhere, not on the wall — expose them as small exported
pieces of this screen file or as clearly-named subcomponents the app can slot in):

6. **Credential panel** (lives in app settings once licensed) — shows `data.credential` (an opaque key string) with a
   copy button → `on.onCopyCredential()` and a "Renvoyer par e-mail" → `on.onResendCredential()`. Read-only, discreet.

7. **Offline/grace banner** — a slim inline banner for when the app is licensed but running on cached entitlement:
   "Hors ligne — licence valide jusqu'au {data.validUntil}". Informational, not a blocker.

## Props contract (define these types in `Activation.fixtures.ts`, export a default `ActivationData`)

```ts
export type ActivationStateKind = "subscribe" | "activating" | "activated" | "error" | "expired";

export interface ActivationData {
    state: ActivationStateKind;
    priceLabel: string;            // "29 €/mois"
    trialLabel: string;            // "1er mois offert"
    errorMessage?: string | undefined;   // only in state==="error"
    credential?: string | undefined;     // for the settings credential panel
    validUntil?: string | undefined;     // for the offline/grace banner, human date
}

export interface ActivationCallbacks {
    onSubscribe(): void;
    onRestore(): void;             // "j'ai déjà un abonnement" → email recovery
    onReopenCheckout(): void;
    onCancel(): void;
    onRetry(): void;
    onCopyCredential(): void;
    onResendCredential(): void;
}

export function Activation(props: { data: ActivationData; on: ActivationCallbacks }): ReactNode;
```

Local-only UI state (a "copied!" tooltip flash, hover) lives inside the screen. Everything else is `data` in / `on` out.
No IPC, no fetch, no timers that drive domain state — the app owns all of that (it flips `data.state`).

## Integration into the export (per the contract)

- Add `Activation.tsx`, `Activation.module.css`, `Activation.fixtures.ts` to `ui/screens/`.
- Add to `manifest.json` `screens[]`:
  `{ "name": "Activation", "props": { "data": "ActivationData", "on": "ActivationCallbacks", "slots": [] } }`.
- Export from `ui/screens/index.ts`.
- Add an Activation composition to `standalone.entry.tsx` so it enters the pixel-parity baseline (pick the `subscribe`
  state as the baseline view; the parity harness renders fixtures).
- Gate-clean, unmodified: `tsc` strict + react-doctor 0 diagnostics. In particular the wall's primary CTA and the
  "already subscribed" link must be real semantic interactive elements (`<button>`), not `role`-decorated divs
  (`prefer-tag-over-role`, `no-static-element-interactions`).

## Sketch directions Romain will choose between

Offer a few distinct **layout/mood** takes on the `subscribe` wall (the others follow the winner's frame): e.g. a
centered focal card vs. a split hero, how much the poker-tool identity shows through, how the trial offer is
emphasized. Keep all of them inside the Tatami token system so the winner ports with zero pixel surprises.
