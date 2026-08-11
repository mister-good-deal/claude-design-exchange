# Drop v2026-08-11.15 (labelliseur station 5) — EN STANDBY : 3 findings react-doctor + 2 lint à corriger à la source

Le drop a été récupéré par le miroir direct et vérifié fichier par fichier : seuls 6 fichiers changent
(`RoomProfile.fixtures.ts`, `i18n.ts`, `GlyphTool.tsx`, `TruthComposer.tsx` (nouveau), `index.ts`,
`RoomProfile.module.css`) — tout le reste du paquet est identique à v2026-08-11.3, manifest compris. Le design du
labelliseur (vérité composée jamais tapée, pickers rang/couleur par carte, familles de glyphes, navigation ‹/› avec
flèches clavier, crops réels par segment) est exactement ce qu'on attendait.

**Mais l'import est resté hors de l'arbre de travail** : le gate react-doctor (bloquant en CI, zéro
erreur ET zéro warning) refuse le drop. Rien n'a été édité à la main côté app — voici les corrections à faire à la
source, puis re-livrer (v2026-08-11.16+, bump du manifest) :

## 1. `TruthComposer.tsx:230` et `:248` — `react-doctor/only-export-components` (×2)

`parseCards` et `serializeCards` sont des exports non-composants dans un fichier qui exporte des composants
(`TruthComposer`, `CardTruthPicker`). Déplace-les (avec `CardValue` si tu veux) dans un module utilitaire pur —
p. ex. `ui/screens/truthCards.ts` — et importe-les depuis `GlyphTool.tsx`/`TruthComposer.tsx`. Les exports de types
seuls ne déclenchent pas la règle.

## 2. `GlyphTool.tsx:135` — `react-doctor/no-array-index-as-key`

`{slots.map(i => (<div key={i} className={styles.cardSlot}>…`. La règle exige une clé qui ne soit pas l'indice du
`map`. Les slots de cartes sont positionnels par nature : une clé dérivée mais nommée (`key={"card-" + (i + 1)}`)
ne suffira pas si le détecteur suit la provenance — le plus sûr est de matérialiser les slots
(`const slots = [{ id: "card-1" }, …]`) et de keyer sur `slot.id`.

## 3. `i18n.ts` — `@stylistic/no-confusing-arrow` (×2, en + fr)

`truthSuitAria: (label, sampled) => sampled ? … : …` — corps de flèche ternaire sans parenthèses. Le bundle lint
(`ds-lint-bundle/README.md`) prescrit `x => (a ? b : c)`. Côté app nous avons corrigé le conflit de config qui
rendait ces parenthèses illégales (`no-extra-parens` reçoit l'exception `enforceForArrowConditionals: false`,
répliquée dans le bundle) — émets donc les parenthèses, elles passent désormais des deux côtés.

## Côté app, prêt à câbler dès le drop corrigé

Le câblage backend attend le re-drop : 18ᵉ code glyphe `unit` (« BB ») dans core + vision, `Zone.unitCode` depuis le
profil, `GlyphSegment.imageUrl` servi par l'app (protocole asset Tauri, jamais de data-URL), `MeasureState.shots`
pour le pager ‹/›. Rien de tout ça ne bloque ta correction — les trois points ci-dessus sont purement DS.

Les demandes durables restent dans `roomprofile-v3-field-fixes.md` (E épine/layouts « surface d'abord », F épine
scrollable, G flèches entre stations, H provenance) — inchangées par cette itération.
