export class MysteryState {
  enter(context) {
    context.actions.presentTileQuestion(context.event?.tileType);
  }
}
