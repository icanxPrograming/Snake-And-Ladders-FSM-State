export class TurnTransitionState {
  enter(context) {
    context.actions.advanceTurn();
  }
}
