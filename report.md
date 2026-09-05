# Vague 0.7.2 — drop 2026-09-05 VALIDÉ (points 1–3 honorés) ; UN point de plus : les notes de version dans tous les états de la mise à jour

**État (11:00)** : le drop `2026-09-05` est **validé sur copie scratch**, merci : export propre, les trois points honorés en forme durable (`cardRequired`, `offerNote`, `feedback` + `onOpenFeedbackEmail`, HUD retiré, fixtures 25 € / 30 jours, `.notes` en `pre-line`), écarts du `.4` repris. Il part à l'import avec le câblage app. **Reste un seul point, découvert en câblant (§4 ci-dessous)** : un re-drop `.2` qui ne porte que lui est bienvenu ; sinon il attend la vague suivante.

Pour mémoire, le drop `2026-09-04.4` est **importé** (MR d'import verte : lint, doctor, tsc, 513 tests, e2e 74/74, parité
pixel 28/28 dont la région `engine-main` à 0 px — le point #174 est clos). Vague 0.7.1 CLOSE, merci. Les deux écarts
sans effet (`manifest.screens[AppShell].slots` liste encore `engineView` ; `parity.roiFloorPx` = 4 à côté de
`roiFloorTenPx` = 10) sont à reprendre dans ce drop.

Cette vague vient de l'audit du parcours de l'alpha fermée : ce sont des **textes et deux champs de données**, aucune
mise en page ne bouge. Les deux demandes complètes vivent dans **`activation-alpha-offer.md`** et
**`account-feedback-channel.md`** (durables) ; le point 3 tient en une ligne ci-dessous. Elle est attendue **dans la
0.7.1** : dès que le drop est dans `_handoff/tatami-ui-package/` avec `manifest.version` bumpé, on l'importe.

## 1. Le mur d'activation dit le vrai prix, le vrai essai et le code `ALPHA` — `activation-alpha-offer.md`

1. **La carte** — `activation.reassure` ouvre sur « Carte requise » ; c'est faux pendant l'alpha (aucune carte
   demandée, le site le promet). Au choix : texte « Aucune carte pendant l'alpha · annulable à tout moment · paiement
   sécurisé via Stripe », ou la forme durable `ActivationData.cardRequired: boolean` (servie par l'app, comme `locale`)
   qui choisit entre les deux clauses.
2. **« HUD » sort** de `activation.features.overlay` → « Overlay natif & color tags » / “Native overlay & color tags”.
3. **`ActivationData.offerNote?: string | undefined`** — une note servie par l'app, rendue verbatim sous le bloc de
   plan (ton discret, deux lignes au plus ; absente, rien ne se rend) : le code `ALPHA` à saisir sur la page Stripe et
   la fin de l'essai.
4. **Fixtures** : `ACTIVATION_FIXTURE` annonce `€25/mo` et `30-day trial · enter code ALPHA on the Stripe page`, plus
   une `offerNote` d'exemple — plus jamais `€29/mo` / « First month free ». `splitPrice` (sur `/`) et `splitTrial`
   (sur `·`) gardent leur contrat.

## 2. Une rangée « Un bug, une question ? » sur l'écran Compte — `account-feedback-channel.md`

- Une rangée de plus (sous le bloc « Mise à jour » se lit naturellement, à vous de placer) qui affiche deux
  identifiants **tels quels**, sélectionnables : « Discord : Ziper_Rom1#7108 » avec un bouton **« Copier »**
  (`navigator.clipboard`, interne à l'écran — il n'existe pas de lien vers un utilisateur Discord), puis « ou par
  e-mail : romain.laneuville.public@pm.me » cliquable.
- Contrat : `AccountData.feedback: { discord: string; email: string }` (**non optionnel**, servi par l'app) ;
  `AccountCallbacks.onOpenFeedbackEmail?: (() => void) | undefined` (une offre, comme `onOpenBilling`).
- i18n FR/EN par le drop, clés `account.feedback*` : « Un bug, une question ? » / “A bug, a question?”, « Discord : » /
  “Discord:”, « ou par e-mail : » / “or by e-mail:”, « Copier » / “Copy”, « Copié » / “Copied”. Fixtures
  `Account.fixtures.ts` : les deux valeurs ci-dessus.

## 3. Les notes de version se lisent sur plusieurs lignes (écran Compte)

`AccountData.update.notes` va recevoir la **section du CHANGELOG** de la version disponible (texte brut, une ligne
par entrée, précédée d'un « • », longueur plafonnée) au lieu de « Tatami 0.7.1 ». Le `div` `styles.notes` rend
aujourd'hui le texte d'un bloc : demandé **`white-space: pre-line`** sur `.notes` (les sauts de ligne du texte servi
deviennent des lignes, rien d'autre), et une fixture `notes` sur trois lignes pour que la preview et la baseline le
montrent. Pas de rendu Markdown : l'app sert du texte.

## 4. Les notes de version aussi pendant le téléchargement et quand la mise à jour est prête (ajout 11:00)

`Account.tsx` ne rend `update.notes` que dans `UpdateNote` (état `available`). Or l'app télécharge d'elle-même au
démarrage : le joueur ne voit l'écran qu'en `downloading` puis `ready`, deux vues (`UpdateDownloading`, `UpdateReady`)
qui n'ont **aucun emplacement pour les notes**. Le type `AccountUpdate.notes` les accepte déjà et l'app les sert
désormais dans les trois états. Demandé : le même bloc `.notes` (avec son `pre-line`) sous le titre de
`UpdateDownloading` et de `UpdateReady`, rendu seulement quand `notes` est présent ; fixtures des deux états avec des
notes sur trois lignes. Rien d'autre ne bouge.

## Ce qui ne bouge pas

Aucun composant partagé, aucun callback existant, aucun autre bloc des écrans `Activation` et `Account`. Les demandes
durables précédentes restent honorées ; contrat d'export et bundle lint inchangés. Le formulaire de retour in-app
n'est pas dans cette vague.

Verdict d'import au prochain rapport, après le drop.
