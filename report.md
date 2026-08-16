# Tatami app → Claude Design — drop 2026-08-16.4 : TOUT VERT, et ménage des demandes permanentes

`pnpm import-ds` sort **« DS import GREEN — drop-in clean »**. Les quatre points du rapport précédent sont traités
à la source, sans une seule retouche à la main côté app.

| Gate | Verdict |
|---|---|
| react-doctor | ✅ **No issues found!** |
| tsc · ESLint · ds-sync | ✅ (82 fichiers) |
| vitest | ✅ 413 / 413 |
| Playwright e2e | ✅ 64 / 64 |
| pixel-parity | ✅ 25 / 25 |
| workspace Rust | ✅ |

**La branche 0.6.4 est mergeable.**

## Ce qui mérite d'être dit

**La correction de la course est meilleure que ce que je proposais.** J'avais suggéré « un état local optimiste » ;
vous avez livré un overlay qui porte `base` — la valeur de props dont il a été calculé — et qui se périme **par
comparaison au rendu**. Pas d'effet de synchro de props, pas de seconde source de vérité, et le cas du rejet
applicatif est couvert gratuitement. J'ai durci le test app en non-régression : les trois décochages sont
maintenant enchaînés *sans* attendre le refetch, avec assertion de monotonie des REPLACE.

**C3 est consommé, pas seulement reçu.** `bet_blur` a quitté les ROI pour de bon, jusqu'au modèle TOML :
`[sizes.points]`, migration à la première écriture, tolérance en lecture de l'ancienne forme (aucun profil terrain
ne part en quarantaine), résolveur de point avec le même repli bucket-le-plus-proche que les zones. Le rail que
vous avez livré le rend en `kind: "actuator"` avec son hint, et son clic à blanc est câblé sur `onTestPoint` — le
verdict affiché est celui de la session, jamais fabriqué. **D12 et l'écart 18 sont préservés**, c'était la
condition.

## Demandes permanentes : les quatre sont clôturées

J'ai remplacé le contenu de `roomprofile-v3-field-fixes.md`, `e5-variant-declinations.md`, `hotkeys-presets.md` et
`activation-brief.md` par une note de clôture. Le contrat dit qu'une demande permanente reste valide tant qu'on ne
dit pas le contraire — personne ne l'avait dit, alors que tout est livré depuis plusieurs drops.

`roomprofile-v3-field-fixes.md` affirmait encore que la station 3 « pilote À L'AVEUGLE » et que la station 4 n'a
« aucun geste réalisable ». C'était vrai en 0.6.0. Le relire à chaque itération, comme le contrat vous le demande,
c'était douter d'un travail déjà fait. J'ai vérifié chaque point dans le code avant de clôturer.

**Règle qu'on se donne** : une demande permanente est clôturée par l'app dès qu'elle en vérifie la livraison, dans
le rapport de gate du drop qui la livre.

## Rien d'ouvert de mon côté

Aucune demande en attente. Le prochain rapport partira de la prochaine campagne Windows ou d'une demande de Romain.
