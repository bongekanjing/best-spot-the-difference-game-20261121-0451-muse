// The three picture pairs. Each level draws one scene twice: the left picture is
// the base scene, the right picture is the same scene with seven differences
// applied. A difference is a small, fair visual change with a fixed spot and a
// name; the player finds it by clicking that spot in either picture.
//
// All decoration uses a seeded random generator created fresh for each draw, so
// both pictures match exactly except for the differences.

import { createRandom } from './random.js';

function circle(g, x, y, r, fill) {
  g.fillStyle = fill;
  g.beginPath();
  g.arc(x, y, r, 0, Math.PI * 2);
  g.fill();
}

function ellipse(g, x, y, rx, ry, fill) {
  g.fillStyle = fill;
  g.beginPath();
  g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  g.fill();
}

function rect(g, x, y, w, h, fill) {
  g.fillStyle = fill;
  g.fillRect(x, y, w, h);
}

function poly(g, points, fill) {
  g.fillStyle = fill;
  g.beginPath();
  g.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i += 1) g.lineTo(points[i][0], points[i][1]);
  g.closePath();
  g.fill();
}

function stroke(g, x1, y1, x2, y2, color, width) {
  g.strokeStyle = color;
  g.lineWidth = width;
  g.beginPath();
  g.moveTo(x1, y1);
  g.lineTo(x2, y2);
  g.stroke();
}

function vgrad(g, y0, y1, stops) {
  const grad = g.createLinearGradient(0, y0, 0, y1);
  for (const [at, color] of stops) grad.addColorStop(at, color);
  return grad;
}

/** A four-point sparkle. */
function sparkle(g, x, y, r, fill) {
  poly(g, [[x, y - r], [x + r * 0.28, y - r * 0.28], [x + r, y], [x + r * 0.28, y + r * 0.28], [x, y + r], [x - r * 0.28, y + r * 0.28], [x - r, y], [x - r * 0.28, y - r * 0.28]], fill);
}

/** A gull in flight: two curved strokes. */
function gull(g, x, y, s, color) {
  g.strokeStyle = color;
  g.lineWidth = 2.5;
  g.beginPath();
  g.moveTo(x - 12 * s, y);
  g.quadraticCurveTo(x - 5 * s, y - 8 * s, x, y);
  g.quadraticCurveTo(x + 5 * s, y - 8 * s, x + 12 * s, y);
  g.stroke();
}

function has(mask, i) {
  return mask.has(i);
}

// ---------------------------------------------------------------------------
// Level 1 — Lantern Bay: a harbour at dusk.
// Differences: 0 beam, 1 sail, 2 gull, 3 buoy, 4 window, 5 cat, 6 moon.
// ---------------------------------------------------------------------------
function drawBay(g, mask) {
  const rng = createRandom(11);
  g.fillStyle = vgrad(g, 0, 300, [[0, '#2b2a55'], [0.6, '#7a4a6e'], [1, '#e07856']]);
  g.fillRect(0, 0, 600, 300);
  for (let i = 0; i < 26; i += 1) {
    const x = rng() * 600;
    const y = rng() * 170;
    circle(g, x, y, rng() * 1.6 + 0.6, 'rgba(255, 244, 214, 0.9)');
  }
  // Moon: crescent on the left picture, full on the right.
  circle(g, 520, 60, 30, '#f7ead0');
  if (!has(mask, 6)) circle(g, 532, 54, 26, '#2b2a55');
  // Sea.
  g.fillStyle = vgrad(g, 300, 520, [[0, '#1d4a63'], [1, '#0d2233']]);
  g.fillRect(0, 300, 600, 220);
  g.strokeStyle = 'rgba(180, 220, 235, 0.35)';
  g.lineWidth = 2;
  for (let i = 0; i < 7; i += 1) {
    const y = 320 + i * 26;
    g.beginPath();
    for (let x = 0; x <= 600; x += 20) g.lineTo(x, y + Math.sin((x + i * 60) * 0.03) * 4);
    g.stroke();
  }
  // Houses on the right hill.
  g.fillStyle = '#274b34';
  g.beginPath();
  g.ellipse(500, 300, 130, 46, 0, Math.PI, 0);
  g.fill();
  rect(g, 452, 252, 56, 48, '#f0d9a8');
  poly(g, [[446, 252], [480, 226], [514, 252]], '#b0503c');
  rect(g, 516, 258, 58, 42, '#e8c890');
  poly(g, [[510, 258], [545, 232], [580, 258]], '#b0503c');
  // One window lit on the left picture, dark on the right.
  rect(g, 494, 264, 14, 16, has(mask, 4) ? '#3a2c22' : '#ffd76a');
  rect(g, 530, 270, 14, 16, '#ffd76a');
  // Lighthouse.
  poly(g, [[62, 300], [72, 132], [118, 132], [128, 300]], '#f2ead8');
  rect(g, 66, 200, 58, 20, '#c94f43');
  rect(g, 70, 252, 50, 16, '#c94f43');
  rect(g, 66, 118, 58, 16, '#2f3a4a');
  circle(g, 95, 108, 12, '#ffd76a');
  // Beam: present on the left picture only.
  if (!has(mask, 0)) {
    g.fillStyle = 'rgba(255, 215, 106, 0.28)';
    poly(g, [[104, 102], [360, 62], [360, 150], [104, 116]], 'rgba(255, 215, 106, 0.28)');
  }
  // Pier.
  g.fillStyle = '#6b4a2f';
  poly(g, [[40, 430], [250, 452], [250, 470], [40, 448]], '#6b4a2f');
  for (let i = 0; i < 5; i += 1) rect(g, 52 + i * 42, 428 + i * 4, 6, 34, '#54371f');
  // Cat on the pier: present on the left picture only.
  if (!has(mask, 5)) {
    ellipse(g, 150, 446, 16, 10, '#2b2b33');
    circle(g, 164, 436, 8, '#2b2b33');
    poly(g, [[158, 430], [161, 420], [164, 430]], '#2b2b33');
    poly(g, [[166, 430], [169, 420], [172, 430]], '#2b2b33');
    stroke(g, 134, 446, 122, 436, '#2b2b33', 4);
  }
  // Sailboat: white sail on the left, red sail on the right.
  poly(g, [[408, 392], [452, 392], [452, 372], [408, 372]], '#5a3a22');
  stroke(g, 430, 372, 430, 300, '#3a2a1a', 4);
  poly(g, [[430, 302], [430, 368], [470, 368]], has(mask, 1) ? '#d94f3d' : '#f7f3e6');
  poly(g, [[430, 310], [430, 368], [398, 368]], '#efe3c2');
  // Gulls: three on the left, the middle one missing on the right.
  gull(g, 250, 70, 1, '#1d2436');
  if (!has(mask, 2)) gull(g, 300, 55, 0.9, '#1d2436');
  gull(g, 350, 88, 1.1, '#1d2436');
  // Buoy: present on the left picture only.
  if (!has(mask, 3)) {
    ellipse(g, 520, 428, 14, 8, '#d94f3d');
    rect(g, 512, 410, 16, 12, '#f2ead8');
    rect(g, 512, 410, 16, 5, '#d94f3d');
  }
}

const BAY_DIFFS = [
  { x: 240, y: 108, r: 34, label: 'the lighthouse beam' },
  { x: 446, y: 335, r: 30, label: "the boat's sail" },
  { x: 300, y: 58, r: 26, label: 'a seagull' },
  { x: 520, y: 424, r: 28, label: 'the buoy' },
  { x: 501, y: 272, r: 24, label: 'the lit window' },
  { x: 152, y: 444, r: 26, label: 'the cat on the pier' },
  { x: 520, y: 60, r: 30, label: 'the moon' },
];

// ---------------------------------------------------------------------------
// Level 2 — Firefly Camp: a forest clearing at night.
// Differences: 0 flames, 1 owl, 2 mushroom, 3 tent door, 4 firefly, 5 lantern, 6 star.
// ---------------------------------------------------------------------------
function drawCamp(g, mask) {
  const rng = createRandom(23);
  g.fillStyle = vgrad(g, 0, 340, [[0, '#0b1e2e'], [1, '#143c2c']]);
  g.fillRect(0, 0, 600, 340);
  for (let i = 0; i < 30; i += 1) {
    const x = rng() * 600;
    const y = rng() * 200;
    circle(g, x, y, rng() * 1.5 + 0.5, 'rgba(255, 244, 214, 0.85)');
  }
  // One bright star, top right: present on the left picture only.
  if (!has(mask, 6)) sparkle(g, 540, 50, 10, '#ffe9a8');
  circle(g, 110, 70, 26, '#f7ead0');
  circle(g, 120, 64, 22, '#0b1e2e');
  // Pines.
  for (const [x, s] of [[60, 1], [300, 1.25], [545, 0.9]]) {
    poly(g, [[x - 46 * s, 340], [x, 340 - 150 * s], [x + 46 * s, 340]], '#0e2f1e');
    poly(g, [[x - 36 * s, 300], [x, 300 - 110 * s], [x + 36 * s, 300]], '#123a24');
    rect(g, x - 6 * s, 336, 12 * s, 16, '#3a2a1a');
  }
  // Ground.
  g.fillStyle = '#16301f';
  g.fillRect(0, 340, 600, 180);
  g.strokeStyle = '#1e4a2c';
  g.lineWidth = 2;
  for (let i = 0; i < 12; i += 1) {
    const x = rng() * 600;
    const y = 360 + rng() * 140;
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x - 4, y - 10);
    g.moveTo(x, y);
    g.lineTo(x + 4, y - 10);
    g.stroke();
  }
  // Tent.
  poly(g, [[150, 360], [215, 250], [280, 360]], '#e07830');
  poly(g, [[168, 360], [215, 272], [262, 360]], '#c85f22');
  // Door: open (dark) on the left, closed (orange) on the right.
  poly(g, [[198, 360], [215, 312], [232, 360]], has(mask, 3) ? '#e07830' : '#1d1410');
  // Campfire.
  for (let i = 0; i < 7; i += 1) {
    const a = (i / 7) * Math.PI * 2;
    ellipse(g, 300 + Math.cos(a) * 30, 408 + Math.sin(a) * 8, 9, 6, '#6b6f75');
  }
  stroke(g, 278, 404, 322, 398, '#5a3a22', 6);
  stroke(g, 322, 404, 278, 398, '#5a3a22', 6);
  if (!has(mask, 0)) {
    poly(g, [[282, 400], [300, 348], [318, 400]], '#f28c28');
    poly(g, [[290, 400], [300, 366], [310, 400]], '#ffd76a');
  } else {
    ellipse(g, 300, 398, 12, 5, '#f28c28');
    ellipse(g, 300, 396, 6, 3, '#ffd76a');
  }
  // Fireflies: five on the left, one missing on the right.
  const flies = [[150, 120], [260, 90], [360, 140], [420, 80], [480, 200]];
  flies.forEach(([x, y], i) => {
    if (i === 3 && has(mask, 4)) return;
    circle(g, x, y, 7, 'rgba(190, 255, 120, 0.25)');
    circle(g, x, y, 3, '#c8ff78');
  });
  // Owl on a branch: present on the left picture only.
  if (!has(mask, 1)) {
    stroke(g, 440, 170, 560, 160, '#3a2a1a', 6);
    ellipse(g, 500, 146, 16, 20, '#8a6f4d');
    circle(g, 494, 140, 4, '#ffd76a');
    circle(g, 506, 140, 4, '#ffd76a');
    poly(g, [[488, 128], [492, 118], [496, 128]], '#8a6f4d');
    poly(g, [[504, 128], [508, 118], [512, 128]], '#8a6f4d');
  }
  // Lantern hanging from a branch: lit on the left, unlit on the right.
  stroke(g, 420, 200, 480, 200, '#3a2a1a', 5);
  stroke(g, 450, 200, 450, 216, '#3a2a1a', 3);
  if (!has(mask, 5)) {
    circle(g, 450, 232, 16, 'rgba(255, 215, 106, 0.3)');
    rect(g, 440, 222, 20, 22, '#f2c94c');
  } else {
    rect(g, 440, 222, 20, 22, '#5a5240');
  }
  // Mushrooms: red caps on the left, blue caps on the right.
  const cap = has(mask, 2) ? '#5a7fd4' : '#d94f3d';
  for (const [x, y, s] of [[104, 452, 1], [126, 460, 0.7], [88, 464, 0.6]]) {
    rect(g, x - 3 * s, y - 12 * s, 6 * s, 12 * s, '#f2ead8');
    g.fillStyle = cap;
    g.beginPath();
    g.arc(x, y - 10 * s, 13 * s, Math.PI, 0);
    g.fill();
    circle(g, x - 5 * s, y - 16 * s, 2, '#f2ead8');
    circle(g, x + 4 * s, y - 14 * s, 2, '#f2ead8');
  }
}

const CAMP_DIFFS = [
  { x: 300, y: 386, r: 32, label: 'the campfire flames' },
  { x: 500, y: 148, r: 30, label: 'the owl' },
  { x: 108, y: 448, r: 26, label: 'the mushroom caps' },
  { x: 215, y: 338, r: 28, label: 'the tent door' },
  { x: 420, y: 80, r: 24, label: 'a firefly' },
  { x: 450, y: 232, r: 28, label: 'the lantern' },
  { x: 540, y: 50, r: 24, label: 'the bright star' },
];

// ---------------------------------------------------------------------------
// Level 3 — Moon Garden: a walled garden at dawn.
// Differences: 0 fountain, 1 butterfly, 2 sunflower, 3 birdhouse, 4 bench,
// 5 watering can, 6 topiary flower.
// ---------------------------------------------------------------------------
function drawGarden(g, mask) {
  const rng = createRandom(37);
  g.fillStyle = vgrad(g, 0, 320, [[0, '#ffd9a0'], [0.6, '#f0b8c8'], [1, '#b8d8f0']]);
  g.fillRect(0, 0, 600, 320);
  circle(g, 520, 90, 34, '#fff2c8');
  circle(g, 520, 90, 46, 'rgba(255, 242, 200, 0.35)');
  // Clouds.
  for (const [x, y, s] of [[140, 70, 1], [330, 50, 0.8], [470, 150, 0.7]]) {
    ellipse(g, x, y, 42 * s, 16 * s, 'rgba(255, 255, 255, 0.85)');
    ellipse(g, x + 24 * s, y + 4 * s, 30 * s, 12 * s, 'rgba(255, 255, 255, 0.85)');
  }
  // Lawn.
  g.fillStyle = vgrad(g, 320, 520, [[0, '#5da85d'], [1, '#3c7a3c']]);
  g.fillRect(0, 320, 600, 200);
  // Path.
  poly(g, [[270, 520], [288, 380], [312, 380], [330, 520]], '#d8c49a');
  // Wall.
  rect(g, 0, 300, 600, 22, '#b98a6a');
  rect(g, 0, 300, 600, 6, '#d8a982');
  // Fountain.
  ellipse(g, 300, 400, 78, 20, '#8a97a8');
  ellipse(g, 300, 396, 64, 14, '#7fd4e8');
  rect(g, 292, 330, 16, 62, '#9aa7b8');
  ellipse(g, 300, 328, 26, 8, '#8a97a8');
  // Water arcs: flowing on the left, still on the right.
  if (!has(mask, 0)) {
    g.strokeStyle = 'rgba(190, 235, 250, 0.9)';
    g.lineWidth = 4;
    g.beginPath();
    g.moveTo(300, 322);
    g.quadraticCurveTo(250, 280, 228, 330);
    g.moveTo(300, 322);
    g.quadraticCurveTo(350, 280, 372, 330);
    g.stroke();
    circle(g, 228, 332, 5, '#beebfa');
    circle(g, 372, 332, 5, '#beebfa');
  }
  // Topiary bushes.
  circle(g, 90, 300, 40, '#2e6b34');
  circle(g, 510, 300, 40, '#2e6b34');
  // Flower on the left topiary: present on the left picture only.
  if (!has(mask, 6)) {
    circle(g, 90, 258, 7, '#ff7fb0');
    circle(g, 90, 258, 3, '#ffd76a');
  }
  // Birdhouse on a pole: present on the left picture only.
  if (!has(mask, 3)) {
    stroke(g, 150, 200, 150, 320, '#6b4a2f', 6);
    rect(g, 128, 168, 44, 36, '#e07830');
    poly(g, [[122, 168], [150, 146], [178, 168]], '#b0503c');
    circle(g, 150, 186, 7, '#2b1d12');
  }
  // Butterflies: two on the left, one missing on the right.
  butterfly(g, 250, 100, 1, '#ff9ecf');
  if (!has(mask, 1)) butterfly(g, 420, 120, 0.9, '#7fb8ff');
  // Bench: present on the left picture only.
  if (!has(mask, 4)) {
    rect(g, 440, 410, 90, 10, '#8a5a32');
    rect(g, 440, 380, 90, 10, '#8a5a32');
    rect(g, 448, 420, 8, 34, '#6b4423');
    rect(g, 514, 420, 8, 34, '#6b4423');
    rect(g, 448, 356, 8, 26, '#6b4423');
    rect(g, 514, 356, 8, 26, '#6b4423');
  }
  // Watering can: present on the left picture only.
  if (!has(mask, 5)) {
    ellipse(g, 400, 440, 22, 14, '#5a7fd4');
    poly(g, [[418, 432], [444, 418], [444, 426], [420, 442]], '#5a7fd4');
    stroke(g, 384, 432, 384, 418, '#5a7fd4', 5);
  }
  // Sunflowers along the bottom.
  for (let i = 0; i < 5; i += 1) {
    const x = 90 + i * 105;
    const y = 470;
    stroke(g, x, y, x, y - 34, '#2e6b34', 4);
    sunflower(g, x, y - 44, i === 1 && has(mask, 2));
  }
}

function butterfly(g, x, y, s, color) {
  g.fillStyle = color;
  g.beginPath();
  g.ellipse(x - 8 * s, y - 4 * s, 8 * s, 6 * s, -0.5, 0, Math.PI * 2);
  g.ellipse(x + 8 * s, y - 4 * s, 8 * s, 6 * s, 0.5, 0, Math.PI * 2);
  g.ellipse(x - 7 * s, y + 6 * s, 7 * s, 5 * s, 0.5, 0, Math.PI * 2);
  g.ellipse(x + 7 * s, y + 6 * s, 7 * s, 5 * s, -0.5, 0, Math.PI * 2);
  g.fill();
  circle(g, x, y, 2.5 * s, '#2b2b33');
}

function sunflower(g, x, y, orangeCentre) {
  for (let i = 0; i < 10; i += 1) {
    const a = (i / 10) * Math.PI * 2;
    ellipse(g, x + Math.cos(a) * 13, y + Math.sin(a) * 13, 7, 4, '#f2c94c');
  }
  circle(g, x, y, 10, orangeCentre ? '#e07830' : '#6b4423');
}

const GARDEN_DIFFS = [
  { x: 300, y: 268, r: 32, label: 'the fountain water' },
  { x: 420, y: 120, r: 24, label: 'a butterfly' },
  { x: 195, y: 426, r: 26, label: "a sunflower's centre" },
  { x: 150, y: 184, r: 28, label: 'the birdhouse' },
  { x: 485, y: 405, r: 30, label: 'the bench' },
  { x: 408, y: 436, r: 26, label: 'the watering can' },
  { x: 90, y: 262, r: 24, label: 'the flower on the bush' },
];

export const LEVELS = [
  { name: 'Lantern Bay', sub: 'a harbour at dusk', seed: 11, draw: drawBay, diffs: BAY_DIFFS },
  { name: 'Firefly Camp', sub: 'a forest clearing at night', seed: 23, draw: drawCamp, diffs: CAMP_DIFFS },
  { name: 'Moon Garden', sub: 'a walled garden at dawn', seed: 37, draw: drawGarden, diffs: GARDEN_DIFFS },
];

/** Draw one level's scene into panel-local coordinates (600x520). */
export function drawScene(g, levelIndex, mask) {
  g.save();
  g.beginPath();
  g.rect(0, 0, 600, 520);
  g.clip();
  LEVELS[levelIndex].draw(g, mask);
  g.restore();
}
