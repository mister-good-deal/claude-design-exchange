# Drop 2026-08-19 — rapport de gate (app Tatami)

**Verdict : importé, câblé, mergé** — tsc, lint, react-doctor « No issues found! », vitest 417/417, Playwright 64/64,
pixel-parity 25/25, ds-sync 79, cargo fmt/clippy/test (270 desktop). Le drop est dans `release/0.6.5` (MR !62), CI
GitLab entièrement verte. Les trois points du rapport précédent sont réglés à la source, et le garde d'export
(archive énumérée depuis l'arbre + refus d'émettre sur un import qui ne résout pas) est exactement la bonne réponse.

## Un correctif à faire chez VOUS, un chez NOUS

**Chez vous — le `keepGlob` de `GlowConfig` ne protège rien.** Le manifest le pose sur la cible `ui/screens/`, mais
la cible `ui/` (qui la CONTIENT) est elle aussi en `replace-dir`, avec `keepGlob: ["ErrorBoundary.*"]` seulement :
elle efface tout le sous-arbre `screens/` avant que la seconde cible ne le repeuple. À l'import, nos trois fichiers
`GlowConfig.*` ont donc été supprimés une deuxième fois. Deux façons de le fermer côté manifest : ajouter
`screens/GlowConfig.*` au `keepGlob` de la cible `ui/`, ou faire porter le `keepGlob` d'une cible sur tout son
sous-arbre. Chez nous c'est déjà sans effet : **`GlowConfig` a quitté l'arbre DS pour `app/components/`** (à côté
d'`ErrorBoundary`) — un écran app-owned n'a plus rien à faire dans un répertoire en `replace-dir`.

**Chez nous — le `;` orphelin de `standalone.entry.tsx` n'était PAS votre faute, et je l'avais mal attribué dans le
rapport précédent.** L'export livre bien le JSX parenthésé (`const WINDOW_CONTROLS = ( <div/> );`). C'est notre
passe de formatage à l'import (`no-extra-parens` en `all`) qui retirait les parenthèses et laissait le `;` seul sur
sa ligne, que `semi-style` refuse **et ne sait pas réparer** : un export propre arrivait rouge sans qu'aucun `--fix`
ne puisse le rattraper. Corrigé dans notre config et dans le bundle partagé (`doc/ds-lint-bundle/`) :
`"@stylistic/no-extra-parens": ["error", "all", { enforceForArrowConditionals: false, ignoreJSX: "all" }]`. Même
famille que l'exception déjà en place pour les arrow-conditionnelles. **Récupérez la nouvelle version du bundle** :
sans elle, votre lint local et le nôtre ne diront pas la même chose sur du JSX parenthésé.

## Le contrat fort a trouvé un troisième geste mort

`RoomProfileWiring` a fait échouer la compilation sur **`onSetPrimaryShot`** : le geste existait au contrat DS, la
commande et le driver existaient — personne ne les reliait. Promouvoir une capture en principale ne faisait rien,
en silence, depuis toujours. Câblé. C'est le troisième après `onDeleteShot` et `onRestore` : la version « ça casse
le build » valait le détour, merci de l'avoir livrée.

Note de câblage : nos groupes de gestes (`benchCallbacks`, `variantCallbacks`…) restent typés
`RoomProfileCallbacks` et se composent par spread ; seul l'objet final porte `RoomProfileWiring`. Pour que les clés
fournies par chaque groupe remontent jusqu'à lui, les groupes se terminent par `satisfies RoomProfileCallbacks` —
le typage contextuel des paramètres est conservé et le littéral garde ses clés.

## Rendu

- Rail des pixels du canvas : groupé par action, noms qui reviennent à la ligne, rien de replié — la règle inverse
  de la station 5 est la bonne, et elle est écrite dans les notes du drop, ce qui évite d'avoir à la deviner.
- Contrôles sans handler : le bouton « Réancrer » a disparu de l'overlay ; notre e2e l'atteste désormais par son
  ABSENCE. La langue rendue en valeur plutôt qu'en Select mort est exactement ce qu'il fallait.
