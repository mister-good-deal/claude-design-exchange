# Demande durable — 0.7.3 : l'écran d'erreur de profil doit avoir une sortie

Vague Claude Design de la **0.7.3** — les retours de la campagne Windows 0.7.1 (issue #220, méta #34). Cette
demande est celle de l'issue **#212** : un écran d'erreur qui donne un chemin et rien d'autre est un cul-de-sac.

## 1. Ce que le joueur voit

Premier lancement de la 0.7.1 sur une app-data 0.7.0. Les journaux :

```
WARN  profil live inchargeable (unsupported) : sauvegardé sous …\unibet.json5.unsupported-1788623462
      puis re-seedé depuis la référence
WARN  migration du profil live rejetée par la validation — profil live inchangé
ERROR Screen error: Error: profil invalide : …\profiles/unibet.json5
```

À l'écran : **« This screen hit an error »**, le chemin du profil, un bouton « Retry » qui rejoue la même erreur.
Aucune sortie. La quarantaine avait bien fait son travail (le profil 0.7.0 est intact sous son suffixe), mais le
fichier re-seedé — la ressource embarquée par l'installeur 0.7.0 — ne chargeait pas davantage, et le seed n'avait
pas vérifié qu'il chargeait. Contournement de session : réécrire le profil live à la main.

Le rendu actuel vit dans `apps/web/src/app/components/ErrorBoundary.tsx` : un titre en dur, le message, un bouton.
Il n'a jamais été une surface Claude Design ; il le devient.

## 2. Ce qu'on demande à Claude Design

### 2.1 Un écran d'erreur, servi comme les autres

Un composant DS **`ScreenError`** (`apps/web/src/ui/screens/ScreenError.tsx`, ses fixtures, son entrée dans
`index.ts`), rendu par la garde d'erreur de l'app comme repli. La CLASSE elle-même reste côté app : une frontière
d'erreur React est un composant de classe, et le rail Claude Design ne livre que des composants de fonction. La
garde attrape, compose les données, et rend `<ScreenError data={…} on={…} />`.

Un seul rendu pour tous les cas — une erreur d'écran quelconque n'a ni chemin ni sortie de profil, et l'écran le
montre en ne rendant pas ce qu'on ne lui a pas servi (la règle de la maison : un contrôle dont le rappel est absent
n'est pas rendu).

### 2.2 Ce que l'écran montre

1. **La cause, nommée par le backend, verbatim** — « profil invalide : …\profiles\unibet.json5 » est déjà la
   bonne phrase ; l'écran ne la reformule pas.
2. **Le chemin en cause**, quand l'app en connaît un, sur sa propre ligne, sélectionnable, jamais tronqué en
   silence (un chemin coupé n'est plus un chemin).
3. **Ce que l'app a DÉJÀ fait toute seule**, verbatim quand elle le sait : « profil 0.7.0 mis en quarantaine sous
   unibet.json5.unsupported-1788623462 ». C'est ce qui manquait le plus au terrain — le joueur croyait sa
   calibration perdue.
4. **Les sorties**, dans cet ordre : rejouer le seed, ouvrir le dossier, réessayer.

### 2.3 Les trois sorties

- **« Rejouer le seed du profil »** (`onReseed`) — le geste principal, en `primary`. Sous le bouton, une phrase qui
  dit ce qu'il fait AVANT de le presser : le profil actuel est mis de côté, la référence livrée est rechargée et
  **vérifiée avant** de remplacer quoi que ce soit, et les dispositions d'écran du joueur sont recopiées. Un geste
  qui remplace un fichier doit s'annoncer.
- **« Ouvrir le dossier du profil »** (`onOpenProfileDir`) — en `ghost`. La sortie de secours : elle ne répare
  rien, elle rend la main.
- **« Réessayer »** (`onRetry`) — ce que la garde fait déjà : re-monter l'écran. Il reste, en `ghost`.

Un geste en vol se dit (le bouton porte son mot et ne se re-presse pas), et son verdict se rend **verbatim**,
succès comme refus — « la référence livrée est incompatible avec cette version » est exactement ce que le joueur
doit lire, et l'écran n'a pas à décider si c'est une bonne nouvelle.

## 3. Contrat de données

Nouveau fichier `apps/web/src/ui/screens/ScreenError.fixtures.ts` (types + fixtures), composant
`ScreenError.tsx`, wiring dans `apps/web/src/ui/screens/contract.ts`.

```ts
export interface ScreenErrorData {
    locale: LocaleCode;

    /** La cause, telle que le backend la nomme — rendue VERBATIM, jamais recomposée. */
    message: string;

    /** Le fichier ou le dossier en cause, quand l'app en connaît un. */
    path?: string | undefined;

    /** Ce que l'app a déjà fait toute seule (quarantaine, migration refusée), verbatim. */
    detail?: string | undefined;

    /** Un geste EN VOL : le bouton dit qu'il travaille et ne se re-presse pas. */
    busy?: "retry" | "reseed" | undefined;

    /**
     * Le verdict du dernier geste, rendu verbatim, avec son ton. `null` / absent ⇒ rien à dire — deux façons de
     * ne rien avoir, une seule façon de rendre (#111).
     */
    outcome?: { ok: boolean; message: string } | null | undefined;
}

export interface ScreenErrorCallbacks {
    onRetry?: (() => void) | undefined;

    /** OFFRE — rejouer le seed du profil. Sans rappel, pas de bouton : toutes les erreurs ne sont pas un profil. */
    onReseed?: (() => void) | undefined;

    /** OFFRE — ouvrir le dossier du profil dans l'explorateur de l'OS. */
    onOpenProfileDir?: (() => void) | undefined;
}
```

Et dans `contract.ts` :

```ts
/* `onReseed` et `onOpenProfileDir` restent des OFFRES : une erreur qui n'est pas un profil n'a ni l'un ni l'autre. */
export type ScreenErrorWiring = Wiring<ScreenErrorCallbacks, "onRetry">;
```

**Retiré : rien** — c'est une surface neuve. Ne changent pas : `RoomProfileData.rejection` (le refus d'un geste
DANS l'écran de calibration, qui reste rendu là où il naît) et `WriteVerdict`.

### Ce que l'app servira (pour information, hors périmètre DS)

Deux commandes IPC nouvelles, nommées ici pour que la demande et le câblage ne se croisent pas :

- **`profile_reseed`** — écrit le profil re-seedé dans un fichier temporaire, le **recharge par le vrai
  chargeur**, et ne remplace le profil live qu'à ce moment-là ; recopie les `layouts` du profil mis en quarantaine
  (lecture tolérante de cette seule clé). Un échec ne déplace rien et rend la cause.
- **`open_profile_dir`** — ouvre le dossier du profil live dans l'explorateur de l'OS : celui qui porte
  `unibet.json5` et ses copies de quarantaine.

`onReseed` → `profile_reseed`, dont le verdict remplit `outcome` ; `onOpenProfileDir` → `open_profile_dir` ;
`onRetry` → le `setState` que la garde fait déjà. La vérification du seed et la recopie des `layouts` sont la
partie backend de #212, hors périmètre Claude Design.

## 4. i18n — clés FR/EN à prévoir dans `ui/screens/i18n.ts`

Une section neuve `screenError`, à côté de `roomProfileV3` et des autres. Aucun mot d'erreur n'y entre : la cause,
le détail et le verdict sont servis.

- `title` — FR : « Cet écran s'est arrêté sur une erreur » · EN : "This screen stopped on an error"
- `pathLabel` — FR : « Fichier en cause » · EN : "File at fault"
- `detailLabel` — FR : « Ce que l'app a déjà fait » · EN : "What the app already did"
- `retry` — FR : « Réessayer » · EN : "Retry"
- `retryBusy` — FR : « Nouvel essai… » · EN : "Retrying…"
- `reseed` — FR : « Rejouer le seed du profil » · EN : "Re-seed the profile"
- `reseedBusy` — FR : « Seed en cours… » · EN : "Seeding…"
- `reseedHint`
  - FR : « Le profil actuel est mis de côté ; la référence livrée est rechargée et vérifiée avant de le
    remplacer, et vos dispositions d'écran sont recopiées. »
  - EN : "The current profile is set aside; the delivered reference is reloaded and verified before replacing
    it, and your screen layouts are copied over."
- `openDir` — FR : « Ouvrir le dossier du profil » · EN : "Open the profile folder"

## 5. Fixtures

`ScreenError.fixtures.ts` — quatre postures, dont les deux premières sont celles du terrain :

1. **profil invalide** — `message` = « profil invalide : …\profiles\unibet.json5 », `path` servi, `detail` =
   la phrase de quarantaine, les trois sorties câblées ;
2. **seed refusé** — la même, plus `outcome: { ok: false, message: "la référence livrée est incompatible avec
   cette version" }` ;
3. **seed en cours** — `busy: "reseed"`, le bouton portant son mot et inerte ;
4. **erreur quelconque** — ni `path`, ni `detail`, ni `onReseed`, ni `onOpenProfileDir` : le titre, le message et
   « Réessayer », c'est-à-dire l'écran d'aujourd'hui, en mieux nommé. C'est la posture de non-régression.

## 6. Ce qui ne bouge pas

- Le cockpit (`AppShell`), sa navigation et son chrome : la garde d'erreur remplace le CONTENU d'un écran, pas la
  coquille — c'est déjà le cas et cela reste vrai.
- La frontière d'erreur elle-même (`apps/web/src/app/components/ErrorBoundary.tsx`) : elle reste app-owned, garde
  sa capture et son journal, et ne fait que rendre le composant DS à la place de son repli en dur.
- `RoomProfileData.rejection` et `WriteVerdict` : les refus d'un geste dans l'écran de calibration se rendent là
  où ils naissent, pas ici.
- Aucun autre écran n'est touché.
