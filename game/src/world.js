// The game state: levels, found differences, the clock, the score, hints and
// misses. The world knows nothing about drawing; the renderer reads its state.

import { DIFFS_PER_LEVEL, FIND_POINTS, HINTS_PER_LEVEL, HINT_COST, LEVEL_SECONDS, MISS_PENALTY, TIME_BONUS_PER_SECOND } from './config.js';
import { LEVELS } from './scenes.js';

export const EVENT_NONE = 0;
export const EVENT_FOUND = 1 << 0;
export const EVENT_MISS = 1 << 1;
export const EVENT_LEVEL_DONE = 1 << 2;
export const EVENT_GAME_OVER = 1 << 3;
export const EVENT_HINT = 1 << 4;
export const EVENT_TIMEOUT = 1 << 5;

export function createWorld() {
  const state = {
    screen: 'title',
    level: 0,
    found: new Set(),
    hinted: -1,
    hintUntil: 0,
    hintsLeft: HINTS_PER_LEVEL,
    score: 0,
    misses: 0,
    timeLeft: LEVEL_SECONDS,
    elapsed: 0,
    best: 0,
    levelBonus: 0,
    lastFoundLabel: '',
    flash: null,
  };

  function diffs() {
    return LEVELS[state.level].diffs;
  }

  function reset() {
    state.screen = 'title';
    state.level = 0;
    state.found = new Set();
    state.hinted = -1;
    state.hintUntil = 0;
    state.hintsLeft = HINTS_PER_LEVEL;
    state.score = 0;
    state.misses = 0;
    state.timeLeft = LEVEL_SECONDS;
    state.elapsed = 0;
    state.levelBonus = 0;
    state.lastFoundLabel = '';
    state.flash = null;
  }

  function startLevel(index) {
    state.level = index;
    state.found = new Set();
    state.hinted = -1;
    state.hintUntil = 0;
    state.hintsLeft = HINTS_PER_LEVEL;
    state.timeLeft = LEVEL_SECONDS;
    state.elapsed = 0;
    state.levelBonus = 0;
    state.lastFoundLabel = '';
    state.flash = null;
    state.screen = 'play';
  }

  function startGame() {
    state.score = 0;
    state.misses = 0;
    startLevel(0);
  }

  /** A click in panel-local coordinates (x, y) of panel `side` (0 left, 1 right). */
  function click(x, y) {
    if (state.screen !== 'play') return EVENT_NONE;
    const list = diffs();
    for (let i = 0; i < list.length; i += 1) {
      if (state.found.has(i)) continue;
      const d = list[i];
      const dx = x - d.x;
      const dy = y - d.y;
      if (dx * dx + dy * dy <= d.r * d.r) {
        state.found.add(i);
        state.score += FIND_POINTS;
        state.lastFoundLabel = d.label;
        state.flash = { x, y, side: 0, kind: 'found', until: state.elapsed + 0.6 };
        if (state.found.size === list.length) {
          state.levelBonus = Math.ceil(state.timeLeft) * TIME_BONUS_PER_SECOND;
          state.score += state.levelBonus;
          state.screen = state.level === LEVELS.length - 1 ? 'win' : 'leveldone';
          if (state.screen === 'win' && state.score > state.best) state.best = state.score;
          return EVENT_FOUND | EVENT_LEVEL_DONE;
        }
        return EVENT_FOUND;
      }
    }
    state.misses += 1;
    state.score = Math.max(0, state.score - MISS_PENALTY);
    state.flash = { x, y, side: 0, kind: 'miss', until: state.elapsed + 0.5 };
    return EVENT_MISS;
  }

  /** Highlight one unfound difference for a couple of seconds. */
  function hint() {
    if (state.screen !== 'play' || state.hintsLeft <= 0) return EVENT_NONE;
    const list = diffs();
    for (let i = 0; i < list.length; i += 1) {
      if (!state.found.has(i)) {
        state.hintsLeft -= 1;
        state.score = Math.max(0, state.score - HINT_COST);
        state.hinted = i;
        state.hintUntil = state.elapsed + 2.5;
        return EVENT_HINT;
      }
    }
    return EVENT_NONE;
  }

  function tick(dt) {
    if (state.screen !== 'play') return EVENT_NONE;
    state.elapsed += dt;
    state.timeLeft -= dt;
    if (state.hinted >= 0 && state.elapsed > state.hintUntil) state.hinted = -1;
    if (state.flash && state.elapsed > state.flash.until) state.flash = null;
    if (state.timeLeft <= 0) {
      state.timeLeft = 0;
      state.screen = 'over';
      return EVENT_TIMEOUT | EVENT_GAME_OVER;
    }
    return EVENT_NONE;
  }

  function foundCount() {
    return state.found.size;
  }

  function remaining() {
    return DIFFS_PER_LEVEL - state.found.size;
  }

  return { state, diffs, reset, startGame, startLevel, click, hint, tick, foundCount, remaining };
}
