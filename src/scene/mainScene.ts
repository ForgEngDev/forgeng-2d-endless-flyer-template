import type {
  Forge2dGame,
  Forge2dSceneDefinition,
  Forge2dSceneFacade,
} from "forgeng/presets/2d";
import type { UiShellLike } from "@forgeng/ui-dom";
import { Controller, PlayerControls } from "./controller";
import { createRenderDefinition } from "./render";
import { Flyer } from "./flyer";
import { Hud } from "./hud";
import { FLYER_ENTITY, SCENE_ID } from "./ids";
import { ObstacleField, obstacleEntityId, obstacleTransform } from "./obstacles";

export type RunState = "ready" | "playing" | "game-over";

/**
 * Main 2D scene that combines flight, recycled obstacles, scoring, input, and HUD.
 * Forge2d uses a scene definition instead of a Scene class.
 */
export class MainScene {
  private readonly flyer = new Flyer();
  private readonly obstacles = new ObstacleField();
  private readonly controller = new Controller();
  private readonly hud = new Hud();
  private lastFrame = performance.now();
  private raf = 0;
  private game: Forge2dGame | null = null;
  private scene: Forge2dSceneFacade | null = null;
  private flapSource: "space" | "mouse-left" | "touch" | null = null;
  private state: RunState = "ready";
  private score = 0;
  private bestScore = 0;

  public definition(): Forge2dSceneDefinition {
    return {
      id: SCENE_ID,
      render: createRenderDefinition(this.flyer, this.obstacles),
      colliders: [
        {
          id: "flyer-body",
          entityId: FLYER_ENTITY,
          shape: { kind: "aabb", size: [18, 18] },
        },
        ...this.obstacles.colliderDefinitions(),
      ],
      setup: (scene) => this.setup(scene),
      fixedUpdate: (scene) => this.fixedUpdate(scene),
    };
  }

  public bindGame(game: Forge2dGame): void {
    this.game = game;

    const ui = game.ui as UiShellLike | null;
    if (ui) {
      this.hud.setup(ui, {
        getCanvasSize: () => ({
          width: game.canvas.width,
          height: game.canvas.height,
        }),
        getSceneId: () => SCENE_ID,
        getFlyerPosition: () => this.flyer.getPosition(),
        getFlyerVelocity: () => this.flyer.getVelocity(),
        getRunState: () => this.state,
        getScore: () => this.score,
        getBestScore: () => this.bestScore,
      });
    }

    this.controller.setup({
      onFlap: (source) => {
        this.flapSource = source;
      },
      onReset: () => {
        this.resetRun(false);
        this.hud.notify("E — run reset");
      },
    });

    const tick = (now: number) => {
      const dt = Math.min(0.1, (now - this.lastFrame) / 1000);
      this.lastFrame = now;
      this.hud.update(dt);
      this.raf = requestAnimationFrame(tick);
    };
    this.raf = requestAnimationFrame(tick);
  }

  public destroy(): void {
    cancelAnimationFrame(this.raf);
    this.controller.destroy();
    this.hud.destroy();
    this.scene = null;
    this.game = null;
  }

  private setup(scene: Forge2dSceneFacade): void {
    this.scene = scene;
    scene.hud.set(
      "hud/status",
      Object.freeze({ state: this.state, score: this.score, position: this.flyer.getPosition() }),
    );
    this.hud.setGameStatus(this.state, this.score, this.bestScore);
  }

  private fixedUpdate(scene: Forge2dSceneFacade): void {
    if (!this.game) return;

    if (this.flapSource) {
      if (this.state === "game-over") {
        this.resetRun(true);
      } else {
        if (this.state === "ready") this.state = "playing";
        this.flyer.flap();
      }
      this.hud.notify(flapLabel(this.flapSource), 1400);
    }
    this.flapSource = null;

    if (this.state !== "playing") {
      this.syncHud(scene);
      return;
    }

    const position = this.flyer.step();
    scene.setTransform(FLYER_ENTITY, {
      position,
      rotation: Math.max(-0.35, Math.min(0.7, this.flyer.getVelocity()[1] * 0.075)),
      scale: [1, 1],
    });

    const step = this.obstacles.step(this.score);
    this.score += step.scoreDelta;
    this.bestScore = Math.max(this.bestScore, this.score);
    this.syncObstacleTransforms(scene);

    if (this.obstacles.collidesWith(position)) {
      this.state = "game-over";
      this.hud.notify(`Game over — score ${this.score}. Tap to retry.`, 5000);
    }

    this.syncHud(scene);
  }

  private syncHud(scene: Forge2dSceneFacade): void {
    scene.hud.set(
      "hud/status",
      Object.freeze({
        state: this.state,
        score: this.score,
        bestScore: this.bestScore,
        position: this.flyer.getPosition(),
      }),
    );
    this.hud.setGameStatus(this.state, this.score, this.bestScore);
  }

  private resetRun(startImmediately: boolean): void {
    this.score = 0;
    this.state = startImmediately ? "playing" : "ready";
    const position = this.flyer.reset();
    this.obstacles.reset();
    this.scene?.setTransform(FLYER_ENTITY, {
      position,
      rotation: 0,
      scale: [1, 1],
    });
    if (startImmediately) this.flyer.flap();
    if (this.scene) this.syncObstacleTransforms(this.scene);
    this.flapSource = null;
    this.hud.setGameStatus(this.state, this.score, this.bestScore);
  }

  private syncObstacleTransforms(scene: Forge2dSceneFacade): void {
    for (const pair of this.obstacles.snapshots()) {
      for (const side of ["top", "bottom"] as const) {
        scene.setTransform(obstacleEntityId(pair.index, side), obstacleTransform(pair, side));
      }
    }
  }
}

function flapLabel(source: "space" | "mouse-left" | "touch"): string {
  if (source === "space") return "Space — flap";
  if (source === "touch") return "Touch — flap";
  return "Left click — flap";
}
