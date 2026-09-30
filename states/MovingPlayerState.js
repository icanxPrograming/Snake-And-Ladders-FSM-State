export class MovingPlayerState {
  enter(context) {
    const event = context.event;
    if (event?.kind === "move") {
      context.actions.movePlayer(event);
    } else if (event?.kind === "ladder") {
      context.actions.animateLadder(event);
    } else if (event?.kind === "snake") {
      context.actions.animateSnake(event);
    }
  }
}
