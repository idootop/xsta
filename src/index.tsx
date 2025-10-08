import { shallowEqual } from '@del-wang/equals';
import React from 'react';

import { useCleanup } from './useCleanup.js';

const GLOBAL_STORE = new Map<
  string,
  { state: any; callbacks: Set<VoidFunction> }
>();

type IOptions = { silent?: boolean };
type SetState<S = any> = S | ((prev: Readonly<S>) => S);
type MergeState<S = any> = Partial<S> | ((prev: Readonly<S>) => Partial<S>);

export const XSta = Object.freeze({
  keys: () => Array.from(GLOBAL_STORE.keys()),
  has: (key: string) => GLOBAL_STORE.has(key),
  clear: () => GLOBAL_STORE.clear(),
  delete: (key: string) => GLOBAL_STORE.delete(key),
  get: <S = any>(key: string) => {
    if (!GLOBAL_STORE.has(key)) throw new Error(`XSta.get: ${key} not found`);
    return GLOBAL_STORE.get(key)!.state as S;
  },
  set<S = any>(key: string, newState: SetState<S>, options?: IOptions) {
    const state =
      typeof newState === 'function'
        ? (newState as Function)(GLOBAL_STORE.get(key)?.state)
        : newState;
    if (!GLOBAL_STORE.has(key)) {
      GLOBAL_STORE.set(key, { state, callbacks: new Set() });
      return;
    }
    GLOBAL_STORE.get(key)!.state = state;
    if (options?.silent) return;
    GLOBAL_STORE.get(key)!.callbacks.forEach((callback) => callback());
  },
  merge<S = any>(key: string, newState: MergeState<S>, options?: IOptions) {
    const state =
      typeof newState === 'function' ? newState(XSta.get(key)) : newState;
    XSta.set(key, { ...XSta.get(key), ...state }, options);
  },
  subscribe(key: string, callback: () => void) {
    GLOBAL_STORE.get(key)?.callbacks.add(callback);
    return () => GLOBAL_STORE.get(key)?.callbacks.delete(callback);
  },
});

export function useXComputed<S = any, V = S, D = V>(
  key: string,
  watch: (state: S) => V,
  transform?: (value: V) => D,
) {
  const refs = React.useRef({} as any);
  refs.current.watch = watch;
  refs.current.transform = transform ?? ((v: V) => v as any);
  if (!refs.current.initialized) {
    refs.current.prev = refs.current.watch(XSta.get(key));
    refs.current.value = refs.current.transform(refs.current.prev);
    refs.current.initialized = true;
  }
  const [flag, setFlag] = React.useState(false);
  refs.current.rebuild = () => setFlag(!flag);
  refs.current.callback = () => {
    const current = refs.current.watch(XSta.get(key));
    if (shallowEqual(current, refs.current.prev)) return;
    refs.current.prev = current;
    refs.current.value = refs.current.transform(current);
    refs.current.rebuild();
  };
  React.useEffect(() => {
    const unsubscribe = XSta.subscribe(key, () => refs.current.callback());
    return () => unsubscribe() as any;
  }, [key]);
  return refs.current.value as D;
}

export function useXState<S = any>(key: string, initialState?: S | (() => S)) {
  if (!GLOBAL_STORE.has(key) && initialState !== undefined) {
    XSta.set(key, initialState); // only initialize once
  }
  const value = useXComputed<S>(key, (s) => s);
  const setState = React.useCallback(
    (newState: SetState<S>, options?: IOptions) =>
      XSta.set<S>(key, newState, options),
    [key],
  );
  const mergeState = React.useCallback(
    (newState: MergeState<S>, options?: IOptions) =>
      XSta.merge<S>(key, newState, options),
    [key],
  );
  return [value, setState, mergeState] as const;
}

export function useXRoot<S = any>(key: string, initialState?: S | (() => S)) {
  if (!GLOBAL_STORE.has(key) && initialState !== undefined) {
    XSta.set(key, initialState); //  init on mount
  }
  useCleanup(() => XSta.delete(key)); // destroy on unmount
}

interface WatchProps<S = any, V = S> {
  xKey: string;
  watch: (state: S) => V;
  children: (state: V) => React.ReactNode;
}

export function XWatch<S = any, V = S>(props: WatchProps<S, V>) {
  const { xKey, watch, children } = props;
  const value = useXComputed(xKey, watch);
  return typeof children === 'function' ? children(value) : children;
}

export function XMemo<S = any, V = S>(props: WatchProps<S, V>) {
  const { xKey, watch, children } = props;
  return useXComputed(xKey, watch, (value) =>
    typeof children === 'function' ? children(value) : children,
  );
}

let id = 0;
export function createXStore<S>(
  keyOrInitialState?: string | S,
  initialState?: S,
) {
  const hasKey = initialState !== undefined;
  const key = hasKey ? (keyOrInitialState as string) : (id++).toString();
  XSta.set(key, !hasKey ? keyOrInitialState : initialState);
  return Object.freeze({
    getState: () => XSta.get<S>(key),
    setState: (newState: SetState<S>, options?: IOptions) =>
      XSta.set<S>(key, newState, options),
    mergeState: (newState: MergeState<S>, options?: IOptions) =>
      XSta.merge<S>(key, newState, options),
    useXState: () => useXState<S>(key),
    useXComputed: <V = S, D = V>(
      watch: (state: S) => V,
      transform?: (value: V) => D,
    ) => useXComputed<S, V, D>(key, watch, transform),
    XMemo: <V = S>(props: Omit<WatchProps<S, V>, 'xKey'>) => (
      <XMemo {...props} xKey={key} />
    ),
    XWatch: <V = S>(props: Omit<WatchProps<S, V>, 'xKey'>) => (
      <XWatch {...props} xKey={key} />
    ),
  });
}
