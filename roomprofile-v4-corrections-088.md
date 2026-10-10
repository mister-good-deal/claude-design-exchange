# Demande Claude Design — Room Profile V4 : corrections après le câblage des stations 3 et 5

Rédigée par l'orchestrateur le 10/10, après le câblage de `2026-10-09.3` (stations 3 et 5, bandeau). Quatre demandes
indépendantes, petites ; un seul drop `2026-10-10` qui ne change que ça. Tout le reste de `2026-10-09.3` est porté
inchangé.

## 1. Station 3 pendant un déroulé (#672, #681)

### 1.1 Verrouiller la station pendant `locked` (`RoomSettings.tsx`, `SweepPanel.tsx`, assistant)

Pendant une rafale ou un balayage, le shell refuse tout geste sauf Stop (`un déroulé est en cours : arrêtez-le
d'abord`), et l'unité comme le délai sont désormais refusés sous leur champ. Mais l'écran offre encore, pendant
`ctx.locked` : le sélecteur d'unité, le sélecteur d'arrêts du balayage (12/24/40) et la navigation de l'assistant
(›, onglets des stations, Interrompre). Chaque clic y part pour un refus garanti, ou quitte la station en plein
déroulé.

**Demande** : rendre ces contrôles inertes (`disabled`) tant que `locked`, comme le sont déjà les boutons de prise.
Stop reste le seul geste.

### 1.2 Un délai hors bornes doit se dire (`DelayField.tsx`)

Une saisie hors `[CAPTURE_DELAY_MIN, CAPTURE_DELAY_MAX]` ou illisible remet la valeur servie sans un mot : le joueur
croit avoir écrit 9000 ms et voit 500 revenir. Le shell sert pourtant son refus sous le champ (portée `captureDelay`)
quand une valeur lui parvient.

**Demande** : dire le refus localement, bornes nommées : -5, 1,5 ou une saisie illisible n'atteignent pas la commande,
la ligne de refus dit `[CAPTURE_DELAY_MIN, CAPTURE_DELAY_MAX]` sous le champ. Une valeur dans les bornes part au
shell ; s'il la refuse (portée `captureDelay`), le champ revient à la valeur servie : `DelayField`, non contrôlé,
garde aujourd'hui la saisie refusée affichée alors que la vue sert l'ancienne.

### 1.3 La métrologie du spine pendant un déroulé

Le spine lance encore la métrologie pendant une rafale ou un balayage sur la même fenêtre. Le shell la refusera
(issue ouverte côté `metrology.rs`) ; **demande** : rendre le lancement inerte pendant `locked`, comme en section 1.

### 1.4 Maj+F9 vise la dernière prise (`CapturesHead.tsx`, `CaptureBar.tsx`, `i18n.ts`)

F9 et Maj+F9 sont des raccourcis globaux du shell, actifs tant que la station 3 est ouverte (#681). Le shell ne sait
pas quelle prise l'écran regarde : Maj+F9 lance la seconde rafale sur la **dernière** prise. L'en-tête dit
« Maj+F9 seconde rafale » et le bouton de la barre « Seconde rafale sur P1 · Maj+F9 », ce qui laisse croire que la
touche suit la prise regardée.

**Demande** : l'en-tête dit « seconde rafale (dernière prise) » (`keyAgain`) ; le bouton de la barre garde son geste
sur la prise regardée sans afficher Maj+F9.

## 2. Le spine (#679)

### 2.1 La préparation n'est servie que quand elle l'est

Le spine montre aujourd'hui une préparation que l'app ne sert pas encore en V4 : l'app passe une préparation vide, et
l'écran en tire un badge « 0 bloquant » d'alerte et 0 %. Ce sont des valeurs inventées (P1). **Demandé** : `readiness`
optionnel ; absent, le spine n'affiche ni badge, ni jauge, ni pourcentage, ni file. Fixture : spine sans préparation.

### 2.2 Le motif de titre en lecture seule au spine

Le champ « Titre de la fenêtre de table — regex » du spine est contrôlé et appelle `onSetTitleRegex` à chaque frappe.
La station 1 reste la seule à écrire les règles de fenêtre (une écriture depuis le spine contredirait son brouillon,
et la regex stricte refuse presque toute frappe intermédiaire). **Demandé** : au spine, le motif servi en lecture seule
(avec un renvoi « se règle en station 1 ») ; `onSetTitleRegex` retiré du contrat.

### 2.3 Une cause de refus de la station des lois

`LAW_REFUSAL_CAUSES` (`LawsStation.fixtures.ts`) ne connaît pas `default_law_without_anchor`, que l'app sert : la loi
par défaut porte sa propre ancre. À ajouter, avec sa posture refusée.

## 3. La notice de table dit un texte servi qui n'est pas vocal (#670)

### Ce que l'app sert

Une fenêtre d'overlay lit l'atelier de sa taille. Quand le shell refuse cette lecture (profil illisible, room
inconnue), la fenêtre n'a rien à placer : elle dit le refus, verbatim, dans la notice de table (`TableNotice`), comme
elle le fait déjà sans atelier hors du domaine de la loi. Le texte est celui du shell, sans traduction.

### Ce qui manque au DS

`TableNoticeContent` n'a que deux genres : `allIn` (les mots du DS) et `voice` (« the voice error as served,
verbatim »). Le refus d'atelier n'est pas une erreur vocale ; l'app emprunte `voice` en attendant, ce qui pose
`data-kind="voice"` sur une notice qui ne l'est pas.

### Demandé

Un genre au texte servi tel quel, sans lien avec la voix : `{ kind: "served"; text: string }`, même icône d'alerte,
même boîte, même absence de minuterie et de hit-test. Si le DS préfère renommer `voice` en `served` pour les deux
usages, l'app suit : elle ne lit le genre que pour le poser.

### La longueur du texte servi

Le texte servi n'est pas borné : un refus du shell porte sa cause chaînée et peut dépasser 150 caractères. Dans la
boîte de la notice (base 340 × 44), le texte tient sans déborder : deux lignes au plus, puis une ellipse. L'app sert
le texte entier ; si le DS préfère une longueur maximale, il la donne et l'app coupe avant de servir.

## 4. Les derniers mots du calibrage par taille dans `ui/` (#670)

La V4 calibre une room une fois, à la taille principale ; la recherche des notions V3 « par taille » doit rendre zéro
ligne dans le dépôt vivant. Il en reste deux dans l'export :

1. `ui/screens/i18n.ts`, `headNote` de la station des captures : « Rien ne se règle par taille. » La phrase dit vrai en
   V4, mais garde la tournure du calibrage V3 ; demandé : « Rien ne se règle à une taille. » (en : « Nothing is set
   per size. » peut rester).
2. `ui/screens/RoomProfile.fixtures.ts`, commentaire d'en-tête : il raconte le retrait du calibrage par taille de la V3
   (buckets, tour, ajustage…). Demandé : un en-tête qui décrit les fixtures V4 telles qu'elles sont, sans l'historique.
