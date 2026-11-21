# Lantern Bay — Spot the Difference

[![make.fun · best-spot-the-difference-game-20261121-0451](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/bongekanjing/best-spot-the-difference-game-20261121-0451-muse/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/bongekanjing/best-spot-the-difference-game-20261121-0451-muse/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)

A complete, original spot-the-difference game that plays offline in a desktop
browser from its own files. Two near-identical hand-drawn pictures sit side by
side; find all seven hidden differences before the clock runs out.

## How to play

- **Click** a difference in either picture to mark it (a green ring appears on
  both pictures). Find all 7 to clear the level.
- **H** — hint (highlights one unfound difference, −50 points, 3 per level).
- **P** — pause. **R** — restart the level. **Space / click** — start and continue.
- A wrong click costs 10 points. Clearing a level pays a time bonus of 5 points
  per second left. Three pictures in all: Lantern Bay (a harbour at dusk),
  Firefly Camp (a forest clearing at night) and Moon Garden (a walled garden
  at dawn).

## Run it

```sh
node serve.ts   # serves game/ at http://localhost:8080
```

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `game/` and `screenshots/` to the output directory and writes
`dossier.json` with the vendored make.fun library. Screenshots are real renders
of the game's own code, taken at `?shot=start|play|end&seed=1`.

## Tech

- Node 22 standard library only (entrypoint), plain ES modules and canvas 2D
  (the game), no third-party libraries, no network requests, no audio files
  (the blips are synthesised with WebAudio).
- All three pictures are drawn procedurally from seeded generators, so the same
  seed always gives the same pictures.
