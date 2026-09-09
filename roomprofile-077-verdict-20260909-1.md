# Vague 0.7.7 — redrop 2026-09-09.1 : résidu de lint à corriger

Issue groupée : https://gitlab.laneuville.me/rom1/tatami/-/issues/265
Archive SHA256 `b00bedc2781cafa0a13b6efbb23e14e62f80a1d943fc559a9e7652e8c38df6e2`.
Version et previewVersion `2026-09-09.1`, previewOnly vide. Scratch puis import officiel ont passé TypeScript et
Doctor, mais lint reste rouge après la normalisation mécanique officielle. Aucun push/MR du candidat.

## D1–D4 — témoins de non-régression verts

La lecture du redrop est favorable : D1 réinitialise la tentative et remonte l'image à URL identique ; D2 retire
la hauteur fixe du crop ; D3 relit l'identité famille/id du paquet et gère sa disparition ; D4 transmet la famille
dans les callbacks de renommage et suppression. Le câblage app cible désormais la paire famille/id, sans nouvel
IPC ni profil. La correction palette reste app et conserve l'ancienne couleur/date à côté du brouillon.

Candidat local `d4952691295d6340d79d71ce9ae8384fd4a227de`, base release
`4179d8a32e80371ce0f70afad7c9595ad28e89a6`. Typecheck projet et lint app ciblé verts ; verrou106fichiers conforme.
48 tests existants ciblés passent en 21,42 s. Les **17 témoins dédiés lt-tests sont verts**, sans skip ni xfail,
en 7,41 s sur `f52917d41f0b72ee263ae518f959d317417f2ee4` (d495269 + les quatre fichiers de tests8426268).
Les fichiers de tests sont identiques au témoin précédent : 12 verts/5 rouges deviennent 17 verts sans changement
d'oracle. Rejeu même URL, renommage relu, disparition des commandes et bonne famille rename/delete sont vérifiés.

Le cadrage D2 est aussi vert dans Chromium sous verrou, CSS exact du redrop : contenu498×24,890625,
sourceY99,96235 et hauteur14,99435, attendus24,9/100/15 aux arrondis subpixel près. La même image synthétique et
les mêmes mesures de bounding boxes retrouvent la bande verte. Cette preuve scratch ne vaut ni OCR ni parité app
globale. Logs et screenshot sous `ds-20260909-1/lt-tests/`, rapport `verdict-f52917d.md`.
Les rouges du premier drop et la correction d'oracle palette restent archivés ; aucun nouveau défaut palette.

## D5 — lint PackFilter : deux erreurs persistent après le formateur

Dans `ui/screens/PackFilter.tsx`, lignes de l'export NORMALISÉ :

```text
113:14 error Expected newline between test and consequent of ternary expression @stylistic/multiline-ternary
113:49 error Expected newline between consequent and alternate of ternary expression @stylistic/multiline-ternary
```

Emplacement : le ternaire `{rename !== undefined && renaming ? (` ; le commentaire D3 se trouve entre ce début
et `<PackRename>`. La passe `pnpm run lint:fix` de l'import laisse les diagnostics. Une vérification ciblée
`pnpm exec eslint apps/web/src/ui/screens/PackFilter.tsx --fix` les reproduit également, zéro warning du fichier.

Correction demandée **dans la source Design**, puis nouvel export cumulatif : rendre cette construction conforme
au formateur portable et aux règles du projet. Aucun déplacement manuel du commentaire ni retouche DS dans l'app,
aucune suppression de diagnostic, aucun assouplissement de règle. D5 est un blocage de gate, distinct des quatre
contre-exemples fonctionnels D1–D4. Le report détaillé précédent reste ci-dessous comme historique et oracle.

Les logs scratch/import officiel et formatter ciblé sont archivés sous
`/home/rom1/.herdr/reports/tatami-077/ds-20260909-1/lt-atelier/`.
Les gates globales longues attendent l'export corrigé et le rebase sur la release après le lot alpha254.
Exécuter reste ; aucun benchmark OCR, aucune recette Windows ou corpus final #266 n'est prétendu.

## Sujet de conception séparé — #268

Après la correction prioritaire D5, préparer le gestionnaire demandé dans
[roomprofile-077-geometry-versions.md](roomprofile-077-geometry-versions.md).
Décision Romain : version propre à la géométrie de la room, rupture MANUELLE, référence image + taille + révision
pour chaque validation, tableau des versions client confirmées. L'historique reste consultable ; aucune preuve
de l'ancienne géométrie ne crédite la nouvelle. Une version client inconnue ne bloque pas Écrire.

Décision Romain : **conserver les anciens rectangles comme repères NON VALIDÉS, tout revalider**. Nouveau corpus
actif vide, aucune preuve héritée, aucun choix de confort supplémentaire à demander. Bloc de données et callbacks OPTIONNELS
jusqu'au lot backend #268 : aucun bouton fonctionnel ni état de géométrie simulé dans l'app actuelle.
Ce sujet de conception est distinct de D1–D5 et n'élargit pas implicitement le candidat app ci-dessus.
