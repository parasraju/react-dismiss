import type { RefObject } from "react";
import { useDismiss } from "../index.js";

declare const onDismiss: () => void;

export function DivRefAccepted(ref: RefObject<HTMLDivElement>): void {
  useDismiss(ref, onDismiss);
  useDismiss<HTMLDivElement>(ref, onDismiss);
  useDismiss<HTMLDivElement>([ref, ref], onDismiss);
}

export function ButtonRefAccepted(ref: RefObject<HTMLButtonElement>): void {
  useDismiss(ref, onDismiss);
  useDismiss<HTMLButtonElement>(ref, onDismiss);
}

export function MismatchedRefRejected(ref: RefObject<HTMLButtonElement>): void {
  // @ts-expect-error button ref is not a div
  useDismiss<HTMLDivElement>(ref, onDismiss);
}
