// Paints the game: the HUD, the two picture panels with their markers, and the
// title, pause, level-done, game-over and win screens over them.

import { FIELD, MARK_RADIUS, PALETTE, PANEL } from './config.js';
import { LEVELS, drawScene } from './scenes.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_LEVELDONE = 'leveldone';
export const SCREEN_OVER = 'over';
export const SCREEN_WIN = 'win';

const FULL_MASK = new Set([0, 1, 2, 3, 4, 5, 6]);
const EMPTY_MASK = new Set();

export function createRenderer(canvas) {
  const g = canvas.getContext('2d');
  const scale = { x: 1, y: 1 };

  function fit() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = FIELD.width * dpr;
    canvas.height = FIELD.height * dpr;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    scale.x = canvas.clientWidth / FIELD.width;
    scale.y = canvas.clientHeight / FIELD.height;
  }

  function text(str, x, y, size, color, align = 'left', weight = '600') {
    g.fillStyle = color;
    g.font = `${weight} ${size}px system-ui, -apple-system, "Segoe UI", sans-serif`;
    g.textAlign = align;
    g.textBaseline = 'middle';
    g.fillText(str, x, y);
  }

  function panelLabel(x, letter) {
    g.fillStyle = PALETTE.hud;
    g.beginPath();
    g.arc(x, PANEL.y - 14, 15, 0, Math.PI * 2);
    g.fill();
    text(letter, x, PANEL.y - 13, 18, PALETTE.text, 'center', '800');
  }

  function drawPanels(state) {
    const level = LEVELS[state.level];
    // Left picture: the base scene. Right picture: the same scene with all
    // seven differences applied.
    for (const [px, mask] of [[PANEL.leftX, EMPTY_MASK], [PANEL.rightX, FULL_MASK]]) {
      g.save();
      g.translate(px, PANEL.y);
      drawScene(g, state.level, mask);
      g.restore();
      g.strokeStyle = PALETTE.panelBorder;
      g.lineWidth = 3;
      g.strokeRect(px, PANEL.y, PANEL.width, PANEL.height);
    }
    panelLabel(PANEL.leftX + 18, 'A');
    panelLabel(PANEL.rightX + 18, 'B');

    // Markers on the differences already found, on both pictures.
    for (const i of state.found) {
      const d = level.diffs[i];
      for (const px of [PANEL.leftX, PANEL.rightX]) {
        g.strokeStyle = PALETTE.foundRing;
        g.lineWidth = 4;
        g.beginPath();
        g.arc(px + d.x, PANEL.y + d.y, MARK_RADIUS, 0, Math.PI * 2);
        g.stroke();
        g.strokeStyle = 'rgba(255, 255, 255, 0.85)';
        g.lineWidth = 2;
        g.beginPath();
        g.arc(px + d.x, PANEL.y + d.y, MARK_RADIUS - 5, 0, Math.PI * 2);
        g.stroke();
      }
    }

    // Hint: a pulsing ring around one unfound difference, on both pictures.
    if (state.hinted >= 0) {
      const d = level.diffs[state.hinted];
      const pulse = 3 + Math.sin(performance.now() / 150) * 2;
      for (const px of [PANEL.leftX, PANEL.rightX]) {
        g.strokeStyle = PALETTE.hint;
        g.lineWidth = pulse;
        g.beginPath();
        g.arc(px + d.x, PANEL.y + d.y, MARK_RADIUS + 4, 0, Math.PI * 2);
        g.stroke();
      }
    }

    // A wrong click flashes a red cross where it landed.
    if (state.flash) {
      const f = state.flash;
      const cx = PANEL.leftX + f.x;
      const cy = PANEL.y + f.y;
      g.strokeStyle = f.kind === 'found' ? PALETTE.found : PALETTE.miss;
      g.lineWidth = 4;
      if (f.kind === 'miss') {
        g.beginPath();
        g.moveTo(cx - 12, cy - 12);
        g.lineTo(cx + 12, cy + 12);
        g.moveTo(cx + 12, cy - 12);
        g.lineTo(cx - 12, cy + 12);
        g.stroke();
      }
    }
  }

  function drawHud(state, best) {
    g.fillStyle = PALETTE.hud;
    g.fillRect(0, 0, FIELD.width, 64);
    const level = LEVELS[state.level];
    text('LANTERN BAY', 24, 22, 20, PALETTE.text, 'left', '800');
    text(`${level.name} — ${level.sub}`, 24, 46, 13, PALETTE.muted);
    const mins = Math.floor(Math.max(0, state.timeLeft) / 60);
    const secs = Math.floor(Math.max(0, state.timeLeft) % 60);
    const clock = `${mins}:${String(secs).padStart(2, '0')}`;
    text(clock, 640, 32, 30, state.timeLeft <= 15 && state.screen === 'play' ? PALETTE.miss : PALETTE.text, 'center', '800');
    text(`SCORE ${state.score}`, 900, 22, 18, PALETTE.text, 'left', '700');
    text(`BEST ${Math.max(best, state.score)}`, 900, 46, 13, PALETTE.muted);
    const found = state.found.size;
    text(`${found} / 7 found · ${7 - found} left`, 1256, 22, 18, PALETTE.accent, 'right', '700');
    text(`Hints ${state.hintsLeft}  (H)`, 1256, 46, 13, PALETTE.muted, 'right');
  }

  function drawFooter(state) {
    g.fillStyle = PALETTE.hud;
    g.fillRect(0, 624, FIELD.width, 96);
    text('Click a difference in either picture.  H — hint (−50) · P — pause · R — restart level', 24, 652, 15, PALETTE.muted);
    text('Find all 7 to clear the level. A wrong click costs 10 points.', 24, 678, 15, PALETTE.muted);
    if (state.lastFoundLabel) {
      text(`Found: ${state.lastFoundLabel}!`, 1256, 652, 15, PALETTE.found, 'right', '700');
    }
    text(`Level ${state.level + 1} of ${LEVELS.length}`, 1256, 678, 15, PALETTE.muted, 'right');
  }

  function overlay(title, lines, accent) {
    g.fillStyle = PALETTE.overlay;
    g.fillRect(0, 0, FIELD.width, FIELD.height);
    g.fillStyle = PALETTE.hud;
    const w = 640;
    const h = 110 + lines.length * 34;
    g.fillRect((FIELD.width - w) / 2, (FIELD.height - h) / 2, w, h);
    g.strokeStyle = accent;
    g.lineWidth = 3;
    g.strokeRect((FIELD.width - w) / 2, (FIELD.height - h) / 2, w, h);
    text(title, FIELD.width / 2, (FIELD.height - h) / 2 + 52, 40, accent, 'center', '800');
    lines.forEach((line, i) => {
      text(line, FIELD.width / 2, (FIELD.height - h) / 2 + 104 + i * 34, 18, PALETTE.text, 'center');
    });
  }

  function draw(state, screen, best) {
    fit();
    g.fillStyle = PALETTE.backdrop;
    g.fillRect(0, 0, FIELD.width, FIELD.height);
    drawPanels(state);
    drawHud(state, best);
    drawFooter(state);

    if (screen === SCREEN_TITLE) {
      overlay('LANTERN BAY', [
        'Spot the difference — two pictures, seven hidden changes.',
        'Click a difference in either picture to mark it.',
        'Find all 7 before the clock runs out.',
        '',
        'Click or press Space to start',
      ], PALETTE.accent);
    } else if (screen === SCREEN_PAUSED) {
      overlay('PAUSED', ['Press P or click to carry on.'], PALETTE.muted);
    } else if (screen === SCREEN_LEVELDONE) {
      const level = LEVELS[state.level];
      const next = LEVELS[state.level + 1];
      overlay('LEVEL CLEAR!', [
        `${level.name} — all 7 differences found.`,
        `Time bonus +${state.levelBonus} points.`,
        '',
        next ? `Next: ${next.name} — ${next.sub}` : '',
        'Click or press Space for the next picture',
      ], PALETTE.found);
    } else if (screen === SCREEN_OVER) {
      overlay("TIME'S UP", [
        `You found ${state.found.size} of 7 differences.`,
        `Score ${state.score}.`,
        '',
        'Click or press Space to try this picture again',
      ], PALETTE.miss);
    } else if (screen === SCREEN_WIN) {
      overlay('YOU FOUND THEM ALL!', [
        'Every difference in all three pictures.',
        `Final score ${state.score}. Best ${Math.max(best, state.score)}.`,
        '',
        'Click or press Space to play again',
      ], PALETTE.accent);
    }
  }

  return { draw };
}
