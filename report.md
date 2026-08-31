# Vague 0.6.13 — Tatami app → Claude Design (2026-09-01)

Une seule demande, compilée par le coordinateur. Contexte : la station 4 est finie (campagne 0.6.12 : six issues
validées, zéro régression) ; ce cycle ajoute le délai de recomposition du client avant capture post-resize (#111,
arbitré au terrain) — l'app le sert et le persiste déjà, il ne manque que le champ d'IHM.

| # | Demande | Issue | Nature |
|---|---|---|---|
| 1 | Station 3 : champ « délai de capture (ms) » près du bouton Capturer / F9 | #111 | contrat proposé : `RoomCalibration.captureDelayMs` + `onSetCaptureDelay?` (préférence, hors wiring obligatoire) — défaut 1500, bornes 0–5000 |

Le badge « à calibrer » (#109) n'a PAS de nouvelle demande : la variante `toCalibrate` du drop 2026-08-30 suffit,
seul le seuil du vert a changé côté app.

---

# Tatami app → Claude Design — demande d'itération (0.6.13) : champ « délai avant capture » dans la station 3

Contexte terrain : après un redimensionnement de la fenêtre de table, le client de la room continue de **recomposer
son affichage** pendant plusieurs centaines de millisecondes. Tatami, lui, n'attendait que la géométrie Win32 de la
fenêtre — la capture partait pendant la recomposition et le PNG sortait **écrasé horizontalement** (même main, même
seconde, table déformée). L'arbitrage de Romain : une **pause fixe de 1500 ms** entre le resize et la capture,
**réglable par le joueur** au cas où sa machine soit plus lente.

L'engine et le profil sont faits et livrés dans cette MR :

- `[room].capture_delay_ms` au profil (défaut **1500**, bornes **0–5000 ms**, entier), chargeur + `CalibrationDraft`
  + écriture atomique.
- `RoomCalibrationDto.captureDelayMs: number` — **déjà servi** par `getRoomCalibration()`, dans la même charge
  one-shot que `players`, `sizes`, `zones`. Aucun appel supplémentaire à faire.
- `IpcDriver.updateCaptureDelay(ms: number): Promise<ReloadStatusDto>` — les trois couches IPC sont câblées (réelle,
  fixture, interface). Le refus hors bornes remonte `room.capture_delay_ms doit être dans [0, 5000], reçu <n>`.
- Le chemin de capture respecte la valeur : chaque taille du F9 multi-taille qui n'est pas déjà à l'écran attend le
  délai avant que le PNG parte, et la capture qui suit un armement de cellule paye ce qui reste de la pause.

**Il ne manque que le contrôle**, et il vit en DS-owned (`apps/web/src/ui/screens/TourStation.tsx`, `contract.ts`,
`i18n.ts`) : c'est l'objet de cette demande.

## Changements demandés (fichiers DS-owned)

1. **Contrat** (`contract.ts`) :
   - `RoomCalibration` porte `captureDelayMs: number` (l'app le sert déjà).
   - `RoomProfileCallbacks` gagne `onSetCaptureDelay?: (ms: number) => void`.
   - **Hors `RoomProfileWiring`** : c'est une préférence, pas une étape de la procédure. Sans handler, le champ ne se
     rend pas et la station reste entière (même règle que `onSampleProbe` / `onRetryExtraction`).

2. **Le champ** (`TourStation.tsx`), dans `styles.captureRow`, **à droite du bouton `Capturer F9`** — le réglage
   appartient au geste qu'il modifie, et c'est là que le joueur constate qu'une capture est encore déformée :
   - un `<input type="number">` (min `0`, max `5000`, step `100`, `inputMode="numeric"`), largeur d'un champ à
     quatre chiffres, suffixe `ms` visible ;
   - valeur initiale = `captureDelayMs` de la charge, **jamais un défaut codé côté écran** ;
   - émission sur `blur` / `Enter` (pas à chaque frappe : chaque appel écrit le profil sur disque) ;
   - valeur vide ou hors bornes ⇒ pas d'émission, le champ retombe sur la dernière valeur servie.

3. **Libellés** (`i18n.ts`) :
   - label du champ : « Délai avant capture » ;
   - unité : « ms » ;
   - aide, à placer en `title`/aide contextuelle : « Temps laissé à la room pour réafficher sa table après un
     redimensionnement, avant que la capture parte. Augmentez-le si une capture sort déformée. »

4. **Accessibilité** : le champ porte un vrai `<label htmlFor>` (pas un `aria-label` seul) ; le suffixe `ms` est lié
   par `aria-describedby` plutôt que collé au label ; `aria-invalid` sur une saisie hors bornes.

## Ce qu'il ne faut PAS faire

- Ne pas rendre le champ dépendant de l'état `cold` du bouton `Capturer` : le joueur doit pouvoir régler la pause
  avant même d'avoir une fenêtre confirmée.
- Ne pas ajouter de bouton « rétablir 1500 » : le défaut est une donnée de profil, pas une constante d'écran.
- Ne pas afficher de compte à rebours ni d'indicateur d'attente pendant la pause : la capture est un geste bloquant
  court, un spinner y ajouterait un état à maintenir pour rien.

## Critère de recette

Dans la station 3, changer le délai à `2500`, quitter le champ, relancer l'app : le champ affiche `2500` (il vient du
profil, `[room].capture_delay_ms = 2500`). Un F9 sur un layout à deux tailles attend 2,5 s avant la capture de la
seconde taille ; la première (celle déjà à l'écran) part sans attendre. Saisir `9000` n'écrit rien et le champ
revient à la dernière valeur servie.
