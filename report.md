# Tatami app → Claude Design — v3.5 : parité 23/25, et il ne reste QUE deux choses

Drop excellent. Tes deux demandes d'enrichissement étaient justes et sont **livrées côté backend** :

- **`StationStatusDto.count`** — le nombre de points de métrologie persistés. Champ **distinct**, pas
  `done`/`total` : « 14 points » est un compte sans dénominateur, le glisser dans un ratio aurait affirmé une cible
  qui n'existe pas (la campagne sonde autant de tailles qu'il en faut). Zéro point rend `null` et non `0` — un
  profil mesuré par une version qui ne persistait pas les points a bien été mesuré, sa date le dit.
- **`ReadinessLineStateDto = "ok" | "stale" | "missing"`** — tu avais raison : « mesuré mais périmé » n'est pas
  « jamais mesuré », ce n'est pas la même action. Deux lignes le portent honnêtement (`variants`, `dry_runs`) ; les
  cinq autres restent binaires et on te dit pourquoi : la géométrie `[[sizes]]` n'est pas datée (sa péremption
  s'écrit en zone projetée, pas en date), les sondes/glyphes ne sont délibérément pas re-comparés au plancher, et
  `metrology.measured_at` **est** le plancher — il ne peut pas être antérieur à lui-même. `stale` **décrit** un
  rouge, il n'en crée pas : le badge reste la conjonction stricte.

Tes libellés i18n sont consommés, l'ordre des lignes est aligné, les 3 incohérences de fixtures et les 5 défauts
a11y sont vérifiés corrigés. **Parité passée à 23/25** — `rooms-stations` est vert (0,31 %).

Il reste **deux points**, et ce sont les derniers avant qu'on ouvre la MR.

---

## 1 — Un diagnostic `react-doctor`, et on a le correctif exact

`ui/screens/GlyphTool.tsx:65` — *Performance: Array lookup inside a loop*. C'est le `allowed.includes(z.id)` dans
la boucle du `zoneOptions` que tu viens d'ajouter (§6). Notre gate CI `quality` est bloquante à zéro diagnostic,
donc c'est **la seule chose qui empêche `make ci` de sortir 0** chez nous.

On a vérifié le correctif chez nous (puis restauré ton fichier à l'octet près — on ne touche pas à `ui/`) : hisser
le lookup en `Set` hors de la boucle **élimine le diagnostic**, sortie `No issues found!`. Le patch exact :

```tsx
function zoneOptions(zones: Zone[], allowed: string[] | undefined): SelectOptionLike[] {
    const out: SelectOptionLike[] = [];
    const placed = allowed === undefined ? null : new Set(allowed);   // ← hors boucle

    for (const z of zones) {
        if (placed !== null) {
            if (!placed.has(z.id)) continue;                          // ← Set.has
        } else if (z.readKind !== "number" && z.readKind !== "card") continue;

        out.push({ value: z.id, label: z.full ?? z.label });
    }
    …
```

## 2 — Le score et le compteur de blockers : deux formules, il en faut une

C'est tout ce qui reste de la parité. Les boîtes sont **identiques au pixel** des deux côtés (380×250) : plus
aucune divergence de mise en page, seulement deux nombres.

| | ton prototype | l'app |
|---|---|---|
| score | **36 %** (`LINE_WEIGHT` : ok=1, warn=0.5, ko/pending=0) | **63 %** (1/7 par ligne ; une ligne rouge vaut le `done/total` de sa station quand un compte la démontre) |
| blockers | **3** (tes seuls `ko`) | **5** (toutes les lignes non vertes) |

**Sur le score** : c'est une décision de design, pas d'ingénierie — combien vaut une ligne à moitié faite ? **Tranche,
et on implémente ta formule à l'identique.** Si c'est la pondération 1/0.5/0, dis-le et on la prend : elle est plus
simple et plus prévisible que la nôtre. Maintenant que le tri-état existe, tu as la donnée qu'il te faut pour la
calculer côté fixture comme on la calculera côté app.

**Sur les blockers** : là on penche pour notre lecture, et voici l'argument — `write_profile` refuse sur toute ligne
**non verte**, périmée comprise. Une évidence périmée bloque l'écriture du profil exactement comme une évidence
absente ; l'annoncer « non bloquante » enverrait le mainteneur cliquer sur un bouton qui refusera. Si tu es d'accord,
compte les non-vertes (`ok` exclus) et nos deux nombres convergent.

---

## Recette

Après ton export : `pnpm import-ds`, `make ci` (on vise **exit 0**), e2e, et pixel-parity (on vise **25/25**). Si
ces deux points tombent, **on ouvre la MR dans la foulée** — tout le reste est vert : tsc 0, lint 0, ds-sync 77/77,
1123 tests Rust, 389 Vitest, 64 e2e.

## Rappel

`hotkeys-presets.md` (0.5.1) attend toujours sur l'échange, indépendante de v3.
