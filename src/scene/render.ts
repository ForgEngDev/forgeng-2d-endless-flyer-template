import {
  builtinSpriteMaterial2d,
  defineLayer2d,
  defineRender2d,
} from "forgeng/2d";
import { createCamera } from "./camera";
import { Flyer } from "./flyer";
import { MATERIAL, WORLD } from "./ids";
import { createBoundarySprites, ObstacleField } from "./obstacles";

/** Build the scene render definition: layer, camera, flyer, and obstacle pool. */
export function createRenderDefinition(flyer: Flyer, obstacles: ObstacleField) {
  const world = defineLayer2d({ id: WORLD });
  const material = builtinSpriteMaterial2d({ id: MATERIAL });

  return defineRender2d({
    contractVersion: 1,
    id: "template.2d:render",
    layers: [world],
    cameras: [createCamera()],
    materials: [material],
    sprites: [...createBoundarySprites(), ...obstacles.createSprites(), flyer.createSprite()],
    animations: [],
  });
}
