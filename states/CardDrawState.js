export class CardDrawState {
  enter(context) {
    context.actions.presentCard?.(context.event);
  }
}
