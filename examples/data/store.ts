import { useSyncExternalStore } from 'react';

/**
 * A tiny, generic, reactive store for the reference app's mock ERP data — plain objects,
 * `useSyncExternalStore` (built into React, no new dependency), and a `reset()` that restores the
 * exact seed data. This lives in `examples/`, not `src/`: it's reference-app state (documents,
 * simulated business actions), not a design-system capability — AGENTS.md's boundary keeps ERP
 * data/business rules out of the shared package, the same reason `preview/client.tsx` already
 * holds its own local nav state rather than the package owning it.
 *
 * Deliberately NOT Redux/Zustand/Jotai/etc: the whole point of this file is what those libraries
 * already give you in ~30 lines, and AGENTS.md's dependency bar (demonstrated need, existing
 * alternatives, maintenance cost) isn't met by "state management" in the abstract — see Chart.tsx
 * for the actual bar a new dependency has to clear in this package.
 */

export type Listener = () => void;

export type Store<State> = {
  getState: () => State;
  /** `updater` must return a new top-level object — mutate nothing in place, so `subscribe`d
   * reads and `useSyncExternalStore`'s reference-equality check both see the change. */
  setState: (updater: (state: State) => State) => void;
  subscribe: (listener: Listener) => () => void;
  /** Restores the exact seed state passed to `createStore` — a deep, independent clone taken at
   * creation time, so mutating `state` after creation can never corrupt the reset target. */
  reset: () => void;
};

export function createStore<State>(seed: State): Store<State> {
  const seedSnapshot = structuredClone(seed);
  let state = seed;
  const listeners = new Set<Listener>();

  function notify() {
    for (const listener of listeners) listener();
  }

  return {
    getState: () => state,
    setState(updater) {
      state = updater(state);
      notify();
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    reset() {
      state = structuredClone(seedSnapshot);
      notify();
    },
  };
}

/** Reads a `Store<State>` reactively via `selector`, re-rendering only when the selected slice's
 * object identity changes (the store's own immutable-update contract makes that a real signal,
 * not a false negative) — the same selector pattern Redux/Zustand's own hooks use. */
export function useStoreState<State, Selected>(store: Store<State>, selector: (state: State) => Selected): Selected {
  return useSyncExternalStore(store.subscribe, () => selector(store.getState()));
}
