import { sprite2d } from "forgeng/2d";
import { FALLBACK_TEXTURE, MATERIAL, WORLD } from "./ids";

const PAIR_COUNT = 3;
const FIRST_X = 72;
const PAIR_SPACING = 116;
const OBSTACLE_WIDTH = 26;
const OBSTACLE_HEIGHT = 120;
const GAP_SIZE = 68;
const FLYER_HALF_SIZE = 9;
const WORLD_EDGE = 90;

export interface ObstaclePairSnapshot {
  readonly index: number;
  readonly x: number;
  readonly gapCenter: number;
  readonly scored: boolean;
}

export interface ObstacleStepResult {
  readonly scoreDelta: number;
}

/** Recycles a small obstacle pool to create an endless deterministic course. */
export class ObstacleField {
  private pairs: ObstaclePairSnapshot[] = [];
  private randomState = 0xf10a2026;

  public constructor() {
    this.reset();
  }

  public snapshots(): readonly ObstaclePairSnapshot[] {
    return this.pairs;
  }

  public createSprites() {
    return this.pairs.flatMap((pair) => createPairSprites(pair));
  }

  public colliderDefinitions() {
    return this.pairs.flatMap((pair) => [
      {
        id: obstacleBodyId(pair.index, "top"),
        entityId: obstacleEntityId(pair.index, "top"),
        shape: { kind: "aabb" as const, size: [OBSTACLE_WIDTH, OBSTACLE_HEIGHT] as const },
      },
      {
        id: obstacleBodyId(pair.index, "bottom"),
        entityId: obstacleEntityId(pair.index, "bottom"),
        shape: { kind: "aabb" as const, size: [OBSTACLE_WIDTH, OBSTACLE_HEIGHT] as const },
      },
    ]);
  }

  public step(score: number): ObstacleStepResult {
    const speed = 1.45 + Math.min(1.15, score * 0.045);
    let scoreDelta = 0;
    const rightmost = Math.max(...this.pairs.map((pair) => pair.x));

    this.pairs = this.pairs.map((pair) => {
      let x = pair.x - speed;
      let gapCenter = pair.gapCenter;
      let scored = pair.scored;

      if (!scored && x + OBSTACLE_WIDTH / 2 < -82) {
        scored = true;
        scoreDelta += 1;
      }

      if (x < -190) {
        x = rightmost + PAIR_SPACING;
        gapCenter = this.nextGapCenter();
        scored = false;
      }

      return Object.freeze({ ...pair, x, gapCenter, scored });
    });

    return Object.freeze({ scoreDelta });
  }

  public collidesWith(position: readonly [number, number]): boolean {
    const [flyerX, flyerY] = position;
    if (flyerY - FLYER_HALF_SIZE <= -WORLD_EDGE || flyerY + FLYER_HALF_SIZE >= WORLD_EDGE) {
      return true;
    }

    return this.pairs.some((pair) => {
      const overlapsX = flyerX + FLYER_HALF_SIZE > pair.x - OBSTACLE_WIDTH / 2
        && flyerX - FLYER_HALF_SIZE < pair.x + OBSTACLE_WIDTH / 2;
      if (!overlapsX) return false;

      const gapTop = pair.gapCenter - GAP_SIZE / 2;
      const gapBottom = pair.gapCenter + GAP_SIZE / 2;
      return flyerY - FLYER_HALF_SIZE < gapTop || flyerY + FLYER_HALF_SIZE > gapBottom;
    });
  }

  public reset(): void {
    this.randomState = 0xf10a2026;
    this.pairs = Array.from({ length: PAIR_COUNT }, (_, index) =>
      Object.freeze({
        index,
        x: FIRST_X + index * PAIR_SPACING,
        gapCenter: this.nextGapCenter(),
        scored: false,
      }),
    );
  }

  private nextGapCenter(): number {
    this.randomState = (1664525 * this.randomState + 1013904223) >>> 0;
    const normalized = this.randomState / 0xffffffff;
    return Math.round(-28 + normalized * 56);
  }
}

export function obstacleEntityId(index: number, side: "top" | "bottom"): string {
  return `template.2d:obstacle-${index}-${side}-entity`;
}

export function obstacleTransform(pair: ObstaclePairSnapshot, side: "top" | "bottom") {
  const offset = GAP_SIZE / 2 + OBSTACLE_HEIGHT / 2;
  return {
    position: [pair.x, pair.gapCenter + (side === "top" ? -offset : offset)] as const,
    rotation: 0,
    scale: [1, 1] as const,
  };
}

/** Thin rails make the collision bounds readable without using licensed art. */
export function createBoundarySprites() {
  return [-88, 88].map((y, index) =>
    sprite2d({
      id: `template.2d:boundary-${index}`,
      entity: `template.2d:boundary-${index}-entity`,
      layer: WORLD,
      texture: FALLBACK_TEXTURE,
      material: MATERIAL,
      size: [320, 4],
      tint: [0.14, 0.24, 0.38, 1],
      transform: { position: [0, y], rotation: 0, scale: [1, 1] },
    }),
  );
}

function obstacleBodyId(index: number, side: "top" | "bottom"): string {
  return `template.2d:obstacle-${index}-${side}-body`;
}

function createPairSprites(pair: ObstaclePairSnapshot) {
  return (["top", "bottom"] as const).map((side) =>
    sprite2d({
      id: `template.2d:obstacle-${pair.index}-${side}`,
      entity: obstacleEntityId(pair.index, side),
      layer: WORLD,
      texture: FALLBACK_TEXTURE,
      material: MATERIAL,
      size: [OBSTACLE_WIDTH, OBSTACLE_HEIGHT],
      tint: side === "top" ? [0.18, 0.66, 0.9, 1] : [0.12, 0.52, 0.82, 1],
      transform: obstacleTransform(pair, side),
    }),
  );
}
