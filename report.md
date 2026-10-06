# Demandes à Claude Design — vague 0.8.6, itération 3 (notes vocales, raccordement de Paramètres)

Publiée par lt-bet le 06/10, sur l'accord de Romain du 06/10, pour l'agent qui câble les notes vocales. Le drop du
06/10 (`tatami-ds` 2026-10-06.1) est importé et passe toutes les gates. Une seule demande : les états que le
raccordement de Paramètres ne peut pas rendre honnêtement avec le contrat actuel. L'export reste cumulatif avec ce
drop ; l'avis All-in (#615) n'a rien à corriger.

## 1. Paramètres : états absents du contrat (#627)

**Fichiers DS concernés** : `ui/screens/Settings.fixtures.ts` (types `GpuDetect`, `GpuSituation`, fixtures),
`ui/screens/VoiceExec.tsx` (`CardPicker`), `ui/screens/VoiceGpuHelp.tsx`, `ui/screens/VoiceSetup.tsx` (étapes du
parcours, étape micro), `ui/screens/settingsModel.ts`, `ui/screens/i18n.ts`.

**En bref** :

- `GpuDetect` : un état « non encore détecté » et un état « échec » avec motif, en plus de `running` et de `done`.
- `GpuSituation` : une situation indisponible ou inconnue, sans verdict matériel.
- Le choix de la carte est offert dès qu'il y a UNE carte utilisable, avec « Choisir une carte » tant que rien n'est
  choisi.
- Paramètres reste consultable pendant une dictée, sans lancer d'inventaire concurrent.
- Un callback signale le changement d'étape du parcours (sortie de l'étape micro).

**Le détail, tel que l'a écrit l'agent qui câble l'écran :**

Le ZIP du 6 octobre 2026 (`8759cb864c9c1d9d9f846b027fb0b3085715030bb2863da544d077d99eeb7ac9`) ne permet pas
de rendre honnêtement un inventaire GPU qui échoue : `GpuDetect` impose `running` ou `done { at }`, et
`GpuSituation` impose une conclusion matérielle. Une panne du processus ou un refus de Windows ne prouvent pas
l’absence de carte. Il faut un état de détection échouée avec motif, et une situation indisponible/inconnue.
Un état initial non encore détecté évite également une fausse date de détection après refus d’une opération occupée.
Ouvrir Paramètres pendant une dictée doit garder les réglages consultables sans lancer un inventaire concurrent.
Le snapshot n’autorise alors aucune conclusion sur une éventuelle détection antérieure.
Le raccordement actuel isole les erreurs de détection dans la frontière d’erreur de cet écran ; ce repli ne
constitue pas le parcours attendu. La recette d’ouverture pendant une dictée et la recette d’inventaire échoué
restent non livrées jusqu’à adaptation du contrat, sans spinner permanent ni verdict matériel fictif.

`VoiceExec.CardPicker` n’apparaît qu’avec deux cartes utilisables. Avec une carte utilisable et aucun choix
enregistré (`gpuId: null`), le parcours nominal n’offre donc aucun choix explicite : il indique « Aucune carte
détectée », puis oblige à ouvrir l’aide pour choisir celle qui est pourtant connue. Afficher le choix explicite
dès qu’une carte utilisable existe, avec une entrée « Choisir une carte » tant que l’utilisateur n’a pas choisi.
Aucune sélection ni bascule de mode automatique ne sera ajoutée dans l’app pour contourner ce cas.

La carte `backend_unavailable` peut se rendre avec `vulkan: false` : la formulation livrée « Accès Vulkan
indisponible » décrit l’accès et ne diagnostique pas arbitrairement l’absence du chargeur.

Le wizard ne fournit aucun callback de changement d’étape ni d’arrêt de l’essai : le backend limite donc
l’essai à sa durée maximale et efface la calibration lors de la sortie de Paramètres ou de la fin du wizard.
Pour effacer le tampon dès la sortie de l’étape micro, le contrat doit notifier ce changement d’étape.
