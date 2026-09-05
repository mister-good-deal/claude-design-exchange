# Demande durable — le mur d'activation pendant l'alpha fermée

Née de l'audit du parcours alpha (#188 point 4 → #190, milestone « Alpha fermée »). L'écran `Activation` est livré et
honoré ; ce qui suit ne redessine rien, ce sont des **textes qui mentent** et deux champs qui manquent pour dire vrai.
Le câblage app est fait de son côté (le container ne lit plus aucune fixture DS pour le prix et l'essai) ; les quatre
points ci-dessous vivent dans l'export DS, donc chez Claude Design.

## Ce que le joueur lit aujourd'hui, et ce qui est vrai

| Sur le mur | Réalité |
|---|---|
| « Carte requise » (`i18n.ts`, `activation.reassure`) | `CHECKOUT_COLLECT_CARD=if_required` en alpha : **aucune carte n'est demandée**, et le site le promet noir sur blanc |
| « Overlay natif, HUD & color tags » (`activation.features.overlay`) | le HUD n'est pas livré (#22) |
| `€29/mo`, `First month free · no commitment` (`ACTIVATION_FIXTURE`) | 25 €/mois, essai de **30 jours** (`create_checkout_session`) |
| rien sur le code `ALPHA` | sans lui, l'essai finit en abonnement plein, `past_due`, app verrouillée sans un mot |

## 1. La mention de la carte

`activation.reassure` ouvre sur « Carte requise » / “Card required”. C'est faux pendant l'alpha, et c'est la
contradiction la plus visible : la page tatami.poker dit « aucune carte bancaire demandée pendant l'alpha » et
l'application dit l'inverse à l'écran suivant.

Deux formes acceptables, au choix de Claude Design :

- **texte** — « Aucune carte pendant l'alpha · annulable à tout moment · paiement sécurisé via Stripe » /
  “No card during the alpha · cancel anytime · secure payment via Stripe” ;
- **prop** — `ActivationData.cardRequired: boolean` (non optionnel, une valeur servie comme `locale`) qui choisit
  entre les deux clauses. C'est la forme durable : la posture est un vrai interrupteur de déploiement
  (`CHECKOUT_COLLECT_CARD` vaut `always` en production, `if_required` en alpha), pas une phrase de circonstance.

## 2. « HUD » sort de la liste des fonctionnalités

`activation.features.overlay` vend « Overlay natif, HUD & color tags » / “Native overlay, HUD & color tags”. Le HUD
est l'issue #22, non livrée. Demandé : **« Overlay natif & color tags »** / “Native overlay & color tags”. Les deux
autres lignes (`layouts`, `hotkeys`) sont vraies et ne bougent pas.

## 3. Une ligne pour le code `ALPHA` et la fin de l'essai

Il n'existe aujourd'hui aucun emplacement où dire au joueur ce qu'il doit faire dans la page Stripe. Demandé :

- `ActivationData.offerNote?: string | undefined` — une note **servie par l'app**, rendue verbatim sous le bloc de
  plan (ton discret, deux lignes au plus, jamais un défaut d'écran : absente, rien ne se rend).
- L'app y sert, en `fr` comme en `en`, la phrase qui manque : le code `ALPHA` à saisir sur la page Stripe, et ce qui
  se passe à la fin de l'essai.

Un champ, pas un bloc : la formulation est de l'app, parce qu'elle change avec la vague d'invitations et avec la fin
du coupon (M+3), pas avec le design.

## 4. Les fixtures cessent d'annoncer une offre qui n'existe pas

`ACTIVATION_FIXTURE` porte `priceLabel: "€29/mo"` et `trialLabel: "First month free · no commitment"`, et l'écran les
prend en défaut de props (`Activation({ data = ACTIVATION_FIXTURE })`) : c'est donc ce que rendent le prototype, la
preview et la baseline de parité. Demandé : **`€25/mo`** et **`30-day trial · enter code ALPHA on the Stripe page`**,
plus une `offerNote` d'exemple. Le prix et l'essai restent des props servies par l'app — la fixture ne fait que cesser
de contredire la production.

## Ce qui ne change pas

Aucune mise en page, aucun composant, aucun callback. `splitPrice` (sur `/`) et `splitTrial` (sur `·`) gardent leur
contrat : l'app sert « 25 €/mois » et « 30 jours d'essai · … » et l'écran les découpe comme aujourd'hui.
