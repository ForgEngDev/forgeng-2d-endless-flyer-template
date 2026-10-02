# ForgEng 2D Endless Flyer Template

**Live demo:** [play.forgeng.dev/forgeng-2d-endless-flyer-template/current/](https://play.forgeng.dev/forgeng-2d-endless-flyer-template/current/)

**TypeScript starter template for a one-button browser game** built with **[ForgEng](https://forgeng.dev)** — a **WebGPU-first**, modular game engine that runs directly in modern browsers.

This repository is the endless-flyer sibling of [`forgeng-2d-platformer-template`](https://github.com/ForgEngDev/forgeng-2d-platformer-template), [`forgeng-2d-top-down-template`](https://github.com/ForgEngDev/forgeng-2d-top-down-template), and [`forgeng-3d-template`](https://github.com/ForgEngDev/forgeng-3d-template). It vendors ForgeNG 3.4.2 and provides a small, readable game loop that beginners can extend with their own art, audio, and rules.

> Keywords: `ForgEng`, `ForgeNG`, `TypeScript`, `WebGPU`, `2D endless flyer`, `one-button game`, `Vite`, `browser game`, `WGSL`, `ECS`, `sprites`

## What you get

- `Forge2d.create` engine entry with scene code under `src/scene/`
- pixel-art camera at **320×180** with integer scaling and nearest sampling
- one-button flight using Space, left click, or touch
- fixed-step gravity and flap impulse
- pooled obstacles that move, score, and recycle forever
- gradually increasing obstacle speed
- collision with obstacles and the playfield bounds
- ready, playing, and game-over states with instant restart
- current score and session best score
- responsive DomUiShell controls and optional metrics (`?advanced=1`)
- vendored ForgeNG **3.4.2 2D preset** under `src/vendor/forgeng/`

The default scene uses only geometric shapes. Replace them with your own licensed sprites when you are ready to style the game.

## Requirements

- Git
- Node.js 18+
- a browser/device with WebGPU support

## Quick start

```bash
git clone https://github.com/ForgEngDev/forgeng-2d-endless-flyer-template.git
cd forgeng-2d-endless-flyer-template
npm install
npm run dev
```

Open [http://localhost:3001/](http://localhost:3001/).

```bash
npm run build
npm run preview
```

## Controls

| Input | Action |
| --- | --- |
| Space | Start, flap, or restart |
| Left click | Start, flap, or restart |
| Touch / tap | Start, flap, or restart |
| E | Reset the current run |

Fly through each opening to score. The obstacle speed increases gradually. After a collision, press Space or tap to start a new run.

## Project layout

```text
src/
  main.ts              # Forge2d.create configuration
  scene/
    mainScene.ts       # game states, score, collision, and scene updates
    flyer.ts           # gravity and flap motion
    obstacles.ts       # obstacle pool, recycling, and collision geometry
    render.ts          # layers, camera, flyer, and obstacle sprites
    camera.ts
    controller.ts      # keyboard, mouse, and touch input
    hud.ts             # score overlay, controls, and metrics
    ids.ts
  vendor/forgeng/      # vendored ForgeNG 3.4.2 2D preset
css/style.css
index.html
```

## Beginner extension ideas

- replace the orange square with an animated flyer sprite
- add a flap sound, score sound, and game-over sound
- store the best score between sessions
- add moving gaps, collectibles, or a day/night palette
- create a title screen and difficulty modes

## Learn more

- Website: [https://forgeng.dev](https://forgeng.dev)
- Docs: [ForgeNG 3.x overview](https://forgeng.dev/en/forgeng-3.0/getting-started/overview)
- Platformer sibling: [forgeng-2d-platformer-template](https://github.com/ForgEngDev/forgeng-2d-platformer-template)
- Top-down sibling: [forgeng-2d-top-down-template](https://github.com/ForgEngDev/forgeng-2d-top-down-template)
- 3D sibling: [forgeng-3d-template](https://github.com/ForgEngDev/forgeng-3d-template)

## License

See [LICENSE](./LICENSE).

- **Template / game code:** free to use and improve for client-side games.
- **ForgEng engine** (vendored under `src/vendor/forgeng/`): installation on other computers as an engine/SDK and commercial use of the engine are strictly forbidden.

Engine ownership and commercial grants are also described on the public [ForgeNG License](https://forgeng.dev/en/license) page.


## Public API and AI coding assistants

See the [ForgeNG public API repository](https://github.com/ForgEngDev/forgeng-api) for versioned TypeScript signatures, an API entry map, and [instructions for AI assistants](https://github.com/ForgEngDev/forgeng-api/blob/main/AGENTS.md). Give your assistant that link together with this game project. This template's pinned runtime and vendored declarations take precedence over a newer API snapshot. Start with one change and run `npm run build`, then check the game in a WebGPU browser.
