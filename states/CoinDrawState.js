export class CoinDrawState {
  enter(context) {
    context.actions.presentCoin?.(context.event);
  }
}
