# Room Profile — versions de géométrie et rupture manuelle (#268)

Cadrage explicite Romain du 9 septembre 2026 ; complète #265, sujet distinct des corrections D1–D5 du drop courant.
Priorité : réparer le drop courant, puis proposer ce gestionnaire dans le même rail cumulatif. Aucun backend fictif.
L'app est en alpha : pas de rétrocompatibilité ni de migration automatique de vieux schémas.

## Modèle à rendre

Une room a UNE version de géométrie active, indépendante du numéro du client poker et de la version de Tatami.
L'utilisateur crée explicitement G2 après G1 ; aucune détection de version inconnue ne déclenche une rupture.
Une géométrie couvre toutes les tailles de cette room. G1 peut être confirmée avec plusieurs versions du client.
Une même version du client peut apparaître dans l'historique de plusieurs géométries (changement de thème/layout).
Les anciennes géométries sont consultables en lecture seule ; ne pas proposer de réactivation automatique.

Afficher clairement :
- la géométrie active (G2), sa date de création et son état de calibration servi par l'app ;
- le tableau des versions client CONFIRMÉES pour cette géométrie, avec date et version Tatami ayant validé ;
- l'historique des géométries archivées et leurs compatibilités historiques, sans les présenter comme actives ;
- aucune plage de versions, aucune compatibilité supposée et aucun « compatible » déduit d'une version détectée.

Une liste vide signifie « Aucune version client confirmée ». Une version client inconnue ne bloque pas Écrire.
La confirmation est issue du geste de validation existant, après son verdict ; ne pas inventer un deuxième bouton
qui attesterait une compatibilité sans validation. Les états et nombres sont servis par l'app, jamais recalculés
à partir de l'horloge locale ou d'une comparaison de numéros de version.

## Geste « Nouvelle géométrie »

Une action explicite depuis Room Profile permet de déclarer la rupture. Avant son exécution, exposer la conséquence :
la géométrie précédente sera archivée ; ses captures et validations ne compteront plus dans la nouvelle géométrie ;
un corpus complet neuf doit être capturé et les ROI/glyphes revalidés. Annuler laisse tout inchangé.
Ne pas présenter ce geste comme une purge irrécupérable : l'historique et les preuves restent archivés séparément.

La nouvelle géométrie démarre sans compatibilité client confirmée, sans capture active et sans preuve héritée.
Les préférences indépendantes et la palette des enseignes déjà écrite gardent leur état ; cela ne valide ni la
nouvelle position des cartes ni les ROI de prélèvement. Aucun mélange de prélèvements entre G1 et G2.
Décision confirmée Romain : CONSERVER les anciens rectangles comme repères à réajuster, TOUT revalider.
Les repères sont clairement non validés ; aucun ancien glyphe, attestation ou compte de capture ne leur donne
de crédit. Ce choix fait partie du geste explicite « Nouvelle géométrie », sans nouvelle question à l’utilisateur.

Pendant l'action : pas de double envoi ; erreur verbatim récupérable, contexte inchangé en cas d'échec ; succès
uniquement sur le nouvel état renvoyé par l'app. Le DS n'incrémente pas lui-même le numéro, ne déplace aucun fichier
et n'invalide pas localement les preuves par anticipation.

## Preuves de ROI et de glyphes

Chaque validation affiche une référence consultable : image de capture, dimensions exactes du bucket, version de
la géométrie, ROI et date de validation. L'image doit montrer le cadrage qui a servi au prélèvement ; les valeurs
et rectangles sont fournis. Ne pas déduire la provenance d'un nom de fichier ou du simple dernier extracted_at.
Une preuve d'une géométrie archivée est clairement historique et ne crédite pas la géométrie active.
Une correction locale de ROI invalide les preuves concernées sans créer automatiquement une nouvelle géométrie.
Le DS rend ce verdict de fraîcheur, sans le calculer lui-même.

## Contrat de présentation attendu

Ajouter un bloc optionnel de présentation à RoomProfileData pour les versions et compatibilités, et une offre de
callback pour déclarer la nouvelle géométrie. Le détail DTO/backend sera aligné avec le modèle #268 ; ne pas changer
le schéma JSON5 depuis le DS. Le callback transporte les choix utilisateur, pas une révision inventée côté écran.
Si les données ou le callback ne sont pas servis, ne pas fabriquer de géométrie ni de bouton fonctionnel simulé.
Les liens vers les preuves d'image sont des URL/offres servies, avec les mêmes états chargement/erreur/rejeu que les
assets existants. Respecter les garde-fous du redrop sur le cadrage exact et le rejeu à URL identique.

Postures à livrer dans les fixtures, avec FR/EN :
1. G1 active validée avec deux versions client confirmées et leurs vrais tampons de démonstration.
2. G1 archivée, G2 active sans captures ni validation ; liste de compatibilité vide.
3. G2 en calibration : corpus/ROI/glyphes incomplets, preuve G1 historique exclue.
4. G2 complète, compatibilité confirmée après le geste Écrire ; une version client observée seule reste non confirmée.
5. Déclaration en cours puis refus, et annulation sans modification ; version client inconnue sans blocage indu.

Aucune implémentation de fichiers, de runtime, d'IPC, de cache ou de migrations côté DS. Le backend vérifie la
version, l'image, la taille et le cadrage au prélèvement et au commit ; les résultats tardifs périmés sont refusés.
Drop cumulatif, manifeste à la même version que le prototype, previewOnly vide, lint/typecheck/Doctor sans diagnostic.
