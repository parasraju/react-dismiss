const dismissers = new Set<() => void>();

export function registerDismiss(dismiss: () => void): () => void {
  dismissers.add(dismiss);
  return () => {
    dismissers.delete(dismiss);
  };
}

function dismissAll(): void {
  for (const dismiss of [...dismissers]) {
    dismiss();
  }
}

export function useDismissAll(): () => void {
  return dismissAll;
}
