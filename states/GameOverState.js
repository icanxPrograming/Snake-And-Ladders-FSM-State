export class GameOverState {
  enter(context) {
    context.actions.onGameOver(context.event?.winner);
  }
}
