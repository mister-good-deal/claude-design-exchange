# Vague 0.7.6 — refus sizing visible (#251)

Extension de la vague #249 sous GO de Romain ; écrivain unique : lt-engine.
Ref https://gitlab.laneuville.me/rom1/tatami/-/issues/251
Conserver intégralement les demandes station 3 et atelier de roomprofile-076-navigation-et-atelier.md.
Un seul drop cumulatif couvre #244, #247 et #251.

## Défaut reproduit et résultat attendu

Dans RACCOURCIS / sizing, réattribuer le preset Min de 1 à Z puis refuser la sauvegarde côté driver.
L'app revient correctement à 1 et fournit le message « fixture: sizing write refused » dans data.rejection.
Le DS actuel ne rend pas ce message. Afficher le refus verbatim, visible et accessible près de l'action concernée.
L'utilisateur doit comprendre que la modification a échoué et pouvoir réessayer.

Le container fournit déjà data.rejection?: { id: string; message: string }. Aucun nouveau DTO ni callback requis.
Le message doit suivre la durée de vie de cette propriété : ne pas ajouter de minuterie ou d'état local qui le masque.
Conserver les états pending/conflict ; un conflit de raccourci et un refus du backend sont deux états distincts.

| Identifiant existant | Emplacement du refus |
|---|---|
| street/situation/presetId | Ligne du preset concerné : modification, réattribution ou suppression |
| street/situation | Section concernée : ajout ou changement du preset par défaut |
| restore-hotkeys | Commande de restauration des raccourcis |
| sizing-instant | Commande de bascule du sizing instantané |

Les identifiants street/situation/presetId désignent les valeurs réellement fournies par l'app, séparées par `/`.
Une suppression peut retirer la ligne optimiste : garder un emplacement visible pour le refus à son retour après rollback.
Ne pas afficher le message dans une autre ligne ou une autre section. Le refus global doit rester visible près du contrôle.
Préserver l'ordre existant de libération cross-owner : updateBindings puis updateSizing ; aucune logique de mutation DS.

## Preuve exécutable et recette d'import

Base testée : b05c72702b1703a2bd3c007ad9f2f65c3a3bcdea, lot !231 conservé figé.
Le test utilise le vrai HotkeysContainer et le vrai DS ; seules les réponses de sauvegarde du FixtureDriver sont différées.
Commande : pnpm vitest run apps/web/src/app/screens/HotkeysSizing.test.tsx -t 'rolls back a preset hotkey'

- Test existant : vert (1 passé, 4 ignorés), le rollback de Z à 1 fonctionne.
- Extension préparée : rouge (1 échoué, 4 ignorés), sur getByText(message).toBeVisible(), après le rollback déjà vérifié.
- La suite du test spécifie une nouvelle tentative réussie, Z visible et réellement persisté, puis disparition du refus.
  Ces assertions ne sont pas atteintes sur le DS actuel ; aucun résultat vert après correction n'est encore revendiqué.
- Le patch de test est joint à #251. Typecheck et lint sont verts avec ce patch.

Après le drop, appliquer le patch dans le lot d'intégration contenant !231 ou son test et helper identiques,
puis obtenir le vert sur le test entier et sur HotkeysSizing.test.tsx. Ne pas modifier la MR !231 pendant sa revue.
Adapter seulement les sélecteurs si nécessaire, en conservant les assertions rollback, refus visible et succès persisté.

Compléter la recette avec les refus de restauration, bascule instantanée, ajout/défaut et libération cross-owner.
Ces chemins ont été lus dans le container mais ne sont pas couverts par la preuve Min ci-dessus.
Contrôler le bon rattachement du message, le focus/clavier et l'absence de régression des états pending/conflict.
À l'import : socle complet, doctor zéro diagnostic, E2E complète et parité pixel, selon les gates du dépôt.
Aucune retouche manuelle sous apps/web/src/ui/. Drop et intégration restent à livrer.
