import { shallowEqual } from '@del-wang/equals';
import {
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

const GLOBAL_STORE = new Map<
  string,
  { state: any; callbacks: Set<VoidFunction> }
>();

type SetState<S = any> = S | ((prev: Readonly<S>) => Partial<S>);
type SetStateOptions = { silent?: boolean; merge?: boolean };

export const XSta = Object.freeze({
  keys: () => Array.from(GLOBAL_STORE.keys()),
  has: (key: string) => GLOBAL_STORE.has(key),
  clear: () => GLOBAL_STORE.clear(),
  delete: (key: string) => GLOBAL_STORE.delete(key),
  get: <S = any>(key: string) => {
    if (!GLOBAL_STORE.has(key)) throw new Error(`XSta: ${key} not found`);
    return GLOBAL_STORE.get(key)!.state as S;
  },
  set<S = any>(key: string, newState: SetState<S>, options?: SetStateOptions) {
    let state =
      typeof newState === 'function'
        ? (newState as Function)(GLOBAL_STORE.get(key)?.state)
        : newState;
    if (options?.merge) {
      state = { ...GLOBAL_STORE.get(key)?.state, ...state };
    }
    if (!GLOBAL_STORE.has(key)) {
      GLOBAL_STORE.set(key, { state, callbacks: new Set() });
      return;
    }
    GLOBAL_STORE.get(key)!.state = state;
    if (options?.silent) return;
    GLOBAL_STORE.get(key)!.callbacks.forEach((callback) => callback());
  },
  subscribe(key: string, callback: () => void) {
    GLOBAL_STORE.get(key)!.callbacks.add(callback);
    return () => GLOBAL_STORE.get(key)!.callbacks.delete(callback);
  },
});

export function useXComputed<S = any, V = S, D = V>(
  key: string,
  watch: (state: S) => V,
  transform?: (value: V) => D,
) {
  const refs = useRef({} as any);
  refs.current.watch = watch;
  refs.current.transform = transform ?? ((v: V) => v as any);

  if (!refs.current.initialized) {
    refs.current.prev = refs.current.watch(XSta.get(key));
    refs.current.value = refs.current.transform(refs.current.prev);
    refs.current.initialized = true;
  }

  const [flag, setFlag] = useState(false);
  refs.current.rebuild = () => setFlag(!flag);

  const callback = () => {
    const current = refs.current.watch(XSta.get(key));
    if (shallowEqual(current, refs.current.prev)) return;
    refs.current.prev = current;
    refs.current.value = refs.current.transform(current);
    refs.current.rebuild();
  };
  refs.current.callback = callback;

  useEffect(() => {
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
  const setState = useCallback(
    (newState: SetState<S>, options?: SetStateOptions) =>
      XSta.set<S>(key, newState, options),
    [key],
  );
  return [value, setState] as const;
}

export function useXRoot<S = any>(key: string, initialState?: S | (() => S)) {
  if (!GLOBAL_STORE.has(key) && initialState !== undefined) {
    XSta.set(key, initialState); // only initialize once
  }
  useEffect(() => {
    return () => XSta.delete(key) as any; // destroy on unmount
  }, [key]);
}

interface WatchProps<S = any, V = S> {
  xKey: string;
  watch: (state: S) => V;
  children: ReactNode | ((state: V) => ReactNode);
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
export function createXStore<S>(initialState: S) {
  const key = (id++).toString();
  XSta.set(key, initialState);
  return Object.freeze({
    getState: () => XSta.get<S>(key),
    setState: (newState: SetState<S>, options?: SetStateOptions) =>
      XSta.set<S>(key, newState, options),
    useXState: () => useXState<S>(key),
    useXComputed: <S = any, V = S, D = V>(
      watch: (state: S) => V,
      transform?: (value: V) => D,
    ) => useXComputed<S, V, D>(key, watch, transform),
    XMemo: <V = S>(
      watch: (state: S) => V,
      children: ReactNode | ((state: V) => ReactNode),
    ) => (
      <XMemo watch={watch} xKey={key}>
        {children}
      </XMemo>
    ),
    XWatch: <V = S>(
      watch: (state: S) => V,
      children: ReactNode | ((state: V) => ReactNode),
    ) => (
      <XWatch watch={watch} xKey={key}>
        {children}
      </XWatch>
    ),
  });
}
