# Drop 2026-08-22.1 — rapport de gate (app Tatami)

**Verdict : importé et CÂBLÉ — il reste UNE gate rouge, deux findings react-doctor à corriger à la source.**
Les trois retours de la revue sont fermés exactement comme annoncé : la ColorSurface donne enfin son déclencheur à
`onPlaceColorSample` (et l'aller-retour station 4 disparaît du parcours de mesure), les lignes d'enseignes chargent
leur capture, la copy se conjugue avec `needed` (arbitrage 1/3 appliqué des deux côtés).

Côté app, la pipette v2 est câblée de bout en bout : le clic sur la surface pose le point, committe la géométrie
(flush du débounce — la mesure attend le verdict backend, écart 51), la mesure court sur toutes les captures
attestantes (bouton, `needed: 1`) ou lit le point désigné (`pipette_sample_at`, enseigne, 3 relevés), et chaque
unité S'ÉCRIT D'ELLE-MÊME à sa dernière cible — `[probes.colors]` par barre × action avec SA tolérance,
`set_suits` pour la palette (écarts 63/66, le buffer invisible est mort). Le schéma `[probes]` est passé par
variante × action (une même action ne porte pas la même couleur d'une barre à l'autre — votre modèle), le moteur
lit chaque sonde avec sa tolérance propre, et la ligne du score compte barre par barre. Le chemin de pose au
clavier est retiré côté app (retour inconditionnel en station 5), les rapports d'extraction (`Shot.extraction`) et
les rejets décor (`GlyphTruth.rejected`) sont servis.

Gates : tsc ✓, lint ✓ (passe mécanique du formatteur), vitest 415/415 ✓, Playwright 64/64 ✓ (le parcours complet
badge vert → profil écrit passe sur la pipette v2), pixel-parity 25/25 ✓, ds-sync 80 ✓, cargo fmt/clippy + 865 ✓.
**react-doctor ✗ — 2 findings, tous deux dans `ui/screens/PipetteTool.tsx`** (jamais hand-édité, règle maison) :

## 1 — `js-cache-property-access` · `PipetteTool.tsx` (unitStates, ~l.196)

`t.unit.id` est déréférencé deux fois dans la boucle (`index.get(t.unit.id)` puis `index.set(t.unit.id, u)`) —
la règle demande de mettre l'accès en cache (`const unitId = t.unit.id;`).

## 2 — `no-array-index-as-key` · `PipetteTool.tsx` (slots, ~l.406)

`slotIndexes(target.needed).map(i => <SlotCard key={`slot-${i}`} … index={i} />)` : la clé dérive de l'index de
map. Ici l'index EST l'identité du slot (les relevés sont positionnels, jamais réordonnés) — mais la règle est
bloquante chez nous et jamais suppressée. À reformuler à la source pour qu'elle ne dérive plus de l'index du
`.map` (par exemple itérer des identités de slot construites une fois).

Dès le re-drop, l'import est un drop-in : tout le câblage est déjà en place et vert.
