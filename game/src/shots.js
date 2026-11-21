// The screenshot scenes behind ?shot=start|play|end. Each one stages a real
// game state and paints it, so the frame is what a short game really looks like
// and the same seed always gives the same frame.

import { SCREEN_LEVELDONE, SCREEN_PLAY, SCREEN_TITLE } from './render.js';

/**
 * Set the world to the named scene (start, play or end; any other name is
 * start) and return the screen to draw over it and the best score to show.
 */
export function stageShot(name, world) {
  world.reset();
  if (name !== 'play' && name !== 'end') {
    return { screen: SCREEN_TITLE, best: 0 };
  }
  if (name === 'play') {
    // Mid-game: three of the seven differences already found, four still to
    // find, markers on the found ones and the counter showing what is left.
    world.startGame();
    for (let i = 0; i < 3; i += 1) {
      const d = world.diffs()[i];
      world.click(d.x, d.y);
    }
    return { screen: SCREEN_PLAY, best: 0 };
  }
  // End: every difference found, the level-clear screen over the pictures.
  world.startGame();
  for (const d of world.diffs()) world.click(d.x, d.y);
  return { screen: SCREEN_LEVELDONE, best: world.state.score };
}
