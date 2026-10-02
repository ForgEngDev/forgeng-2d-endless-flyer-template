import { binding, controls, defineActionMap } from "forgeng/contracts/actions";

/** Single source of truth for active controls, HUD display, and input wiring. */
export const ACTIVE_CONTROLS = [
  { id: "space", label: "Keyboard · Space", help: "Start / flap / restart" },
  { id: "e", label: "Keyboard · E", help: "Reset the run" },
  { id: "lmb", label: "Mouse · Left click", help: "Start / flap / restart" },
  { id: "touch", label: "Touch · Tap", help: "Start / flap / restart" },
] as const;

export type ControlId = (typeof ACTIVE_CONTROLS)[number]["id"];

/** Semantic Input Actions map for the ForgeNG 2D workflow. */
export const PlayerControls = defineActionMap({
  id: "template.2d:player-controls",
  actions: {
    flap: {
      kind: "button",
      bindings: [
        binding.control(controls.key("Space")),
      ],
    },
  },
});

export interface ControllerHandlers {
  onFlap?: (source: "space" | "mouse-left" | "touch") => void;
  onReset?: () => void;
}

/**
 * One-button flight input shared by keyboard, mouse, and touch.
 */
export class Controller {
  private onKeyDown: ((event: KeyboardEvent) => void) | null = null;
  private onPointer: ((event: PointerEvent) => void) | null = null;
  private canvas: HTMLElement | null = null;
  private handlers: ControllerHandlers = {};

  public setup(handlers: ControllerHandlers = {}, canvasSelector = "#game"): void {
    this.destroy();
    this.handlers = handlers;

    this.onKeyDown = (event: KeyboardEvent) => {
      const code = event.code;

      if (event.repeat) return;

      if (code === "Space") {
        event.preventDefault();
        this.handlers.onFlap?.("space");
        return;
      }

      if (code === "KeyE") {
        event.preventDefault();
        this.handlers.onReset?.();
      }
    };

    window.addEventListener("keydown", this.onKeyDown);

    this.canvas = document.querySelector(canvasSelector);
    if (this.canvas) {
      this.onPointer = (event: PointerEvent) => {
        if (event.button === 0) {
          const source = event.pointerType === "touch" ? "touch" : "mouse-left";
          this.handlers.onFlap?.(source);
        }
      };
      this.canvas.addEventListener("pointerdown", this.onPointer);
    }
  }

  public destroy(): void {
    if (this.onKeyDown) window.removeEventListener("keydown", this.onKeyDown);
    if (this.canvas && this.onPointer) {
      this.canvas.removeEventListener("pointerdown", this.onPointer);
    }
    this.onKeyDown = null;
    this.onPointer = null;
    this.canvas = null;
    this.handlers = {};
  }
}
