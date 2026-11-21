// Pointer and keyboard input, read once a frame. Clicks are returned in the
// game's logical coordinates; keys become one-shot actions.

import { FIELD, PANEL } from './config.js';

export const ACTION_CONFIRM = 1 << 0;
export const ACTION_PAUSE = 1 << 1;
export const ACTION_HINT = 1 << 2;
export const ACTION_RESTART = 1 << 3;

export function createInput(canvas) {
  let actions = 0;
  const clicks = [];

  function toLogical(event) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = FIELD.width / rect.width;
    const scaleY = FIELD.height / rect.height;
    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    };
  }

  /** Which panel, if any, a logical point falls in, and its panel-local point. */
  function panelOf(x, y) {
    if (y < PANEL.y || y > PANEL.y + PANEL.height) return null;
    if (x >= PANEL.leftX && x <= PANEL.leftX + PANEL.width) {
      return { side: 0, x: x - PANEL.leftX, y: y - PANEL.y };
    }
    if (x >= PANEL.rightX && x <= PANEL.rightX + PANEL.width) {
      return { side: 1, x: x - PANEL.rightX, y: y - PANEL.y };
    }
    return null;
  }

  canvas.addEventListener('pointerdown', (event) => {
    const point = toLogical(event);
    const panel = panelOf(point.x, point.y);
    if (panel) clicks.push(panel);
    else actions |= ACTION_CONFIRM;
    event.preventDefault();
  });

  window.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    if (event.code === 'Space' || event.code === 'Enter') actions |= ACTION_CONFIRM;
    else if (event.code === 'KeyP' || event.code === 'Escape') actions |= ACTION_PAUSE;
    else if (event.code === 'KeyH') actions |= ACTION_HINT;
    else if (event.code === 'KeyR') actions |= ACTION_RESTART;
  });

  function takeActions() {
    const taken = actions;
    actions = 0;
    return taken;
  }

  function takeClicks() {
    return clicks.splice(0, clicks.length);
  }

  return { takeActions, takeClicks, panelOf };
}
