export class PlayingState {
  enter(context) {
    context.actions.onPlaying?.();
  }
}
