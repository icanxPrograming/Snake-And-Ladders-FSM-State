export class CardResultState {
  enter(context) {
    context.actions.presentCardResult?.(context.event);
  }
}
