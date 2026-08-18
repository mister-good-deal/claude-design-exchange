# Tatami app → Claude Design — retours TERRAIN de la validation Windows 0.6.4

Session du 2026-08-18 (rapport : `recon/win-validation-2026-08-18/REPORT.md` sur `windows/validation-0.6.4`).
**Le drop 0.6.4 tient ses promesses sur l'essentiel** — merci : la barre d'onglets est enfin dans l'app (écart 29,
3 signalements, la clause de parité §8 a fonctionné du premier coup), la station 3 v2 est validée telle quelle
(deux colonnes, plus de « Corriger… », plus de pré-sélection), l'ouverture à froid marche, le message d'aperçu
live dit enfin la vérité (écart 6, 3 releases), le zoom/pan ancré est parfait, le catalogue affiche `/12` avec
check/bet, et `bet_blur` vit désormais au rail des pixels avec ses tooltips.

Ce qui suit est ce que le terrain a trouvé APRÈS ces acquis. Rappel de la règle : tout retour est traité, seul
Romain décide d'un report.

## A — La sync 3↔4 annoncée n'existe pas dans le rendu (écart 36)

Le drop annonce « ROI absentes et déclinaisons non attestées auto-masquées ». Sur le terrain, **rien n'est masqué
automatiquement** : un screen labellisé « flop » affiche encore `board_4` et `board_5`, et les tentatives de
masquage des boutons d'actions donnent un résultat incohérent.

Analyse code : `ZoneWorkbench` calcule `hiddenForCanvas(zones, ui.hidden, ui.focusOnly, ui.zoneId)` où `ui.hidden`
est **exclusivement manuel** (toggle œil) — rien n'est dérivé des labels/attestations du shot chargé. De plus
`case "selectShot"` ne réinitialise pas `hidden` : **les masquages d'un screen fuient sur le suivant**.

Attendu, en trois points :
1. dérivation « variante attestée → sous-ROI visibles » (le shot porte `variantIds` ; `board/b3` ⇒ `board_4` et
   `board_5` masquées) ;
2. **recalcul à chaque chargement de screen** (pas de report de l'état précédent) ;
3. le geste manuel reste prioritaire par-dessus la dérivation (« montrer » ré-écrit les labels, comme spécifié).

## B — Station 5 : l'outil de glyphes doit tout montrer d'un coup (écart 49)

Aujourd'hui il faut sélectionner `board_1`, puis `board_2`… Attendu : **supprimer la selectbox de ROI** et afficher
simultanément toutes les cartes du board présentes sur la capture, chacune dans sa box (idem cartes héros), en
n'affichant **que ce que le screen montre** (un flop = 3 cartes). Même donnée que le point A — les deux se
règlent ensemble.

## C — Le rail des pixels est devenu illisible (écarts 45, 46b, 47)

`bet_blur` au rail est un vrai gain, mais la vue déborde : ~16 pixels à poser d'un coup.

- **C1 (45)** : les libellés sont tronqués par des ellipsis — « Fold · 3 boutons · … », « Fold · … », « Call ·
  slider · … ». Le joueur ne peut pas identifier le pixel qu'il pose. Libellés lisibles en entier (largeur,
  wrap, ou infobulle).
- **C2 (46b)** : même une fois les variantes mortes filtrées (correctif app en cours, cf. C3), les sondes par
  déclinaison restent nombreuses — il faut une hiérarchie : grouper par action, et/ou n'exposer que les
  déclinaisons attestées par au moins une capture.
- **C3 (47)** : un pixel absent de la capture chargée doit pouvoir être écarté, exactement comme une ROI
  (« absente de cette capture »), et revenir par le même geste.

*(La pollution par les sondes de variantes désactivées — « Fold · slider » alors que `slider_open` est
désactivée — est côté app : `zone_catalog` ne filtre pas l'état. Corrigé chez nous, pas une demande DS.)*

## D — Divers écran

- **D1 (42)** : une variante personnalisée ajoutée par le joueur se range dans le groupe **ACTIONS** comme si
  elle appartenait au catalogue moteur. Attendu : une section « Personnalisé » (ou un libellé distinctif).
- **D2 (39)** : quand la porte licence est injoignable, le bouton « J'ai déjà un abonnement » **ne fait rien** —
  aucun message à l'écran. Un état d'échec de licence doit être conçu (message actionnable), pas un clic mort.
- **D3 (24/37, rappel)** : la convergence de l'Établi standalone vers la station 4 (BucketCards, seed, purge,
  DeclGate dans l'inspecteur, retrait de `bench`) reste commandée depuis le rapport 0.6.3 — non re-testée cette
  session faute de temps.

## E — Leçon transverse : un callback DS non câblé est silencieux

Le bouton « Confirmer la suppression » de la station 3 ne faisait **rien** : le composant appelle
`on.onDeleteShot?.(…)` en optional-call et l'app n'avait pas de handler — clic avalé, sans erreur ni log (câblé
en session). Même famille que `liveSuspended` « livré, jamais câblé » de la 0.6.4. Piste commune app+DS : rendre
obligatoires les callbacks du contrat qu'un écran utilise réellement, ou poser un garde-fou de développement qui
journalise tout `on.X?.()` sans handler. Un drop parfait peut arriver inerte — et rien ne le dit.

## F — Addendum app (0.6.5) : ce qui est corrigé chez nous, et ce que la garde a trouvé

Corrigé côté app dans la 0.6.5, pour que le prochain drop se teste sur un socle sain : la **station 5 est
désormais une étape à froid** (la pipette ne passe plus par la porte du tour — c'était le point de blocage des
stations 5-6-7), les **variantes désactivées ont disparu de toutes les surfaces résolues** (catalogue de zones,
sondes, rail des pixels : plus de « Fold · slider » sur une room sans slider — le point C3 côté app annoncé au
paragraphe C), et la **porte licence dit enfin sa panne** (message actionnable + ligne de journal).

Sur la leçon transverse du paragraphe E, nous avons posé la garde chez nous : un test relit les sources et échoue
dès qu'un écran DS appelle un `on.onX` qu'aucun container ne fournit. Elle a trouvé **trois gestes que l'app ne
peut pas honorer aujourd'hui** — ils sont rendus à l'écran et ne font rien :

- `onSelectLocale` (écran Compte) : la langue est un choix de BUILD (`APP_LOCALE`), rien à commuter à chaud ;
- `onResendCredential` (mur d'abonnement) : aucun endpoint de renvoi côté serveur de licence ;
- `onReanchor` (overlay) : le glow suit la fenêtre, l'app n'expose pas d'ancrage manuel.

Demande DS, dans la ligne du paragraphe E : **un contrôle dont le callback est absent ne doit pas être rendu**
(ou doit être rendu désactivé avec son motif). Un lien mort est indiscernable d'une panne — c'est exactement ce
qui a coûté une session sur l'écart 39. La réciproque reste souhaitable : rendre obligatoires, dans le contrat,
les callbacks qu'un écran utilise réellement.
