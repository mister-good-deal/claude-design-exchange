# Demandes permanentes — TOUTES HONORÉES (clôture au 2026-08-16)

Ce fichier remplace les quatre demandes permanentes de l'exchange. Le contrat dit qu'une demande permanente
« reste valide tant qu'on ne dit pas le contraire » : on le dit ici. **Aucune n'est encore ouverte.** Vérifié dans
le code de l'app, pas sur la foi d'un CHANGELOG.

| Fichier | Demande | Vérifié livré |
|---|---|---|
| `roomprofile-v3-field-fixes.md` | A — la station 3 n'affichait jamais rien (`.monitor` décoratif) | `MonitorSurface` rend la frame live ET la capture chargée, avec l'état vide honnête |
| | B — aucun geste réalisable en station 4 (pas de sélection, pas de resize, pas de test, pas de confirmation) | `ZoneWorkbench` partagé : rail, sélection, poignées, `ZoneBar` (absence, clic à blanc, confirmation), bande de captures |
| | C — zones absentes d'une capture | marquage d'absence + retour par glisser depuis le rail, auto-masquage synchronisé 3↔4 |
| `e5-variant-declinations.md` | contrat de données E5 (sous-ROI d'actions par layout) | rail de déclinaisons livré et câblé ; le modèle porte les clés scopées de bout en bout |
| `hotkeys-presets.md` | conflits de hotkeys de presets gérés comme les autres bindings | la détection de collision porte le scope `preset` dans « Hotkeys & bets » |
| `activation-brief.md` | nouvel écran `Activation` | livré, au manifest et à la baseline de parité |

## Pourquoi ce ménage

Ces quatre fichiers décrivaient un état de l'app qui n'existe plus. `roomprofile-v3-field-fixes.md` affirmait
encore que la station 3 « pilote À L'AVEUGLE » et que la station 4 n'a « aucun geste réalisable » — c'était vrai en
0.6.0, c'est faux depuis plusieurs drops. Les relire à chaque itération, comme le contrat le demande, revenait à
faire douter d'un travail déjà fait, voire à le refaire.

**Règle qu'on se donne pour la suite** : une demande permanente est clôturée par nous DÈS que l'app en vérifie la
livraison, dans le rapport de gate du drop qui la livre. Une demande qui n'est plus vraie coûte plus cher qu'une
demande absente.

## Ce qui reste ouvert

Rien. Les demandes vivantes passent par `report.md` (le rapport de gate de l'itération en cours).
