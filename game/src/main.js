// Boot and the one loop: input is read every frame, the world advances in
// fixed 1/60 s steps, and the renderer paints what is there. The game moves
// between six screens: title, play, paused, level done, game over and win.
//
// ?seed=N fixes the picture pattern. ?shot=start|play|end (with &seed=N)
// stages that scene instead of running the loop, paints it twice and sets
// window.__shotReady for a screenshot.
import { BEST_KEY, STEP } from './config.js';
import { createWorld, EVENT_FOUND, EVENT_GAME_OVER, EVENT_HINT, EVENT_LEVEL_DONE, EVENT_MISS } from './world.js';
import { ACTION_CONFIRM, ACTION_HINT, ACTION_PAUSE, ACTION_RESTART, createInput } from './input.js';
import { createRenderer, SCREEN_LEVELDONE, SCREEN_OVER, SCREEN_PAUSED, SCREEN_PLAY, SCREEN_TITLE, SCREEN_WIN } from './render.js';
import { stageShot } from './shots.js';

/** The longest frame the loop catches up on; a longer stall is dropped. */
const MAX_FRAME = 0.25;

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const world = createWorld();
const renderer = createRenderer(canvas);

/** Tiny synth blips (no audio files): a soft chime on a find, a low buzz on a miss. */
let audio = null;
function beep(freq, seconds, type, gainValue) {
  try {
    audio = audio || new (window.AudioContext || window.webkitAudioContext)();
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(gainValue, audio.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + seconds);
    osc.connect(gain);
    gain.connect(audio.destination);
    osc.start();
    osc.stop(audio.currentTime + seconds);
  } catch {
    // Sound is a garnish: a browser without audio still plays fine.
  }
}

function readBest() {
  try {
    return Number.parseInt(window.localStorage.getItem(BEST_KEY) ?? '0', 10) || 0;
  } catch {
    return 0;
  }
}

function saveBest(value) {
  try {
    window.localStorage.setItem(BEST_KEY, String(value));
  } catch {
    // Storage can be off (private windows): the best score then lasts this visit only.
  }
}

function runShot(name) {
  const scene = stageShot(name, world);
  let painted = 0;
  function paint() {
    renderer.draw(world.state, scene.screen, scene.best);
    painted += 1;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  }
  requestAnimationFrame(paint);
}

function runGame() {
  const input = createInput(canvas);
  let screen = SCREEN_TITLE;
  let best = readBest();
  let accumulator = 0;
  let last = performance.now();

  function announce(message) {
    status.textContent = message;
  }

  function startGame() {
    world.startGame();
    screen = SCREEN_PLAY;
    announce('Playing. Find 7 differences before the clock runs out.');
  }

  function endGame() {
    screen = SCREEN_OVER;
    announce(`Time's up. Score ${world.state.score}.`);
  }

  function handleActions() {
    const actions = input.takeActions();
    if (actions & ACTION_RESTART && (screen === SCREEN_PLAY || screen === SCREEN_PAUSED)) {
      world.startLevel(world.state.level);
      screen = SCREEN_PLAY;
      announce('Level restarted.');
    } else if (actions & ACTION_HINT && screen === SCREEN_PLAY) {
      const event = world.hint();
      if (event & EVENT_HINT) {
        beep(880, 0.15, 'sine', 0.08);
        announce('Hint: look at the glowing ring.');
      }
    } else if (actions & ACTION_CONFIRM && screen === SCREEN_TITLE) {
      startGame();
    } else if (actions & ACTION_CONFIRM && screen === SCREEN_LEVELDONE) {
      world.startLevel(world.state.level + 1);
      screen = SCREEN_PLAY;
      announce('Next picture. Find 7 differences.');
    } else if (actions & ACTION_CONFIRM && (screen === SCREEN_OVER || screen === SCREEN_WIN)) {
      startGame();
    } else if (actions & ACTION_PAUSE && screen === SCREEN_PLAY) {
      screen = SCREEN_PAUSED;
      announce('Paused.');
    } else if (actions & (ACTION_PAUSE | ACTION_CONFIRM) && screen === SCREEN_PAUSED) {
      screen = SCREEN_PLAY;
      announce('Playing.');
    }
  }

  function handleClicks() {
    if (screen !== SCREEN_PLAY) return;
    for (const click of input.takeClicks()) {
      const event = world.click(click.x, click.y);
      if (event & EVENT_FOUND) {
        beep(660, 0.12, 'sine', 0.12);
        setTimeout(() => beep(990, 0.18, 'sine', 0.12), 90);
        if (event & EVENT_LEVEL_DONE) {
          if (world.state.screen === SCREEN_WIN) {
            screen = SCREEN_WIN;
            if (world.state.score > best) {
              best = world.state.score;
              saveBest(best);
            }
            announce(`You found them all! Final score ${world.state.score}.`);
          } else {
            screen = SCREEN_LEVELDONE;
            announce(`Level clear! Time bonus ${world.state.levelBonus}.`);
          }
        } else {
          announce(`Found: ${world.state.lastFoundLabel}. ${world.remaining()} left.`);
        }
      } else if (event & EVENT_MISS) {
        beep(160, 0.15, 'square', 0.06);
        announce('Not a difference. Ten points off.');
      }
    }
  }

  function step(dt) {
    const event = world.tick(dt);
    if (event & EVENT_GAME_OVER) endGame();
  }

  function frame(now) {
    requestAnimationFrame(frame);
    accumulator += Math.min((now - last) / 1000, MAX_FRAME);
    last = now;
    handleActions();
    handleClicks();
    if (screen === SCREEN_PLAY) {
      while (accumulator >= STEP) {
        step(STEP);
        accumulator -= STEP;
        if (screen !== SCREEN_PLAY) break;
      }
    } else {
      accumulator = 0;
    }
    renderer.draw(world.state, screen, best);
  }

  // Leaving the tab pauses a running game rather than letting the clock run unseen.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && screen === SCREEN_PLAY) {
      screen = SCREEN_PAUSED;
      announce('Paused.');
    }
  });

  announce('Lantern Bay. Press Space or click to start.');
  requestAnimationFrame(frame);
}

if (shot) runShot(shot);
else runGame();
