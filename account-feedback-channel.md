# Demande durable — le canal de retour de l'alpha sur l'écran Compte

Née de l'audit du parcours alpha (#188 point 4 → #189, milestone « Alpha fermée ») : un joueur alpha qui rencontre un
bug n'a aujourd'hui **personne à qui le dire** depuis l'application. Décision de Romain (2026-09-04) : le canal de
retour est son Discord, identifiant utilisateur **`Ziper_Rom1#7108`** (pas un serveur, donc pas de lien d'invitation),
avec **`romain.laneuville.public@pm.me`** en secours. La page tatami.poker les affiche déjà (`site/index.html`, notes du
bloc téléchargement) ; l'écran `Account` n'a aucun emplacement pour eux — `AccountData` ne porte que `subscription`,
`appVersion`, `update` et `locale`, et `AccountCallbacks` n'offre aucun geste de contact. Rien ne se redessine : une
rangée de plus, deux valeurs servies par l'app, un callback optionnel.

## Ce que le joueur trouve aujourd'hui, et ce qui est vrai

| Dans l'app | Réalité |
|---|---|
| aucune mention d'un contact, ni sur Compte ni ailleurs (zéro `discord`, `mailto:` ou `contact` dans l'application) | deux canaux publiés sur la page : Discord `Ziper_Rom1#7108`, e-mail `romain.laneuville.public@pm.me` |
| le formulaire de retour in-app est #31 | planifié 0.11.x : hors alpha |

## 1. Une rangée « Un bug, une question ? »

Sur l'écran Compte, à l'endroit que Claude Design choisit (sous le bloc « Mise à jour » se lit naturellement : c'est
là que le joueur va quand quelque chose cloche), une rangée qui affiche les deux identifiants **tels quels**,
sélectionnables :

- « Discord : Ziper_Rom1#7108 » — avec un bouton **« Copier »** : il n'existe pas de lien vers un utilisateur Discord,
  copier l'identifiant est le seul geste possible ;
- « ou par e-mail : romain.laneuville.public@pm.me » — cliquable, ouvre le client de messagerie.

## 2. Le contrat

- `AccountData.feedback: { discord: string; email: string }` — **non optionnel**, valeurs servies par l'app, jamais un
  défaut d'écran : l'identifiant change avec la personne qui tient l'alpha, pas avec le design.
- `AccountCallbacks.onOpenFeedbackEmail?: (() => void) | undefined` — une offre, comme `onOpenBilling` ; le container
  ouvre le `mailto:` par `tauri-plugin-opener` (déjà dans `Cargo.toml`). Absente, l'e-mail reste un texte
  sélectionnable.
- Le bouton « Copier » est interne à l'écran (`navigator.clipboard`), aucun callback.

## 3. i18n FR / EN par le drop

Clés `account.feedback*` dans `i18n.ts` : « Un bug, une question ? » / “A bug, a question?”, « Discord : » /
“Discord:”, « ou par e-mail : » / “or by e-mail:”, « Copier » / “Copy”, « Copié » / “Copied”.

## 4. Fixtures

`Account.fixtures.ts` porte les deux valeurs ci-dessus, pour que le prototype, la preview et la baseline de parité
montrent la rangée telle qu'elle sera rendue.

## Ce qui ne change pas

Aucun autre bloc de l'écran Compte, aucun composant partagé. Le formulaire de retour in-app reste #31 (0.11.x).
