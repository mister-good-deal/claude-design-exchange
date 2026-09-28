# Demande Claude Design — 0.8.0 : la pipette montre les points d'un bouton, sans clic à blanc

Issue d'origine : [#504](https://gitlab.laneuville.me/rom1/tatami/-/issues/504) (G1 note 12827). Écrivain exchange :
lt-atelier. Ce fichier appartient à la MR du lot ; il ne livre aucun écran, aucun CSS app, aucune édition de `ui/`.
Publiée le 2026-09-28 sur l'accord de Romain : `roomprofile-080-pipette.md` sur l'exchange.

## Ce que l'app change déjà

Station 5, pipette : après un prélèvement accepté du point 1 (ou 2) d'un bouton, la cible servie
(`MeasureState.activeProbeId`) passe d'elle-même au point suivant du même bouton, s'il n'est pas encore posé. Les trois
points se posent en trois clics sur la capture, sans re-sélection dans le rail. Rien à faire côté écran : il suit la
cible servie.

## Ce qui est attendu de l'écran

1. **Montrer les points posés du bouton actif sur la capture**, numérotés (1), (2), (3) : un repère discret à la
   position de chaque cible du bouton qui en a une (`Probe.point`, déjà servi pour la cible, son `#2` et son `#3`), le
   point actif distingué. Pour voir où sont les points déjà posés et écarter le suivant. L'écran ne calcule aucune
   position.
2. **Retirer le « clic à blanc » de la pipette** : le bouton « Test — clic à blanc sur la fenêtre live » de la ligne
   d'une cible de clic (`ActuatorRow`, `onTestPoint`), et ses libellés `testNever`, `testPassed`, `testFailed` ;
   `unplacedClick` devient « pas encore posé » (sans « rien à cliquer à blanc »). `onTestPoint` quitte le contrat de la
   station 5 ; la ligne garde son nom et sa note. Le clic de test de la station 4 (`onTestClick`) reste tel quel.
