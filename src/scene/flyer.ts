import { sprite2d } from "forgeng/2d";
import { FALLBACK_TEXTURE, FLYER, FLYER_ENTITY, MATERIAL, WORLD } from "./ids";

export const FLYER_START: readonly [number, number] = [-82, 0];

/** Fixed-step one-button flight motion with gravity and an upward impulse. */
export class Flyer {
  private position: readonly [number, number] = FLYER_START;
  private velocityY = 0;
  private readonly gravity = 0.32;
  private readonly flapVelocity = -5.1;

  public createSprite() {
    return sprite2d({
      id: FLYER,
      entity: FLYER_ENTITY,
      layer: WORLD,
      texture: FALLBACK_TEXTURE,
      material: MATERIAL,
      size: [18, 18],
      tint: [1, 0.48, 0.12, 1],
      transform: { position: this.position, rotation: 0, scale: [1, 1] },
    });
  }

  public getPosition(): readonly [number, number] {
    return this.position;
  }

  public getVelocity(): readonly [number, number] {
    return [0, this.velocityY];
  }

  public flap(): void {
    this.velocityY = this.flapVelocity;
  }

  public step(): readonly [number, number] {
    this.velocityY = Math.min(7.5, this.velocityY + this.gravity);
    this.position = [this.position[0], this.position[1] + this.velocityY];
    return this.position;
  }

  public reset(): readonly [number, number] {
    this.position = FLYER_START;
    this.velocityY = 0;
    return this.position;
  }
}
