# Demandes à Claude Design — vague 0.8.6

Publiée par lt-bet le 06/10, sur l'accord de Romain du 06/10. Deux demandes, indépendantes l'une de l'autre :
l'export reste cumulatif avec le dernier drop (05/10). Côté app, les données sont déjà servies. En attendant le drop,
rien n'est affiché à leur place et aucune CSS app ne compense.

- §1 — la touche All-in refusée se dit sur la table (issue #615) ;
- §2 — notes vocales, proposition B « Configuration accompagnée » à exporter (issue #627).

## 1. La touche All-in refusée se dit sur la table (#615)

**Fichiers DS concernés** : `ui/screens/BetBar.tsx` (ou un fichier voisin) pour le composant d'avis,
`ui/screens/TableElements.module.css`, `ui/screens/i18n.ts` (`tableHud`), `ui/screens/TableElements.fixtures.ts`.
L'app pose le composant dans `TableHud`, qui reste à elle.

### Le cas

La touche All-in (`R` par défaut) joue l'une de trois choses : elle arme le tapis, ou elle suit, ou elle est refusée.
Aujourd'hui un refus ne se lit qu'au journal ; à l'écran, la touche ne fait rien. Il y a deux refus :

- **la mise n'est pas encore lue** : le héros est à la parole, mais le moteur ne sert pas encore la situation de mise
  (bande légale). La bet bar n'est souvent pas dessinée à ce moment-là, puisqu'elle naît de cette situation ;
- **rien à miser** : la situation est servie, mais elle n'offre ni relance ni appel.

C'est l'app qui décide du refus, de la table qui le porte et de sa durée. Le DS n'affiche que ce qui lui est servi.

### Ce que l'app demande

1. **Un composant d'avis exporté par le DS, que l'app pose dans la boîte de la bet bar.** `TableHud` appartient à
   l'app : il pose le composant dans la boîte de l'élément `betBar` (même ancre, même échelle), que la bet bar soit
   dessinée ou non. Quand elle l'est, l'avis prend une ligne au-dessus d'elle sans la couvrir. Le composant reçoit
   `data.allInRefusal?: { reason: "noDecision" | "nothingToBet"; keyLabel: string }`. `keyLabel` est le libellé de la
   touche, comme `betKeyLabel`. L'absence du champ veut dire qu'il n'y a pas d'avis. À exporter depuis
   `ui/screens/BetBar.tsx` (ou un fichier voisin), avec sa taille comme `siqClusterSize` si elle diffère de la bet bar.
2. **Les mots, en fr et en en**, dans `STRINGS[locale].tableHud` :
   - `noDecision` : « All-in ({key}) : la mise n'est pas encore lue » / « All-in ({key}): the bet is not read yet » ;
   - `nothingToBet` : « All-in ({key}) : rien à miser » / « All-in ({key}): nothing to bet ».
   `{key}` est `keyLabel`. Le DS est libre de la tournure, pourvu qu'elle dise lequel des deux.
3. **Un avis, pas une alerte modale.** Il est lisible d'un coup d'œil sur une table de 693×529, en teinte d'alerte
   (`--alert-*`), avec `role="status"`. Il ne prend ni souris ni focus : aucun rectangle n'est publié par `onReach`, et
   la fenêtre reste traversable sur lui.
4. **Aucun minuteur dans le DS.** L'apparition et la disparition suivent seulement `data.allInRefusal`. Le moteur
   retire l'avis au changement suivant de l'état de mise.
5. **Fixtures** : les deux refus, bet bar dessinée et non dessinée, en fr et en en, aux tailles 693×529, 1048×720 et
   1572×1080, pour la parité pixel.

### Côté app

Déjà servi : le moteur tient le refus dans `BetState`, et `BetStateDto.allInRefusal` le porte. Le container de
l'overlay le passera tel quel au composant après l'import ; rien n'est affiché avant.

## 2. Notes vocales : exporter la proposition B (#627)

**Fichiers DS concernés** (d'après la demande) : un écran Paramètres neuf (`ui/screens/`, avec ses fixtures et son
module CSS), l'entrée Settings du rail (`ui/screens/AppShell.tsx`), `ui/screens/SiqCluster.tsx`,
`ui/screens/TableElements.module.css`, `ui/screens/i18n.ts`.

La référence visuelle est le handoff de la proposition B que tu as produit avec Romain : archive
`tatami-notes-vocales.zip` du 6 octobre 2026, SHA-256 `65603626a159b63b1d66cf95455ff7d84adc6e345c521612365c6c433bb56a39`.
Son Markdown est archivé tel quel dans le dépôt Tatami (`specs/025-notes-vocales/design/notes-vocales-B.md`).

### Livraison demandée

Exporter la proposition B « Configuration accompagnée » déjà validée par Romain, sans nouvelle exploration de
design : écran Paramètres, entrée Settings du rail et ajustements SiqCluster. Le prototype autonome fourni est
une référence visuelle, pas un package à importer. Fournir un vrai `tatami-ds` avec manifest, Wiring, fixtures et
les traces de fraîcheur/parité habituelles. Respecter le contrat d'export et les gates du dépôt.

### Points à reprendre exactement

- Onglet Paramètres entre Raccourcis et mises et Compte ; parcours cinq étapes et réglages directs.
- Niveaux Rapide, Équilibré, Précis ; aucun nom interne dans le rendu, les erreurs ou le diagnostic.
- Aide « GPU non reconnu ? » uniquement au clic, lien toujours visible, aucun repli CPU automatique.
- Phases du cluster, rouge seulement pendant capture, aucune jauge ni durée pendant une note joueur.
- Note datée séparée par 28 `─`, états pending et reprise au crayon sans ouverture automatique.
- Échap traité par l'app même avec les raccourcis désactivés ; le DS ne prend pas le focus pour la capture.
- Aucun écran « Dernières dictées », aucune barre de simulation du prototype.

### Précisions de contrat à intégrer

- Télécharger à 100 % ne signifie pas encore installé : présenter la vérification jusqu'à confirmation app.
- Les niveaux GPU Équilibré et Précis peuvent partager les mêmes ressources ; la suppression annonce les niveaux
  concernés et l'espace disque compte une seule fois ces ressources.
- Les tailles téléchargées sont réelles. Les mesures RAM/VRAM non qualifiées ne sont pas remplacées par celles de
  la démo : permettre une valeur absente/inconnue dans Détails.
- Toute mutation s'acquitte via l'app. Les refus ne ferment pas un éditeur ou une suppression comme si elle avait
  réussi. Le succès d'un test vient d'une vraie transcription, pas d'un timer.
- Le texte fusionné fourni à l'éditeur vient de l'app ; `pending` sert à son état visuel, pas à refaire la fusion.
- Valider une note appelle `onSetNote` même si le texte n'a pas changé ; distinguer `saved` et `cancelled` dans
  `onNoteEditEnd`. Une fermeture forcée continue de remettre le brouillon par `onNoteDraft`.
- Exposer toutes les zones atteignables du panneau pendant enregistrement, attente et erreur via le contrat
  existant `onPanels` / `siqPanelBox`.

