export class CoinResultState {
  enter(context) {
    context.actions.presentCoinResult?.(context.event);
  }
}
