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
}
