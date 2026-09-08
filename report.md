# Vague 0.7.6 — station 3 froide, atelier explicite et refus sizing

Responsable et écrivain unique : lt-engine. GO de Romain du 8 septembre 2026.
Issue de vague : https://gitlab.laneuville.me/rom1/tatami/-/issues/249 (Ref #244 #247 #251).

La vague 0.7.5 est importée en 0.7.4 : bande compacte et seuil de couverture conservés.
Le défaut restant en station 3 est le verrouillage des tuiles à froid, indépendamment de leur géométrie.
Les captures existent sur disque : choisir un bucket à froid appelle onSelectSize, sans resize.
À chaud, le chemin onTourSize et sa confirmation restent requis.

L'atelier doit offrir sélection de capture ET ROI numérique, avec identité affichée.
Une exécution demeure au clic. Une sélection/configuration changée périme les témoins ; les réponses tardives
sont rejetées par l'app. L'ouverture depuis GLYPHES conserve les trois arguments taille/capture/ROI.
Le contrat de présentation et les recettes précis sont dans roomprofile-076-navigation-et-atelier.md.

Les refus de sauvegarde sizing déjà fournis dans data.rejection doivent être visibles et accessibles.
Le contrat existant, la preuve rouge et la recette sont dans hotkeys-076-refus-sizing.md.

Un seul drop cumulatif pour ces trois issues ; aucun changement de moteur ni de contrat IPC demandé au DS.
Typecheck, lint, doctor sans diagnostic, suite e2e complète et parité restent requis à l'import.


## Verdict courant — drop corrigé accepté en recette locale

Le redrop cumulatif `2026-09-08.1` est accepté sur la branche locale `feature/ds-076`, commit
`24e8e5b68bd0d9281ee176bd5c110b9851f1ed55`, base `52b7b99efb5949b9b192cd141a683048b566e736`.
SHA256 de la copie validée puis importée :
`0fe3ed8226bac3f8941ae9fd0913587f79d9f4a2262e8407c23eb60acc687737`.
Manifest et preview identiques, previewOnly vide, 104 fichiers conformes au verrou après import officiel.

**Aucune nouvelle correction Claude Design demandée.** D1–D4 sont corrigés ; les cinq contrôles portables
ci-dessous passent (5/5, 1,24 s). D5 demeure conforme et non bloquant : aucune suppression d'un succès précédent
du même contexte n'est imposée. L'échec de chargement d'image est maintenant visible et sa récupération testée.

Câblage app effectué et recettes sur vrais composants/store/FixtureDriver : consultation froide sans resize ni
capture, changement chaud effectif, conservation du bucket à la fermeture, rejet des réponses dépassées ; atelier
capture/ROI explicites, aucun run à la sélection, loading/error/stale, sélection perdue, portée de glyphe ; sizing
avec rollback, refus visible et retry persisté. Les ROI numériques restent consultables sur une capture négative.
Le contrôle #251/5352 est complet. Les 29 tests dédiés container comprennent 7 froid/chaud, 12 atelier, 9 sizing
(dont 5 déjà présents dans !231) et 1 abonnement StrictMode. Le hook pipeline compte 31 cas, inclus dans le total.

Gates finales après le dernier correctif app : typecheck, lint, doctor zéro diagnostic, knip, check:guards et
check:ds-sync verts ; Vitest **635 tests / 50 fichiers / 37,31 s** ; E2E **75 passed / 31,7 s** ; parité pixel
**28 passed / 48,7 s**. E2E/parité sous verrou partagé, `CI=1`, `--retries=0` explicite. Aucun flaky accepté.

La première panne E2E est expliquée et conservée : l'oracle attendait Committer déjà actif au repos avant le départ
asynchrone de métrologie. Le test attend maintenant la phase terminale puis conserve les assertions exactes.
Patch isolé et preuve causale rouge/verte remis au coordinateur pour !231, indépendamment du DS.
Un autre rouge/vert app démontre qu'un ancien callback d'abonnement nettoyé doit être ignoré.

Rapport, gestes, limites et deux captures : `recon/ds-076/recette.md` dans le commit local indiqué.
Logs : `/tmp/tatami-ds-076/lt-engine/final/` ; preuves calibration :
`/tmp/tatami-ds-076/lt-engine/calibration-gate-fix/`.
Limites : fixtures navigateur, pas de preuve IPC Rust→DTO ou Windows réel. Pas encore de MR/CI DS : les neuf lots
précédents ne sont pas tous intégrés (3/9 au relevé). Le rebase final, la déduplication des tests livrés via !231,
les gates sur release assemblée puis la MR restent au rail coordinateur. Ce verdict ne vaut pas fusion.

---

## Historique du premier drop — défauts résolus par 2026-09-08.1

Le verdict rouge ci-dessous est conservé avec ses preuves et contrats pour traçabilité ; il est supersédé par
le verdict courant ci-dessus. La demande de relance qu'il contient concernait uniquement le premier drop.


# Verdict du drop reçu — correction requise avant acceptation

Import scratch puis import officiel : lint, tsc et doctor verts, 104 fichiers DS verrouillés.
Recette consolidée : cinq cas examinés, quatre défauts bloquants D1–D4 et un cas D5 conforme après correction du test.
Romain doit relancer Claude Design pour UN drop cumulatif corrigé, conservant toute la vague #244/#247/#251.
Pas de correction demandée pour la seule conservation du succès précédent en cas d’erreur du même contexte.

# Recette du drop DS 0.7.6 — corrections atelier requises

Ref #249 #247 ; conserver les demandes station 3 (#244) et refus sizing (#251) de la vague cumulative.
Le report de vague existant reste applicable. Ce complément ne remplace aucun de ses critères.

Archive réellement relue : manifest 2026-09-08,
SHA256 `e637268b1439ee4722174766a27ace92762fd212b1a9430a5a5b7f74adaff1f3`.
Les lignes ci-dessous désignent les fichiers originaux du zip sous `tatami-ds/ui/screens/`, avant lint automatique.
NOTES.md historique n'est pas la source du verdict.

## Preuve exécutable

Test de rendu des composants réels livrés, sans mock de composant DS. Les callbacks sont des espions.
Copier le test complet joint ci-dessous dans `apps/web/src/app/screens/DsDropReview.test.tsx` après import du drop.

```bash
pnpm vitest run apps/web/src/app/screens/DsDropReview.test.tsx
```

Première passe : 5 rouges en 1,66 s, dont une assertion F5 trop stricte, retirée après relecture du manifest.
Recette corrigée exécutée : **4 échoués (D1–D4), 1 passé (D5)**, durée Vitest **1,31 s**.
Log local : `/tmp/tatami-ds-076/lt-engine/review-ds-final.log`. Aucun correctif UI appliqué.

## D1 — sans chaîne, l'atelier ne rend aucun état vide

`PipelineTool.tsx:94–99` construit une liste de cartes depuis `numberSteps`, puis retourne `null` si elle est vide.
Le panneau d'identité et ses messages se trouvent après ce retour.

- Entrée : aucune ROI numérique légale (`glyphZoneIds: []`), aucune chaîne (`numberSteps: []`), aucun pipeline.
- Attendu : « Aucune ROI numérique calibrée pour cette taille. », identité de taille/capture et exécution désactivée.
- Obtenu : conteneur de rendu vide ; le message est absent.
- Correction attendue : toujours rendre les sélections et états vides ; seules les cartes nécessitent une chaîne.
  Ne pas fabriquer une chaîne de traitement pour rendre le message.

La fixture DS NO_ROI garde onze cartes fictives, ce qui ne couvre pas le cas réel où l'app n'a aucune chaîne.

## D2 — un ancien choix de glyphe est envoyé pour une nouvelle capture

`PipelineTool.tsx:76,93,104` conserve `wanted` entre rendus et l'envoie à `onRunPipeline`.
`RoomProfileWizard.tsx:169` monte ce composant sans clé de contexte.

- Geste : choisir « Sur un glyphe » sur A, choisir B, puis Exécuter.
- Attendu : annuler l'ancien index ; revenir à la portée ROI ou demander un nouveau glyphe avant exécution.
- Obtenu : callback `(s960, review-b, pot, { kind: "glyph", index: 0 })`.
- Le même état local survit à un changement de ROI ou de taille ; l'index peut viser un autre glyphe ou sortir
  de la nouvelle découpe. L'app ne peut pas corriger le choix local affiché dans le DS.
- Correction attendue : invalider le choix de glyphe avec son contexte ; ne pas déclencher de lecture automatique.
  La preuve jointe attend un retour ROI ; une sélection explicite obligatoire serait aussi conforme au contrat.

## D3 — sélection supprimée : le select natif montre une autre ROI

`PipelineSelect.tsx:106–111,116–121` passe `value=""` lorsque le choix est perdu, mais les options n'ont aucune
entrée vide. `Select.tsx` rend ces options directement dans le select HTML.

- Entrée : `pipelineZoneId: "removed"`, une seule ROI légale restante `pot`.
- Attendu : sélection visiblement invalide, sans remplacement ; possibilité de choisir explicitement `pot`.
- Obtenu : le select natif a la valeur `pot`, alors que l'identité signale une ROI perdue et Exécuter reste désactivé.
- Avec une seule option, le contrôle paraît déjà choisir cette ROI ; aucun changement de valeur ne peut matérialiser
  sa sélection. La même construction concerne le choix de capture supprimée.
- Correction attendue : option neutre explicite pour un choix invalide, afin que le choix réel déclenche le callback.

## D4 — statut stale sans ancien objet : le DS dit « Pas encore exécuté »

`PipelineTool.tsx:90` conditionne `masked` à la présence de `pipeline`.
`PipelineOverview.tsx:136–138` ne traite pas directement le statut `stale` et affiche le texte jamais exécuté
si l'app a déjà retiré les témoins périmés.

- Entrée : choix valide, `pipelineStatus: "stale"`, `pipeline: undefined`.
- Attendu : « Résultat périmé — réexécuter ».
- Obtenu : « Pas encore exécuté ».
- Correction attendue : distinguer le statut historique de l'existence des images conservées.

## D5 — erreur avec ancien succès du même contexte : conforme, non bloquant

Le manifest autorise explicitement de garder un ancien succès du même contexte pendant le rendu d'une erreur.
Le premier test exigeait la suppression de l'image : cette assertion était trop forte et a été remplacée.
L'invariant utilisateur retenu est la présence visible de la cause, de son contexte et d'une commande Réessayer.
Le DS remplit cet invariant et ne déclare pas textuellement que la lecture courante a réussi.

L'intégration app retire de son côté l'ancien résultat à la nouvelle exécution. Aucune correction DS n'est requise
sur la seule base du maintien de l'image. Ce point ne doit pas être compté parmi les blocages D1–D4.

## Autres points et limites

- BucketRail relu : à froid `onSelectSize`, à chaud `onTourSize`, tombstones désarmées en station 3.
  TourStation désarme la capture à froid ; la recette du vrai container et du driver reste distincte.
- Refus #251 relus : message verbatim par ligne/section, emplacement de ligne supprimée, commandes globales,
  `<output>` et absence de timer local. Recette du vrai HotkeysContainer + FixtureDriver : 9/9 tests verts (5,53 s), dont rollback,
  refus visible, retry persisté et disparition du refus ; restauration lecture/écriture, instant, défaut, ajout, cross-owner.
- `PipelineFrame.tsx` remplace encore une image ayant échoué par son simple libellé AVANT/APRÈS ; pas de cause
  de chargement visible ni annonce de l'échec. Point de recette supplémentaire, non compris dans les 5 tests.
- Aucun verdict de gates globales ou de comportement Windows n'est revendiqué par cette revue.

## Test portable complet

```tsx
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PipelineTool } from "../../ui/screens/PipelineTool";
import { MEASURE_PIPELINE, ROOM_PROFILE_PIPELINE_FIXTURE } from "../../ui/screens/RoomProfile.fixtures";
import { STRINGS } from "../../ui/screens/i18n";

const data = { ...ROOM_PROFILE_PIPELINE_FIXTURE, locale: "fr" as const };
const t = STRINGS.fr.roomProfileV3;
const shot = { id: "review-a", label: "Capture A", at: "now", seq: 1, primary: true };
const base = { ...MEASURE_PIPELINE, shots: [shot], activeShotId: shot.id, glyphZoneIds: ["pot"], pipelineZoneId: "pot" };

describe("drop DS 0.7.6 : contre-exemples indépendants", () => {
    it("rend l'état sans ROI quand l'app ne sert aucune chaîne", () => {
        render(<PipelineTool data={data} on={{}} measure={{ ...base, glyphZoneIds: [], numberSteps: [], pipeline: undefined }} />);
        expect(screen.getByText(t.pipelineNoZone)).toBeVisible();
        expect(screen.getByRole("button", { name: t.pipelineRun })).toBeDisabled();
    });

    it("invalide le choix de glyphe quand la capture change", () => {
        const onRunPipeline = vi.fn();
        const on = { onRunPipeline };
        const view = render(<PipelineTool data={data} on={on} measure={base} />);

        fireEvent.click(screen.getByRole("radio", { name: t.pipelineScopeGlyph }));
        view.rerender(<PipelineTool data={data} on={on} measure={{ ...base,
            shots: [{ ...shot, id: "review-b", label: "Capture B" }], activeShotId: "review-b", pipeline: undefined }} />);
        fireEvent.click(screen.getByRole("button", { name: t.pipelineRun }));
        expect(onRunPipeline).toHaveBeenLastCalledWith(data.activeSizeId, "review-b", "pot", { kind: "roi" });
    });

    it("ne sélectionne pas visuellement une ROI de remplacement après suppression", () => {
        render(<PipelineTool data={data} on={{ onOpenPipeline: vi.fn() }} measure={{ ...base, pipelineZoneId: "removed" }} />);
        expect(screen.getByRole("combobox", { name: t.zoneField })).toHaveValue("");
    });

    it("rend le statut périmé même quand l'app a retiré les anciens témoins", () => {
        render(<PipelineTool data={data} on={{}} measure={{ ...base, pipeline: undefined, pipelineStatus: "stale" }} />);
        expect(screen.getByText(t.pipelineOffContext)).toBeVisible();
    });

    it("rend cause, contexte et rejeu de l'erreur avec l'ancien succès du même contexte", () => {
        render(<PipelineTool data={data} on={{}} measure={{ ...base,
            pipelineStatus: "error", pipelineError: "lecture refusée",
            pipelineContext: { sizeId: data.activeSizeId, shotId: shot.id, zoneId: "pot" } }} />);
        expect(screen.getByText("lecture refusée")).toBeVisible();
        expect(screen.getByText(t.pipelineErrorHead(t.pipelineContextOf("960 × 600", shot.id, "pot")))).toBeVisible();
        expect(screen.getByRole("button", { name: t.pipelineRetry })).toBeEnabled();
    });
});
```
