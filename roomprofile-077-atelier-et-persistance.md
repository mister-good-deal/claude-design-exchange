# Demandes Claude Design — 0.7.7

Vague groupée, GO Romain du 9 septembre 2026. Écrivain exchange : lt-atelier.
Base DS : drop cumulatif `2026-09-08.1`, déjà intégré en 0.7.6. Un seul nouveau drop cumulatif attendu.
Sources terrain : campagne Windows `42c1488acba19647a2e35b60772ececf9c634ce3`, issues et décisions ci-dessous.
La campagne a renouvelé le corpus ; elle ne constitue aucun benchmark ni verdict d'exactitude moteur.

## Valeurs décimales — #263

[Issue #263](https://gitlab.laneuville.me/rom1/tatami/-/issues/263).
`runOfDto` transmet déjà le contrat Rust sans transformation : `value` est la mantisse entière,
`decimals` le nombre de décimales. Dans `RoomProfile.fixtures.ts`, `formatRead` doit utiliser
`(value / 10 ** decimals).toFixed(decimals)` ; conserver les conventions d'unité existantes.
`value: null` signifie absence de lecture ; `value: 0` est un zéro valide. Aucune division compensatoire dans l'app.

Corriger aussi TOUTES les fixtures et variantes qui servent une valeur déjà divisée, ainsi que la description
anglaise du contrat. Exemple : `{value: 1.5, decimals: 1}` devient `{value: 15, decimals: 1}`.
Le bloc technique « résultat » peut conserver la représentation mantisse + décimales ; la valeur joueur est décimale.

Recette rendue, avec les vrais champs du DTO :

| value | decimals | unit | Valeur affichée |
|---|---|---|---|
| 54 | 1 | bb | 5.4 BB |
| 54 | 0 | bb | 54 BB |
| 54 | 2 | bb | 0.54 BB |
| 0 | 2 | bb | 0.00 BB |
| 540 | 2 | cur | 5.40, convention de devise existante conservée |
| 54 | 1 | null | 5.4 |
| null | 1 | bb | absence de lecture, jamais 0.0 BB |

## Paquet affiché et propriété de ROI — #257 / #262

[Issue #257](https://gitlab.laneuville.me/rom1/tatami/-/issues/257),
[décision #262](https://gitlab.laneuville.me/rom1/tatami/-/issues/262).
L'écriture et les compteurs par paquet fonctionnent déjà ; seul le champ affiche « Sans paquet » à tort.
L'app doit alimenter `GlyphTruth.packId` depuis le profil servi, y compris avant toute saisie de vérité.
Le sélecteur reste contrôlé par cette donnée ; aucun état initial local ne doit la remplacer.

Décision explicite : le style est stable au runtime, propriété de la ROI. Adapter mots et contrat de présentation
qui disent actuellement « une fois par ROI et par capture ». Changer de capture ne change pas le paquet de la ROI.
L'IPC et sa migration appartiennent à lt-profile ; aucune nouvelle persistance dans le DS.
Le callback actuel peut garder son argument capture pour compatibilité pendant l'intégration ; il ne définit plus
la portée du style. Ne pas créer un mécanisme « dernier choix mémorisé ».

Recette : pot=fin, hero_stack=gras ; chaque sélecteur montre sa valeur, après choix, changement de ROI, changement
de capture et F5. « Sans paquet » signifie uniquement absence d'affectation. Annuler explicitement reste possible.

## TOUS : synthèse des paquets nommés — #260

[Issue #260](https://gitlab.laneuville.me/rom1/tatami/-/issues/260).
L'onglet TOUS doit rendre une ligne/carte par paquet de `MeasureState.packs`, même vide, dans l'ordre servi.
Pour chaque paquet : nom, famille, nombre de codes couverts/requis, état complet/incomplet/vide, codes manquants.
Le dénominateur correspond à SA famille et à l'unité requise par la room : un paquet de montants ne manque pas
les treize rangs de cartes. Les comptes sont issus de `GlyphCode.packCounts`, pas du total plat `count`.
Le détail par code demeure dans l'onglet du paquet ; TOUS est la synthèse de chaque style, aucune somme globale.
Les templates sans paquet ne doivent pas créditer un paquet nommé. Les noms utilisateur se rendent verbatim.

Recette : trois paquets « fin » complet, « gras » incomplet, « réserve » vide ; leurs trois états se voient sans
changer d'onglet. Deux familles peuvent porter le même id local : ne pas mélanger leurs compteurs ni leurs sélections.
Sans paquet nommé, conserver une vue utile de couverture générale ; aucune ligne nommée fictive.

## Palette écrite et brouillon — #259

[Issue #259](https://gitlab.laneuville.me/rom1/tatami/-/issues/259).
Le profil persiste quatre couleurs et `measured_at`, mais le rail initialise seulement les prélèvements de session.
L'app servira la palette persistée et sa date ; le DS doit rendre « écrite à … · 4 cibles », comme les barres.
Le contrat existant `MeasureState.writes` sait déjà porter cette provenance (`unitId: "suits"`).
La couleur persistée doit rester visible sans inventer trois échantillons récemment mesurés par enseigne.
Distinguer visuellement, si nécessaire, palette écrite et nouveaux prélèvements incomplets.

Recette : ouverture puis F5 avec les quatre couleurs et date du profil → palette écrite avec la même date ;
aucun « il manque tout ». Sans mesure persistée → reste à prélever. Un prélèvement nouveau incomplet ne doit pas
faire disparaître l'état écrit ni déclencher l'enregistrement d'une palette mêlant anciennes et nouvelles mesures.

## Atelier : image avant indépendante — #255

[Issue #255](https://gitlab.laneuville.me/rom1/tatami/-/issues/255).
La sélection taille/capture/ROI acquise en 0.7.6 reste conservée. Dès sélection, charger l'image SOURCE de cette ROI
sans lancer les onze étapes et sans segmenter les seize autres ROI. Le résultat après vient d'une passe mono-ROI.
Le DS doit pouvoir rendre cette source avant tout `PipelineRun`, avec chargement, erreur lisible et rejeu.
Ne pas fabriquer un faux résultat ni une chaîne exécutée pour remplir « avant ».

Extension de présentation proposée : champ optionnel `MeasureState.pipelineSource`, contenant `context`
(`sizeId`, `shotId`, `zoneId`), `status: "loading" | "ready" | "error"`, `url?`, `error?`.
L'app possède le chargement et les générations ; le DS ne rend que la source du contexte sélectionné.
`pipelineSource` est indépendant de `pipelineStatus` et de l'étape actuellement inspectée : la source reste clairement
nommée, les témoins avant/après d'une étape traitée ne s'inventent pas avant son exécution.

Rester sur Exécuter pour ce premier drop : sa suppression et l'autoexécution dépendent d'une mesure RÉELLE du coût
mono-ROI côté Rust. Aucune mesure disponible à ce stade ; aucune simulation frontend ne vaut benchmark.
Préserver la possibilité de rejouer après erreur. Changer capture/ROI/taille/géométrie masque immédiatement les
anciens résultats ; les réponses tardives ne doivent jamais repeupler l'autre contexte.
Changer un réglage garde la source valable mais périme le résultat après. Tester aussi une source introuvable.

Le bouton « Mesurer sur les captures étiquetées » doit garder son sens corpus. L'app appelle déjà `numberMeasure`
sans identifiant de capture ; le comportement backend est en cours d'audit. Ne pas maquiller une mesure du shot
courant en mesure corpus et ne pas créer une promesse de performance.

## Absence déclarée et fraîcheur — interfaces #256 / #258

[Issue #256](https://gitlab.laneuville.me/rom1/tatami/-/issues/256),
[issue #258](https://gitlab.laneuville.me/rom1/tatami/-/issues/258).
Le backend et l'app filtreront zones absentes et ROI enfants par capture pour les files pipette/glyphes/mesure.
Ne pas reconstituer une file depuis toutes les zones du catalogue quand la liste servie est vide.
Les données périmées ne doivent pas être rendues complètes ; le contrat de fraîcheur est coordonné avec lt-profile.
Aucun calcul de fraîcheur à partir de l'heure locale du DS. Ajouter une posture vide et une posture périmée si le
contrat servi les expose ; ne pas inventer de champs IPC.

## Drop et vérification

Conserver toutes les demandes permanentes de l'exchange et les acquis 0.7.6, notamment navigation froide,
conservation des sélections, masquage hors contexte, refus de sizing et erreurs d'image récupérables.
Un seul drop cumulatif avec manifeste, version du prototype identique, `previewOnly` vide et fixtures cohérentes DTO.
FR/EN complets. Lint, typecheck, react-doctor zéro diagnostic ; aucune suppression ni assouplissement de règle.
Import par `pnpm import-ds` uniquement ; puis tests app, suite e2e complète sans retries et parité pixel.
La paire Rust → DTO → rendu doit couvrir les montants décimaux, pas seulement des fixtures DS auto-cohérentes.
