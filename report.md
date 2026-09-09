# Actualisation — export 2026-09-09.4 : géométrie présente, corrections requises

Issue groupée : https://gitlab.laneuville.me/rom1/tatami/-/issues/265.
Archive SHA256 `0676a7164876c62a60e77c075e101ae91cc7509146f631ca5bf06883efd72f08`.
Scratch puis import officiel : lint, TypeScript et Doctor verts ; 109 fichiers DS conformes au verrou.
Candidat local `2462d89fbc4063d2925eae45789259cc5e25603a`, base release `e2bb57f4` ; aucun push/MR.

**#268 est désormais présent dans les sources livrées**, via GeometryPanel, GeometryProofs et leurs états.
Données et callbacks restent optionnels : aucune géométrie simulée dans l'app sans le backend dédié C2.
Les itérations personnelles de Romain du .3 (sélection de taille et disposition) sont conservées.
D5 reste résolu. Le helper Doctor app a été corrigé côté Tatami ; aucune correction Design demandée pour lui.

## D6 — rendre consultables les clients confirmés de chaque géométrie archivée

GeometryArchive sert déjà la liste clients avec version client, date et version Tatami. ArchivedList ne rend
que clients.length. Rendu React réel FR/EN : les deux lignes de G1 (Unibet4.18.2 et4.19.0, dates et Tatami)
sont absentes ; seul leur nombre est visible. L'archive est nommée mais son historique demandé n'est pas consultable.

Correction attendue : rendre ces lignes historiques en lecture seule, avec leurs trois valeurs servies,
sans réactivation de l'archive ni crédit à la géométrie active. Aucun contrat backend supplémentaire nécessaire.
Oracle : G2 active, G1 archivée, deux clients servis → versions, dates et Tatami consultables pour G1.
Preuve : `ds-20260909-4/lt-tests/render-proof.json`, rendu statique réel FR/EN, CSS neutralisé, sans navigateur.

## D7 — honorer l'attente et le refus servis dès le montage

GeometryPanel initialise askedOn à null ; BreakBlock est conditionné à askedOn===geometry.id. Les fixtures
DECLARING et REFUSED montées directement masquent donc l'état en cours et la cause du refus. Le bouton
« Nouvelle géométrie… » reste visible pendant la déclaration servie. Les deux langues reproduisent ce défaut.

Correction attendue : rendre les états declaring/declareError servis même sans ouverture locale préalable ;
interdire une seconde déclaration pendant l'attente et conserver la cause verbatim et le contexte après refus.
Le succès reste une nouvelle géométrie servie, sans succès local inventé. Sans callback, aucune fausse commande.
Oracle : montage direct de chaque posture, puis attente → refus → nouvelle géométrie servie, sans perte de cause.
Même preuve FR/EN ci-dessus ; aucun comportement navigateur ou backend n'est déduit de ce rendu statique.


## D8 — reprendre une preuve réparée à nouvelle URL sans changer son identité

1. Monter GeometryProofs avec une preuve d'id stable et une image prête à l'URL A.
2. Déclencher l'événement error de cette image : le message d'échec remplace l'image.
3. Servir la même preuve, même id, status ready et URL B après réparation.

Obtenu : aucune image montée, URL B absente. Le témoin changeant seulement proof.id remonte bien l'image.
GeometryProofs conserve la clé proof.id ; AssetFrame garde failed/nat sans invalider sa tentative à nouvelle URL.
Correction attendue dans le DS : la nouvelle source doit avoir son propre chargement/erreur/dimensions et monter
l'URL B, sans demander un nouvel identifiant métier ni conserver l'échec de A. Préserver le rejeu manuel à URL
identique D1 et le cadrage large décentré D2 ; aucune régression de la source atelier, aucune autoexécution OCR.
Preuve `ds-20260909-4/lt-tests/repair-proof.json` : vrai ReactDOM + jsdom, événement error et nouvelles props ;
aucune requête réseau, aucun décodage image réel et aucun backend ne sont revendiqués par ce témoin.

## D9 — fixture nouvelle géométrie : servir réellement le corpus vide annoncé

ROOM_PROFILE_GEOMETRY_NEW_FIXTURE annonce G2 sans capture ni validation mais withGeometry étend le nominal
ROOM_PROFILE_FIXTURE et en hérite huit captures. Comptage réel identique dans les témoins FR/EN : 8.
Correction attendue des fixtures DS : la nouvelle géométrie doit servir zéro capture et zéro crédit de validation
active dans toutes les données de démonstration concernées, tout en conservant G1 comme historique distinct.
Les anciens rectangles restent des repères NON VALIDÉS ; aucun ancien compteur ne crédite G2. Vérifier les autres
postures pour éviter d'annoncer un corpus vide ou incomplet avec les données actives complètes du nominal.
C'est une incohérence de démonstration/test, pas un défaut backend ni une demande de nouveau schéma.

## Verdict et suite

**NO-GO fonctionnel pour #268 malgré l'import technique vert. Un export cumulatif corrigé est demandé.**
Conserver les quatre corrections antérieures D1–D4, D5 résolu, les itérations UI personnelles de Romain du .3,
les données/callbacks optionnels et les acquis du .4. La [demande permanente #268](roomprofile-077-geometry-versions.md)
reste applicable ; aucun nouvel arbitrage utilisateur n'est requis.

E2E et parité attendent le drop corrigé ; aucun push/MR du candidat incomplet. Aucune suppression ou baisse de gate,
aucune retouche manuelle DS, aucun benchmark OCR, aucune validation Windows/corpus266 revendiquée.

Les demandes et verdicts antérieurs restent conservés intégralement ci-dessous ; cette actualisation remplace
le statut « #268 absent » du .3. Romain peut relancer Claude Design sur ces quatre corrections dès publication.

---

# Actualisation — export 2026-09-09.3, priorité Claude Design : géométries #268

Romain précise que cet export provient de ses itérations d'interface (sélecteur de taille et disposition), et non d'une réponse annoncée à toute la vague. Archive de6e62f54450b0b916fc9b4c3f6806e4b3b5576985d777d150b9a871d84e968b.

Vérification scratch : lint et TypeScript verts ; le défaut D5 PackFilter est corrigé. Ne plus le remettre dans le travail demandé. Un warning Doctor concerne un helper de test app réservé à lt-tests ; correction côté Tatami, aucune demande Design pour ce diagnostic. L'intégration et les tests de régression complets du .3 restent en cours.

**Travail Claude Design encore demandé : [gestionnaire des versions de géométrie #268](roomprofile-077-geometry-versions.md).** Sa présentation et ses callbacks sont absents du .3. La demande durable reste entièrement applicable : géométrie active/historique, versions client confirmées, rupture manuelle, repères conservés non validés et sources image exigées au lancement. Aucun nouvel arbitrage utilisateur requis.

Préparer ce gestionnaire dans un export cumulatif conservant les itérations UI de Romain du .3 et les corrections précédentes. Les demandes et verdicts historiques ci-dessous restent la trace des anciennes versions ; cette actualisation remplace leur statut D5 prioritaire.

---
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

Complément confirmé #268 : les images de référence sont ÉGALEMENT EXIGÉES AU LANCEMENT. Leur présence,
dimensions et lien à la géométrie sont contrôlés au chargement/rechargement, sans lecture disque par frame.
Une source manquante ou invalide refuse les lectures concernées ; l'app reste accessible pour réparer le corpus.
Ajouter la posture DS « source de validation manquante au lancement », identifiant image/taille/géométrie et
parcours de remise en état. Aucun succès fictif, aucune quarantaine d'un JSON5 valide pour un PNG absent.
Les versions client inconnues restent uniquement journalisées, sans invalidation automatique ni blocage d'Écrire.
D5 reste prioritaire ; les données et callbacks #268 demeurent optionnels jusqu'au lot backend dédié.

---

## Rapports, demandes et historique précédents conservés intégralement

Le verdict courant ci-dessus supersède le statut du premier drop ; ses demandes et témoins restent la référence.

# Vague 0.7.7 — verdict du drop 2026-09-09 : corrections requises

Issue groupée : https://gitlab.laneuville.me/rom1/tatami/-/issues/265
La demande complète `roomprofile-077-atelier-et-persistance.md` reste applicable ; un seul redrop cumulatif attendu.

Archive relue : SHA256 `118df9cd784c273c1b896ed4153e242e0714076ca4a802ddaa2c6c27e98a54f5`.
Version et previewVersion `2026-09-09`, previewOnly vide. Scratch puis import officiel : lint, tsc et Doctor verts ;
106 fichiers DS conformes au verrou. Cela ne valide pas les gestes et le cadrage ci-dessous.
**Verdict : import sémantiquement vert, drop fonctionnellement rejeté. Quatre corrections DS requises.**
D2 est confirmé en navigateur ; D1, D3 et D4 sont des constats de revue statique dont les témoins container sont
en préparation. Cette distinction ne retarde pas la demande de redrop.
Base app `4179d8a32e80371ce0f70afad7c9595ad28e89a6` ; candidat LOCAL de recette
`fa9bdfbcf0f825ce87445afbc8cdce010ad5e7e6`. Aucun push/MR ni gate finale complète sur ce candidat.

## D1 — #255, rejouer la même source après une erreur ne remonte pas l'image

`PipelineSourceView.tsx` conserve `failed=true` après `onError`, puis démonte l'image. Le bouton n'appelle que
`onReload`. `PipelineTool` relaie `onOpenPipeline(sizeId, shotId, zoneId)` : même sélection, même URL et même clé,
donc aucun remontage et aucune remise à zéro de l'état de chargement.

Recette : monter le vrai container, ouvrir une source, provoquer son erreur, puis cliquer « Recharger la source »
une fois. Sans modifier le contexte, l'URL ou les props, une nouvelle image doit être montée, recevoir load et
quitter l'erreur. Le geste ne doit appeler ni exécution pipeline ni mesure corpus. Le test DOM distingue la
possibilité de recharger de la preuve réseau effective ; aucune requête navigateur n'est déduite de JSDOM.

Correction attendue à la source DS : réinitialiser explicitement l'état de la tentative et remonter l'image,
même à URL inchangée. Ne pas demander à l'app de changer artificiellement la sélection ou de lancer l'OCR.
Preuve container : en attente de consolidation lt-tests.

## D2 — #255, une ROI très large affiche une autre bande de la capture

`RoomProfile.module.css` conserve `height:104px` sous un plafond `max-width:100%`. Le ratio préféré ne protège
plus la hauteur effective lorsque la colonne contraint la largeur. Le décalage vertical utilise alors une
échelle différente de celle de l'image, dont la taille dépend de la largeur.

Cas Chromium confirmé avec le CSS exact du zip et le markup chargé de `SourceFrame` : image synthétique
1000×500, rectangle en pourcentage `{left:10,top:20,w:30,h:3}`, colonne 500px. La ROI attendue est
x100/y100/w300/h15, verte. Le nouveau cadre montre x100/y417,67/w300/h62,65, bleu : contenu 498×104,
au lieu d'une hauteur 24,9. Le mécanisme existant de `ColorSurface` donne la bande verte attendue.

Correction attendue : déduire largeur et hauteur effectives après plafonnement en conservant le ratio du crop,
comme `ColorSurface`, avec overflow strict. Tester une ROI très large ET décentrée, pas seulement un crop carré.
Preuve : navigateur Chromium 148, viewport900×500, deviceScaleFactor1, aucun serveur Vite, aucune règle CSS
modifiée. C'est une preuve de géométrie synthétique, pas un benchmark OCR ni la campagne Windows.

## D3 — #260, le paquet sélectionné reste une ancienne copie après renommage ou suppression

`PackFilter.tsx` prend `value.pack`, gardé en état par `GlyphTool`, au lieu de résoudre son identité dans la liste
`packs` actuelle. Après renommage, l'onglet change mais le formulaire peut reproposer l'ancien libellé. Après
suppression du paquet sélectionné, ses commandes restent montées tant qu'un autre paquet existe.

Correction attendue : conserver la paire famille/id du choix, relire l'objet courant et gérer sa disparition.
Recette : sélectionner « fin », renommer « régulier », rouvrir le formulaire → « régulier » ; supprimer ce
paquet alors qu'un autre subsiste → plus de commande agissant sur le paquet supprimé. Aucun retour à l'ancien nom.
Preuve container : en attente de consolidation lt-tests.

## D4 — #260, renommer/supprimer perd la famille et peut écrire dans l'autre paquet homonyme

Le filtre distingue désormais famille/id, mais `PackTools` appelle encore rename(id,label) et remove(id).
L'app cherche alors le premier paquet avec cet id. Ce cas est ordinaire : la création génère `pack-1` dans
CHAQUE famille. Sélectionner rangs/pack-1 peut donc modifier montants/pack-1.

Correction attendue du contrat DE PRÉSENTATION : transmettre la famille dans `onRenameGlyphPack` et
`onDeleteGlyphPack`, comme le fait la création. L'app ciblera alors la paire famille/id. Aucun nouvel IPC ni
changement de profil nécessaire. Le choix visuel seul ne suffit pas : vérifier la famille réellement écrite.
Recette : montants/pack-1 puis rangs/pack-1, sélectionner le second ; rename ET delete ne doivent modifier que
la famille rangs, avec conservation exacte du paquet montants.
Preuve container : en attente de consolidation lt-tests.

## #259 — correction d'intégration app, conserver le rendu DS écrit/brouillon

L'app donnait priorité à la médiane des nouveaux samples dans `SuitSwatch.color`, alors que le DS interprète ce
champ comme la couleur écrite en présence de la date suits. Le candidat corrige cette priorité : couleur
persistée dans color quand disponible, nouveaux relevés dans samples. La fixture DS withDraft suivait déjà ce
contrat. Ne pas fabriquer des échantillons ni une écriture pour faire passer la recette.

Témoin attendu : diamant #3980CA écrit à T, un nouveau sample #3C90E0 ; ancienne couleur ET date T encore lisibles,
brouillon distinct, aucune écriture implicite. Résultat dédié en attente de consolidation lt-tests.

## Acquis statiques à conserver et preuves rendues encore attendues

La lecture statique est favorable sur mantisses/fixtures (#263), synthèse TOUS par famille/unité incluant les
paquets vides (#260), palette à froid et source indépendante de l'exécution. Les preuves rendues sont consolidées
séparément. Exécuter reste ; aucun coût OCR mesuré n'autorise l'autoexécution. Conserver FR/EN, files servies vides,
masquage hors contexte et toutes les corrections 0.7.6. Pas de suppression, de retry ni de gate assouplie.

---

## Demandes et historique précédents conservés intégralement

Le verdict ci-dessus remplace uniquement le statut du drop 2026-09-09 ; les critères et acquis ci-dessous restent applicables.

# Vague 0.7.7 — atelier et état persisté de la station 5

GO Romain du 9 septembre 2026. Écrivain unique : lt-atelier.
Issue groupée : https://gitlab.laneuville.me/rom1/tatami/-/issues/265
Demande complète : [roomprofile-077-atelier-et-persistance.md](roomprofile-077-atelier-et-persistance.md).

**Nouveau drop cumulatif demandé**, à partir de `2026-09-08.1` intégré en 0.7.6 :

- #263 : mantisse 54 + decimals 1 → 5.4 BB ; corriger formatter ET fixtures DS, sans compensation app.
- #257 / #262 : sélecteur contrôlé par le paquet servi, style stable propriété de ROI ; mots et contrat à aligner.
- #260 : TOUS présente chaque paquet nommé, même vide, sa complétude et ses manquants ; détails dans ses onglets.
- #259 : palette persistée avec date, distinguée des prélèvements de session ; aucune mesure inventée.
- #255 : source « avant » visible dès sélection, indépendante du résultat ; erreurs et péremption explicites.
  Exécuter reste pour ce drop tant que le coût mono-ROI réel n'a pas justifié sa suppression.
- Interfaces #256 / #258 : honorer files servies vides et couverture périmée ; aucune reconstitution du catalogue.

Le contrat de présentation précis et les recettes sont dans la demande complète. Pas de nouvelle API IPC demandée
au DS. DTO Rust coordonnés séparément. Typecheck, lint, doctor zéro diagnostic, e2e complète et parité après import.
Les fichiers permanents et toutes les corrections des vagues précédentes restent à conserver.

## Rapport précédent conservé intégralement — vague 0.7.6 acceptée

Le verdict ci-dessous est historique et n'annule pas la nouvelle demande 0.7.7 ci-dessus.

# Vague 0.7.6 — station 3 froide, atelier explicite et refus sizing

Responsable et écrivain unique : lt-engine. GO de Romain du 8 septembre 2026.
Issue de vague : https://gitlab.laneuville.me/rom1/tatami/-/issues/249 (Ref #244 #247 #251).

La vague 0.7.5 est importée en 0.7.4 : bande compacte et seuil de couverture conservés.
Le défaut restant en station 3 est le verrouillage des tuiles à froid, indépendamment de leur géométrie.
Les captures existent sur disque : choisir un bucket à froid appelle onSelectSize, sans resize.
À chaud, le chemin onTourSize et sa confirmation restent requis.

L'atelier doit offrir sélection de capture ET ROI numérique, avec identité affichée.
Une exécution demeure au clic. Une sélection/configuration changée périme les témoins ; les réponses tardives
sont rejetées par l'app. L'ouverture depuis GLYPHES conserve les trois arguments taille/capture/ROI.
Le contrat de présentation et les recettes précis sont dans roomprofile-076-navigation-et-atelier.md.

Les refus de sauvegarde sizing déjà fournis dans data.rejection doivent être visibles et accessibles.
Le contrat existant, la preuve rouge et la recette sont dans hotkeys-076-refus-sizing.md.

Un seul drop cumulatif pour ces trois issues ; aucun changement de moteur ni de contrat IPC demandé au DS.
Typecheck, lint, doctor sans diagnostic, suite e2e complète et parité restent requis à l'import.


## Verdict courant — drop corrigé accepté et intégré

Le redrop cumulatif `2026-09-08.1` est intégré par la MR !236, HEAD
`8cb86d1c5ab00fc8827033289956004ed6e9c363`, base assemblée `889761aa4fac0ff3d829d05057c092ba76c58fa4`.
MR : https://gitlab.laneuville.me/rom1/tatami/-/merge_requests/236
CI 1740 SUCCESS, traces contrôlées sans flaky ni retry par le coordinateur ; merge release
`4ea0309c0364a75e6d3d1ec843615c514e01f459`. Aucun nouveau tour DS requis.
SHA256 de la copie validée puis importée :
`0fe3ed8226bac3f8941ae9fd0913587f79d9f4a2262e8407c23eb60acc687737`.
Manifest et preview identiques, previewOnly vide, 104 fichiers conformes au verrou après import officiel.

**Aucune nouvelle correction Claude Design demandée.** D1–D4 sont corrigés ; les cinq contrôles portables
ci-dessous passent (5/5, 1,24 s). D5 demeure conforme et non bloquant : aucune suppression d'un succès précédent
du même contexte n'est imposée. L'échec de chargement d'image est maintenant visible et sa récupération testée.

Câblage app effectué et recettes sur vrais composants/store/FixtureDriver : consultation froide sans resize ni
capture, changement chaud effectif, conservation du bucket à la fermeture, rejet des réponses dépassées ; atelier
capture/ROI explicites, aucun run à la sélection, loading/error/stale, sélection perdue, portée de glyphe ; sizing
avec rollback, refus visible et retry persisté. Les ROI numériques restent consultables sur une capture négative.
Le contrôle #251/5352 est complet. Les 29 tests dédiés container comprennent 7 froid/chaud, 12 atelier, 9 sizing
(dont 5 déjà présents dans !231) et 1 abonnement StrictMode. Le hook pipeline compte 31 cas, inclus dans le total.

Gates finales après rebase sur les neuf lots assemblés et !235 : typecheck, lint, doctor zéro diagnostic, knip, check:guards et
check:ds-sync verts ; Vitest **704 tests / 52 fichiers / 75,10 s** ; E2E **75 passed / 31,8 s** ; parité pixel
**28 passed / 44,8 s**. E2E/parité sous verrou partagé, `CI=1`, `--retries=0` explicite. Aucun flaky accepté.

La première panne E2E est expliquée et conservée : l'oracle attendait Committer déjà actif au repos avant le départ
asynchrone de métrologie. Le test attend maintenant la phase terminale puis conserve les assertions exactes.
Patch isolé et preuve causale rouge/verte livrés par !231 ; parent exclu du rebase DS.
Un autre rouge/vert app démontre qu'un ancien callback d'abonnement nettoyé doit être ignoré.

Rapport, gestes, limites et deux captures : `recon/ds-076/recette.md` dans le HEAD publié indiqué.
Logs finaux : `/tmp/tatami-ds-076/lt-engine/integration/` ; preuves calibration :
`/tmp/tatami-ds-076/lt-engine/calibration-gate-fix/`.
Limites : fixtures navigateur, pas de preuve IPC Rust→DTO ou Windows réel. Le rebase garde les 28 blobs du delta
initial identiques ; cinq tests sizing hérités une seule fois, quatre supplémentaires, helper dédupliqué.
Revue indépendante favorable avant fusion par le coordinateur ; aucun autre lot mêlé au DS.

---

## Historique du premier drop — défauts résolus par 2026-09-08.1

Le verdict rouge ci-dessous est conservé avec ses preuves et contrats pour traçabilité ; il est supersédé par
le verdict courant ci-dessus. La demande de relance qu'il contient concernait uniquement le premier drop.


# Verdict du drop reçu — correction requise avant acceptation

Import scratch puis import officiel : lint, tsc et doctor verts, 104 fichiers DS verrouillés.
Recette consolidée : cinq cas examinés, quatre défauts bloquants D1–D4 et un cas D5 conforme après correction du test.
Romain doit relancer Claude Design pour UN drop cumulatif corrigé, conservant toute la vague #244/#247/#251.
Pas de correction demandée pour la seule conservation du succès précédent en cas d’erreur du même contexte.

# Recette du drop DS 0.7.6 — corrections atelier requises

Ref #249 #247 ; conserver les demandes station 3 (#244) et refus sizing (#251) de la vague cumulative.
Le report de vague existant reste applicable. Ce complément ne remplace aucun de ses critères.

Archive réellement relue : manifest 2026-09-08,
SHA256 `e637268b1439ee4722174766a27ace92762fd212b1a9430a5a5b7f74adaff1f3`.
Les lignes ci-dessous désignent les fichiers originaux du zip sous `tatami-ds/ui/screens/`, avant lint automatique.
NOTES.md historique n'est pas la source du verdict.

## Preuve exécutable

Test de rendu des composants réels livrés, sans mock de composant DS. Les callbacks sont des espions.
Copier le test complet joint ci-dessous dans `apps/web/src/app/screens/DsDropReview.test.tsx` après import du drop.

```bash
pnpm vitest run apps/web/src/app/screens/DsDropReview.test.tsx
```

Première passe : 5 rouges en 1,66 s, dont une assertion F5 trop stricte, retirée après relecture du manifest.
Recette corrigée exécutée : **4 échoués (D1–D4), 1 passé (D5)**, durée Vitest **1,31 s**.
Log local : `/tmp/tatami-ds-076/lt-engine/review-ds-final.log`. Aucun correctif UI appliqué.

## D1 — sans chaîne, l'atelier ne rend aucun état vide

`PipelineTool.tsx:94–99` construit une liste de cartes depuis `numberSteps`, puis retourne `null` si elle est vide.
Le panneau d'identité et ses messages se trouvent après ce retour.

- Entrée : aucune ROI numérique légale (`glyphZoneIds: []`), aucune chaîne (`numberSteps: []`), aucun pipeline.
- Attendu : « Aucune ROI numérique calibrée pour cette taille. », identité de taille/capture et exécution désactivée.
- Obtenu : conteneur de rendu vide ; le message est absent.
- Correction attendue : toujours rendre les sélections et états vides ; seules les cartes nécessitent une chaîne.
  Ne pas fabriquer une chaîne de traitement pour rendre le message.

La fixture DS NO_ROI garde onze cartes fictives, ce qui ne couvre pas le cas réel où l'app n'a aucune chaîne.

## D2 — un ancien choix de glyphe est envoyé pour une nouvelle capture

`PipelineTool.tsx:76,93,104` conserve `wanted` entre rendus et l'envoie à `onRunPipeline`.
`RoomProfileWizard.tsx:169` monte ce composant sans clé de contexte.

- Geste : choisir « Sur un glyphe » sur A, choisir B, puis Exécuter.
- Attendu : annuler l'ancien index ; revenir à la portée ROI ou demander un nouveau glyphe avant exécution.
- Obtenu : callback `(s960, review-b, pot, { kind: "glyph", index: 0 })`.
- Le même état local survit à un changement de ROI ou de taille ; l'index peut viser un autre glyphe ou sortir
  de la nouvelle découpe. L'app ne peut pas corriger le choix local affiché dans le DS.
- Correction attendue : invalider le choix de glyphe avec son contexte ; ne pas déclencher de lecture automatique.
  La preuve jointe attend un retour ROI ; une sélection explicite obligatoire serait aussi conforme au contrat.

## D3 — sélection supprimée : le select natif montre une autre ROI

`PipelineSelect.tsx:106–111,116–121` passe `value=""` lorsque le choix est perdu, mais les options n'ont aucune
entrée vide. `Select.tsx` rend ces options directement dans le select HTML.

- Entrée : `pipelineZoneId: "removed"`, une seule ROI légale restante `pot`.
- Attendu : sélection visiblement invalide, sans remplacement ; possibilité de choisir explicitement `pot`.
- Obtenu : le select natif a la valeur `pot`, alors que l'identité signale une ROI perdue et Exécuter reste désactivé.
- Avec une seule option, le contrôle paraît déjà choisir cette ROI ; aucun changement de valeur ne peut matérialiser
  sa sélection. La même construction concerne le choix de capture supprimée.
- Correction attendue : option neutre explicite pour un choix invalide, afin que le choix réel déclenche le callback.

## D4 — statut stale sans ancien objet : le DS dit « Pas encore exécuté »

`PipelineTool.tsx:90` conditionne `masked` à la présence de `pipeline`.
`PipelineOverview.tsx:136–138` ne traite pas directement le statut `stale` et affiche le texte jamais exécuté
si l'app a déjà retiré les témoins périmés.

- Entrée : choix valide, `pipelineStatus: "stale"`, `pipeline: undefined`.
- Attendu : « Résultat périmé — réexécuter ».
- Obtenu : « Pas encore exécuté ».
- Correction attendue : distinguer le statut historique de l'existence des images conservées.

## D5 — erreur avec ancien succès du même contexte : conforme, non bloquant

Le manifest autorise explicitement de garder un ancien succès du même contexte pendant le rendu d'une erreur.
Le premier test exigeait la suppression de l'image : cette assertion était trop forte et a été remplacée.
L'invariant utilisateur retenu est la présence visible de la cause, de son contexte et d'une commande Réessayer.
Le DS remplit cet invariant et ne déclare pas textuellement que la lecture courante a réussi.

L'intégration app retire de son côté l'ancien résultat à la nouvelle exécution. Aucune correction DS n'est requise
sur la seule base du maintien de l'image. Ce point ne doit pas être compté parmi les blocages D1–D4.

## Autres points et limites

- BucketRail relu : à froid `onSelectSize`, à chaud `onTourSize`, tombstones désarmées en station 3.
  TourStation désarme la capture à froid ; la recette du vrai container et du driver reste distincte.
- Refus #251 relus : message verbatim par ligne/section, emplacement de ligne supprimée, commandes globales,
  `<output>` et absence de timer local. Recette du vrai HotkeysContainer + FixtureDriver : 9/9 tests verts (5,53 s), dont rollback,
  refus visible, retry persisté et disparition du refus ; restauration lecture/écriture, instant, défaut, ajout, cross-owner.
- `PipelineFrame.tsx` remplace encore une image ayant échoué par son simple libellé AVANT/APRÈS ; pas de cause
  de chargement visible ni annonce de l'échec. Point de recette supplémentaire, non compris dans les 5 tests.
- Aucun verdict de gates globales ou de comportement Windows n'est revendiqué par cette revue.

## Test portable complet

```tsx
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PipelineTool } from "../../ui/screens/PipelineTool";
import { MEASURE_PIPELINE, ROOM_PROFILE_PIPELINE_FIXTURE } from "../../ui/screens/RoomProfile.fixtures";
import { STRINGS } from "../../ui/screens/i18n";

const data = { ...ROOM_PROFILE_PIPELINE_FIXTURE, locale: "fr" as const };
const t = STRINGS.fr.roomProfileV3;
const shot = { id: "review-a", label: "Capture A", at: "now", seq: 1, primary: true };
const base = { ...MEASURE_PIPELINE, shots: [shot], activeShotId: shot.id, glyphZoneIds: ["pot"], pipelineZoneId: "pot" };

describe("drop DS 0.7.6 : contre-exemples indépendants", () => {
    it("rend l'état sans ROI quand l'app ne sert aucune chaîne", () => {
        render(<PipelineTool data={data} on={{}} measure={{ ...base, glyphZoneIds: [], numberSteps: [], pipeline: undefined }} />);
        expect(screen.getByText(t.pipelineNoZone)).toBeVisible();
        expect(screen.getByRole("button", { name: t.pipelineRun })).toBeDisabled();
    });

    it("invalide le choix de glyphe quand la capture change", () => {
        const onRunPipeline = vi.fn();
        const on = { onRunPipeline };
        const view = render(<PipelineTool data={data} on={on} measure={base} />);

        fireEvent.click(screen.getByRole("radio", { name: t.pipelineScopeGlyph }));
        view.rerender(<PipelineTool data={data} on={on} measure={{ ...base,
            shots: [{ ...shot, id: "review-b", label: "Capture B" }], activeShotId: "review-b", pipeline: undefined }} />);
        fireEvent.click(screen.getByRole("button", { name: t.pipelineRun }));
        expect(onRunPipeline).toHaveBeenLastCalledWith(data.activeSizeId, "review-b", "pot", { kind: "roi" });
    });

    it("ne sélectionne pas visuellement une ROI de remplacement après suppression", () => {
        render(<PipelineTool data={data} on={{ onOpenPipeline: vi.fn() }} measure={{ ...base, pipelineZoneId: "removed" }} />);
        expect(screen.getByRole("combobox", { name: t.zoneField })).toHaveValue("");
    });

    it("rend le statut périmé même quand l'app a retiré les anciens témoins", () => {
        render(<PipelineTool data={data} on={{}} measure={{ ...base, pipeline: undefined, pipelineStatus: "stale" }} />);
        expect(screen.getByText(t.pipelineOffContext)).toBeVisible();
    });

    it("rend cause, contexte et rejeu de l'erreur avec l'ancien succès du même contexte", () => {
        render(<PipelineTool data={data} on={{}} measure={{ ...base,
            pipelineStatus: "error", pipelineError: "lecture refusée",
            pipelineContext: { sizeId: data.activeSizeId, shotId: shot.id, zoneId: "pot" } }} />);
        expect(screen.getByText("lecture refusée")).toBeVisible();
        expect(screen.getByText(t.pipelineErrorHead(t.pipelineContextOf("960 × 600", shot.id, "pot")))).toBeVisible();
        expect(screen.getByRole("button", { name: t.pipelineRetry })).toBeEnabled();
    });
});
```
