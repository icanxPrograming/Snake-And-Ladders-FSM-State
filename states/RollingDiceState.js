export class RollingDiceState {
  enter(context) {
    context.actions.rollDice(context.event?.playerNumber);
  }
}
