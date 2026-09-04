# Demande durable — carte « vue moteur » du cockpit (0.7.0)

Une surface neuve : **une carte par table suivie**, dans le cockpit. Elle montre ce que le moteur de Tatami comprend de
la main en cours, avec la confiance qu'on peut lui accorder. Rien n'est superposé aux fenêtres de la room — la vue
vit dans le cockpit et nulle part ailleurs. Lecture seule : aucun callback, le joueur agit sur ses tables.

## Ce que la carte doit dire

Une carte par table ouverte, côte à côte (jusqu'à 4 en session réelle) :

- **En-tête** : identifiant de table, numéro de main, et un **badge de confiance** à trois états — Autoritatif /
  Dégradé / Perdu. Le badge est l'information la plus importante de la carte : un état faux doit être discernable
  d'un état juste d'un coup d'œil.
- **Corps** : la street, le pot, puis les trois sièges. Chaque siège porte son tapis, sa mise de street, le badge « D »
  du bouton, et se distingue quand il est **en main**, **couché**, ou **siège vide**. Le siège **à parler** est
  marqué. Le siège du héros se distingue des deux vilains.
- **Actions légales** : fold / check / call / raise (une bande min–max) / all-in. Elles n'apparaissent **qu'au niveau
  Autoritatif** ; sous ce niveau elles sont **grisées ou absentes** — Tatami montre alors ce qu'il croit voir, mais ne
  conseille rien. Le cœur ne les envoie même pas : la vue reçoit `legal: null`.
- **« Hors décision »** : le héros s'est couché ou est à tapis, la main continue entre les vilains. La carte le dit et
  cesse de mettre l'état en avant.
- **Aucune main suivie** (`state` absent) : la carte n'affiche ni pot ni sièges — juste son attente. Jamais un zéro de
  repli à la place d'une valeur qui n'a pas été lue.

## Props servies par l'app (forme exacte, à reprendre telle quelle)

```ts
type EngineLevel = "authoritative" | "degraded" | "lost";

interface EngineSeatRow {
    seat: number;          // 1..3, absolu
    hero: boolean;
    stack: number;
    contribution: number;  // mise de la street
    inHand: boolean;
    dealer: boolean;
    occupied: boolean;
    toAct: boolean;
}

interface EngineLegalRow {
    fold: boolean; check: boolean;
    call: number | null; raiseMin: number | null; raiseMax: number | null; allIn: number | null;
}

interface EngineCardState { street: string; pot: number; seats: EngineSeatRow[]; legal: EngineLegalRow | null; }

interface EngineTableCard {
    tableId: number;
    level: EngineLevel;
    hand: string | null;
    outOfDecision: boolean;
    state: EngineCardState | null;   // null = aucune main suivie
}

interface EngineViewData { tables: EngineTableCard[] }
```

Les montants sont des entiers dans l'unité d'affichage de la room (jetons ou BB, voir la demande
`roomprofile-display-unit-presence.md`) ; la carte les rend tels quels, sans conversion.

## Clés i18n `engineView.*` (FR / EN), dans `ui/screens/i18n.ts`

| Clé | FR | EN |
|---|---|---|
| `engineView.title` | Vue moteur | Engine view |
| `engineView.table` | Table {id} | Table {id} |
| `engineView.hand` | Main {hand} | Hand {hand} |
| `engineView.noHand` | Aucune main suivie | No hand tracked |
| `engineView.awaiting` | En attente de la prochaine main | Waiting for the next hand |
| `engineView.level.authoritative` | Autoritatif | Authoritative |
| `engineView.level.degraded` | Dégradé | Degraded |
| `engineView.level.lost` | Perdu | Lost |
| `engineView.outOfDecision` | Hors décision | Out of decision |
| `engineView.pot` | Pot | Pot |
| `engineView.street.preflop` | Préflop | Preflop |
| `engineView.street.flop` | Flop | Flop |
| `engineView.street.turn` | Turn | Turn |
| `engineView.street.river` | River | River |
| `engineView.street.showdown` | Abattage | Showdown |
| `engineView.seat.hero` | Héros | Hero |
| `engineView.seat.villain` | Vilain {n} | Villain {n} |
| `engineView.seat.dealer` | D | D |
| `engineView.seat.toAct` | À parler | To act |
| `engineView.seat.folded` | Couché | Folded |
| `engineView.seat.empty` | Siège vide | Empty seat |
| `engineView.seat.stack` | Tapis | Stack |
| `engineView.seat.bet` | Mise | Bet |
| `engineView.legal.title` | Actions légales | Legal actions |
| `engineView.legal.none` | Aucune action conseillée | No action advised |
| `engineView.legal.fold` | Se coucher | Fold |
| `engineView.legal.check` | Checker | Check |
| `engineView.legal.call` | Suivre {amount} | Call {amount} |
| `engineView.legal.raise` | Relancer {min}–{max} | Raise {min}–{max} |
| `engineView.legal.allIn` | Tapis {amount} | All-in {amount} |

## Où elle vit

L'app monte déjà un container qui fournit `EngineViewData` et rend `null` tant qu'aucune table n'est suivie. C'est à
toi de dire où la carte vit dans le cockpit — une bande sous la barre du haut, un panneau de l'écran des layouts, ou
une surface à elle — et de réserver cette place dans `AppShell` : la place fait partie du drop, l'app ne la choisit pas.
La fixture de l'écran doit couvrir les trois niveaux, « hors décision », « aucune main suivie » et deux tables.
