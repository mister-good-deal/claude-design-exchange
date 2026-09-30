# Room Profile — corrections de la campagne Windows du 30 septembre

Demande publiée sur l'[exchange](https://github.com/mister-good-deal/claude-design-exchange/blob/main/roomprofile-082-campagne-windows.md)
sur accord de Romain le 30 septembre. Source : campagne `windows/validation-0.8.1`,
[rapport du 30 septembre](https://gitlab.laneuville.me/rom1/tatami/-/blob/windows/validation-0.8.1/recon/win-validation-2026-09-30/REPORT.md).

## Retirer « Références de validation » — #522

[Issue #522](https://gitlab.laneuville.me/rom1/tatami/-/issues/522) : le repli du panneau a supprimé le gel, mais
Romain demande maintenant sa suppression complète. Il contient encore 954 ou 642 références selon la session.

Dans `RoomProfile.tsx`, retirer l'import et le rendu de `GeometryProofs`, puis le composant devenu inutilisé.
Aucun bouton de repli, compteur ou consultation des images de référence ne remplace le panneau.
Les refus de sources restent affichés dans le panneau Géométrie existant, avec leur cause et le geste de réparation
servis par le moteur. Ne pas supprimer les messages de refus nécessaires pour réparer une calibration.

Recette : le panneau est absent aux stations 4, 5 et 6 ; aucune image de preuve ne se charge à l'ouverture ni au clic
sur une station. Les refus de sources restent lisibles à leur emplacement existant.

## Valider avec la version du client — #547

[Issue #547](https://gitlab.laneuville.me/rom1/tatami/-/issues/547) : la validation reste proposée après validation
de l'état courant et ne demande pas de version lorsque Windows ne sait pas la lire.

Dans `GeometryPanel.tsx`, garder le bouton existant. Si la version observée manque, afficher une saisie
« Version du client ». Transmettre la saisie par `onValidateGeometry(clientVersion?: string)` ; l'app la transmet
au moteur, qui refuse une version vide et sert la version confirmée avec sa provenance `product_version` ou `manual`.
Une version observée par Windows reste prioritaire sur une saisie. Le design affiche la réponse servie.
Ajouter à `GeometryClient` la provenance servie `source: "product_version" | "manual"`, affichée « lue » ou
« saisie ». La version observée vient de `geometry.observed`, la validation confirmée de `geometry.clients`.

Sans version observée ni saisie non vide, le bouton est désactivé. Pendant la validation, le bouton est désactivé.
Lorsque l'app n'offre pas `onValidateGeometry`, ne pas proposer une nouvelle validation : l'app décide si la
géométrie courante est déjà validée, le design ne compare ni ne recalcule les empreintes.

Recette : version observée → aucun champ et provenance « lue » ; version absente → saisie obligatoire et provenance
« saisie » ; refus du moteur → phrase visible et aucune validation affichée ; état courant déjà validé → aucun
geste actif ; géométrie modifiée → geste offert à nouveau par l'app.

## Périmètre du drop

Adapter uniquement les types, chaînes et fixtures nécessaires dans `RoomProfile.fixtures.ts` et les composants
concernés. Fournir des postures pour les deux sources de version, le refus, l'écriture en cours et l'état déjà validé.
Respecter le contrat des stations P1/P9 : l'écran affiche ce que le moteur sert, l'app décide des gestes offerts.
Pas de refonte, d'autre écran ou de fonctionnalité supplémentaire. Export cumulatif, lint/typecheck/doctor sans
diagnostic, puis import et parité pixel suivant le
[rail Claude Design](https://gitlab.laneuville.me/rom1/tatami/-/blob/master/doc/agents/claude-design.md).
