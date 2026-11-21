// Tuning numbers and colours for Lantern Bay, a spot-the-difference game.
// The playfield is a fixed 1280x720 logical area; the renderer scales it to the
// window, so no rule below depends on the screen size.

export const FIELD = { width: 1280, height: 720 };

/** The simulation's fixed step, in seconds: 60 updates a second whatever the display rate. */
export const STEP = 1 / 60;

/** The two picture panels, side by side. */
export const PANEL = { width: 600, height: 520, y: 84, leftX: 24, rightX: 656, gap: 32 };

/** Seconds on the clock for each level. */
export const LEVEL_SECONDS = 90;

/** How many differences each picture pair hides. */
export const DIFFS_PER_LEVEL = 7;

/** Hints per level, and what each costs. */
export const HINTS_PER_LEVEL = 3;
export const HINT_COST = 50;

/** Points for a find, and the penalty for a wrong click. */
export const FIND_POINTS = 100;
export const MISS_PENALTY = 10;

/** Time bonus per second left when a level is cleared. */
export const TIME_BONUS_PER_SECOND = 5;

/** Hit-test radius around each difference, in panel pixels. */
export const HIT_RADIUS = 30;

/** Marker circle radius drawn on a found difference. */
export const MARK_RADIUS = 26;

export const PALETTE = {
  backdrop: '#101623',
  hud: '#1a2233',
  panelBorder: '#3a4a66',
  text: '#f2ead8',
  muted: '#9aa7bd',
  accent: '#f2c94c',
  found: '#58d68d',
  foundRing: '#2ecc71',
  miss: '#e5534b',
  hint: '#f2c94c',
  button: '#2b3a55',
  buttonText: '#f2ead8',
  overlay: 'rgba(8, 12, 22, 0.72)',
};

export const FONT = 'system-ui, -apple-system, "Segoe UI", sans-serif';

/** Where the best score is kept between visits (this browser only). */
export const BEST_KEY = 'lantern-bay.best';
