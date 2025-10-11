import { shallowEqual } from '@del-wang/equals';
import React from 'react';

import { useCleanup } from './useCleanup.js';

const GLOBAL_STORE = new Map<
  string,
  { state: any; callbacks: Set<VoidFunction> }
>();

type IOptions = { silent?: boolean };
type SetState<S = any> =
  | (S | Partial<S>)
  | ((prev: S) => S | Partial<S> | void);

type PlainObject = Record<any, {}>;
const isPlainObject = (value: any) =>
  value != null && value.__proto__ === Object.prototype;

export const XSta = {
  keys: () => Array.from(GLOBAL_STORE.keys()),
  has: (key: string) => GLOBAL_STORE.has(key),
  clear: () => GLOBAL_STORE.clear(),
  delete: (key: string) => GLOBAL_STORE.delete(key),
  subscribe(key: string, callback: () => void) {
    GLOBAL_STORE.get(key)?.callbacks.add(callback);
    return () => GLOBAL_STORE.get(key)?.callbacks.delete(callback);
  },
  get: <S = any>(key: string) => {
    if (!GLOBAL_STORE.has(key)) throw new Error(`XSta.get: ${key} not found`);
    return GLOBAL_STORE.get(key)!.state as S;
  },
  set<S = any>(key: string, newState: SetState<S>, options?: IOptions) {
    let needRefresh = false;
    const currentState = GLOBAL_STORE.get(key)?.state;
    let isPlainObj = isPlainObject(newState) || isPlainObject(currentState);
    if (typeof newState === 'function') {
      newState = (newState as Function)(currentState);
      if (isPlainObj && newState === undefined) {
        needRefresh = true;
      } else {
        isPlainObj = isPlainObj || isPlainObject(newState);
      }
    }
    if (!GLOBAL_STORE.has(key)) {
      GLOBAL_STORE.set(key, { state: newState, callbacks: new Set() });
      return;
    }
    newState = isPlainObj ? { ...currentState, ...newState } : newState;
    if (!needRefresh && shallowEqual(newState, currentState)) return;
    GLOBAL_STORE.get(key)!.state = newState;
    if (options?.silent) return;
    GLOBAL_STORE.get(key)!.callbacks.forEach((callback) => callback());
  },
};

export function useXComputed<S = any, V = S, D = V>(
  key: string,
  watch?: (state: S) => V,
  transform?: (value: V) => D,
) {
  const refs = React.useRef({} as any);
  refs.current.watch = watch;
  refs.current.transform = transform ?? ((v: V) => v as any);
  if (!refs.current.initialized) {
    let current = XSta.get(key);
    if (refs.current.watch) current = refs.current.watch(current);
    refs.current.prev = current;
    refs.current.value = refs.current.transform(refs.current.prev);
    refs.current.initialized = true;
  }
  const [flag, setFlag] = React.useState(false);
  refs.current.rebuild = () => setFlag(!flag);
  refs.current.callback = () => {
    let current = XSta.get(key);
    if (refs.current.watch) {
      current = refs.current.watch(current);
      if (shallowEqual(current, refs.current.prev)) return;
    }
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

const NULL = Symbol('NULL');
type InitialState<S = any> = S | (() => S) | typeof NULL;
const initState = (key: string, state: InitialState) =>
  !GLOBAL_STORE.has(key) && state !== NULL && XSta.set(key, state);
export function useXState<S = any>(key: string, state: InitialState<S> = NULL) {
  initState(key, state); // only initialize once
  const value = useXComputed<S>(key);
  const setState = React.useCallback(
    (newState: SetState<S>, options?: IOptions) =>
      XSta.set<S>(key, newState, options),
    [key],
  );
  return [value, setState] as const;
}

export function useXRoot<S = any>(key: string, state: InitialState<S> = NULL) {
  initState(key, state); // only initialize once
  useCleanup(() => XSta.delete(key)); // destroy on unmount
}

interface WatchProps<S = any, V = S, D = V> {
  xKey: string;
  watch?: (state: S) => V;
  transform?: (value: V) => D;
  children: (state: D) => React.ReactNode;
}

export function XWatch<S = any, V = S, D = V>(props: WatchProps<S, V, D>) {
  const { xKey, watch, transform, children } = props;
  const value = useXComputed(xKey, watch, transform);
  return typeof children === 'function' ? children(value) : children;
}

export function XMemo<S = any, V = S, D = V>(props: WatchProps<S, V, D>) {
  const { xKey, watch, transform, children } = props;
  return useXComputed(xKey, watch, (data) => {
    const value = transform ? transform(data) : (data as unknown as D);
    return typeof children === 'function' ? children(value) : children;
  });
}

let id = 0;
export function createXStore<S extends PlainObject>(
  keyOrInitialState?: string | S,
  state: S | typeof NULL = NULL,
) {
  const hasKey = state !== NULL;
  const key = hasKey ? (keyOrInitialState as string) : (id++).toString();
  XSta.set(key, !hasKey ? keyOrInitialState : state);
  return {
    getState: () => XSta.get<S>(key),
    setState: (newState: SetState<S>, options?: IOptions) =>
      XSta.set<S>(key, newState, options),
    useXState: () => useXState<S>(key),
    useXComputed: <V = S, D = V>(
      watch: (state: S) => V,
      transform?: (value: V) => D,
    ) => useXComputed<S, V, D>(key, watch, transform),
    XMemo: <V = S, D = V>(props: Omit<WatchProps<S, V, D>, 'xKey'>) => (
      <XMemo {...props} xKey={key} />
    ),
    XWatch: <V = S, D = V>(props: Omit<WatchProps<S, V, D>, 'xKey'>) => (
      <XWatch {...props} xKey={key} />
    ),
  };
}
