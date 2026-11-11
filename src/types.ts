export interface UseDismissOptions {
  /**
   * Whether dismissal listeners are active.
   * @default true
   */
  enabled?: boolean;
  /**
   * Whether outside interaction triggers dismissal.
   * @default true
   */
  outside?: boolean;
  /**
   * Whether pressing Escape triggers dismissal.
   * @default true
   */
  escape?: boolean;
  /**
   * DOM event used to detect outside interaction.
   * @default "pointerdown"
   */
  event?: "pointerdown" | "click";
  /**
   * Refs whose clicks never trigger dismissal. Accepts one ref or several.
   * Useful for toggle buttons that live outside the dismissed element.
   */
  ignore?:
    | React.RefObject<HTMLElement | null>
    | React.RefObject<HTMLElement | null>[];
}
