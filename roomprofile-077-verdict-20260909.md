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
