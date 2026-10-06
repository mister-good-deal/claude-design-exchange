# Demandes à Claude Design — vague 0.8.6, itération 2 (correctif du drop du 06/10)

Publiée par lt-bet le 06/10, sur l'accord de Romain du 06/10. Le drop du 06/10 (`tatami-ds` 2026-10-06) répond à la
vague 0.8.6 : merci. Son import passe `lint` et `tsc`, mais la gate `doctor` de l'import échoue. Une seule correction
est demandée, et une précision est donnée pour information. Rien d'autre ne change : l'export reste cumulatif avec ce
drop.

## 1. `ui/screens/VoiceLevels.tsx` : un composant par fichier (#627, bloquant)

`react-doctor` 0.4.2, lancé comme la gate le lance (`react-doctor --no-telemetry --blocking warning --yes`, aucun
diagnostic toléré, erreurs ET warnings), signale 6 warnings `no-multi-comp` (« Multiple components in one file —
move secondary components into their own files ») :

| Ligne | Composant |
| --- | --- |
| 49 | `LevelDetails` |
| 70 | `LevelBadge` |
| 80 | `LevelCard` |
| 103 | `LevelChoice` (exporté) |
| 119 | `DiskRow` |
| 146 | `DiskResources` (exporté) |

Le fichier porte aussi `ResourceState` (ligne 22), le premier composant, que la règle laisse en place.

**Demande** : un composant par fichier sous `ui/screens/`, par exemple `VoiceLevelChoice.tsx` (avec `LevelCard`,
`LevelBadge` et `LevelDetails` dans leurs propres fichiers) et `VoiceDiskResources.tsx` (avec `DiskRow` dans le sien),
ou tout autre découpage pour lequel `react-doctor` rend **0** diagnostic. Le markup, les classes et les fixtures restent
les mêmes : c'est un déplacement, pas un changement de rendu. Merci de lancer `react-doctor --blocking warning` sur
l'export avant de zipper : l'app ne retouche jamais un fichier DS et n'assouplit aucune règle.

## 2. Pour information : `onSetNote` sur une note inchangée (#627, aucune demande)

Le `SiqCluster` du drop appelle `onSetNote` à chaque validation, texte inchangé compris, pour qu'une dictée en attente
parte avec l'écriture. C'est noté. Côté app, la règle reste « vide ou inchangé : rien n'est écrit » : le shell n'écrit
rien quand le texte est celui de la note. La note garde sa date, et `onSetNote` se résout quand même à `true`. Aucun
changement n'est attendu dans le DS.

## Côté #615 (avis All-in refusé)

`AllInNotice` et `allInNoticeBox` sont conformes à la demande : aucune correction. L'app les câble sur ce drop corrigé.
