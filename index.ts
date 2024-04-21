import { useEffect, useRef, useState, ReactNode } from 'react';
import { shallowEqual } from 'external-shallow-equal';

type StateContainer = { state?: any; rebuilds: Map<string, VoidFunction> };
const kStates = new Map<string, StateContainer>();

class _XSta {
  set<S = any>(key: string, nextState: SetXStateAction<S>) {
    let needRefresh = false;
    if (typeof nextState === 'function') {
      const prevState = XSta.get(key);
      nextState = (nextState as CallableFunction)(prevState);
      if (nextState === undefined) {
        needRefresh = true;
        nextState = prevState;
      }
    }
    const currentStateContainer = kStates.get(key);
    if (currentStateContainer) {
      if (needRefresh || !shallowEqual(currentStateContainer.state, nextState)) {
        currentStateContainer.state = nextState;
        currentStateContainer.rebuilds.forEach(rebuild => rebuild());
      }
    } else {
      kStates.set(key, { state: nextState, rebuilds: new Map() });
    }
  }
  get<S = any>(key: string, initialState?: InitialState<S>): S {
    return kStates.get(key)?.state ?? getValue(initialState);
  }
  delete(key: string) {
    const rebuilds = Array.from(kStates.get(key)?.rebuilds?.values() ?? []);
    kStates.delete(key);
    rebuilds.forEach(rebuild => rebuild());
  }
  clear() {
    const rebuilds = Array.from(kStates.values()).reduce((pre, e) => {
      return pre.concat(e.rebuilds.values());
    }, [] as any[]);
    kStates.clear();
    rebuilds.forEach(rebuild => rebuild());
  }
}

export const XSta = new _XSta();

type SetXStateAction<S = any> = S | ((prevState: S) => S | void);
type XState<S = any> = [S, (value: SetXStateAction<S>) => void];
type XStateSelector<S = any> = (state: S) => any;
type InitialState<S = any> = S | (() => S);
type UseStateOptions<S = any> = { selector?: XStateSelector<S> };
export function useXState<S = any>(key: string, initialState?: InitialState<S>, options?: UseStateOptions<S>): XState<S> {
  useXProvider(key, initialState);
  const [flag, setFlag] = useState(false);
  const rebuild = () => setFlag(!flag);
  const ref = useRef({ id: `${newId()}`, rebuild });
  ref.current.rebuild = rebuild;
  const selectorRef = useMemoWithSelector<XState<S>, S>({
    selector: options?.selector,
    getDeps: () => XSta.get(key, initialState),
    onChange: () => ref.current.rebuild(),
    getCurrent: () => [XSta.get(key, initialState), nextState => XSta.set(key, nextState)],
  });
  useEffect(() => {
    registerRebuildFn(key, ref.current.id, selectorRef.current.diffChanges);
    return () => unregisterRebuildFn(key, ref.current.id) as any;
  }, [rebuild]);
  return selectorRef.current.state;
}

export abstract class XStaManager<S = any> {
  abstract key: string;
  abstract initialState: InitialState<S>;
  getState = () => XSta.get<S>(this.key, this.initialState);
  setState = (nextState: SetXStateAction<S>) => XSta.set<S>(this.key, nextState);
  deleteState = () => XSta.delete(this.key);
  useState = (options?: UseStateOptions<S>) => useXState<S>(this.key, this.initialState, options);
  Consumer = (props: IConsumerProps<S>) => XConsumer<S>({ provider: this.key, ...props });
}

export const createXStaManager = <S = any>(props: { key: string; initialState: InitialState<S> }) => {
  const { key, initialState } = props;
  return {
    key,
    initialState,
    getState: () => XSta.get<S>(key, initialState),
    setState: (nextState: SetXStateAction<S>) => XSta.set<S>(key, nextState),
    deleteState: () => XSta.delete(key),
    useState: (options?: UseStateOptions<S>) => useXState<S>(key, initialState, options),
    Consumer: (props: IConsumerProps<S>) => XConsumer<S>({ provider: key, ...props }),
  };
};

export const useXConsumer = <S = any>(key: string, selector?: XStateSelector<S>) => {
  return useXState(key, undefined, { selector });
};

type IConsumerProps<S = any> = { selector?: XStateSelector<S>; children: ReactNode | ((state: S) => ReactNode) };
export const XConsumer = <S = any>(props: IConsumerProps<S> & { provider: string }) => {
  const { provider, selector, children } = props;
  const [state] = useXConsumer<S>(provider, selector);
  const memoChildrenRef = useMemoWithSelector<ReactNode, S>({
    selector,
    getDeps: () => XSta.get(provider),
    getCurrent: () => (typeof children === 'function' ? children(state) : children),
  });
  memoChildrenRef.current.diffChanges();
  return memoChildrenRef.current.state;
};

let id = 0;
const newId = () => id++;
const getValue = <S = any>(data: S | (() => S)) => {
  return typeof data === 'function' ? (data as CallableFunction)() : data;
};
const registerRebuildFn = (key: string, id: string, rebuild: VoidFunction) => {
  if (kStates.has(key)) {
    kStates.get(key)!.rebuilds.set(id, rebuild);
  } else {
    kStates.set(key, { rebuilds: new Map().set(id, rebuild) });
  }
};
const unregisterRebuildFn = (key: string, id: string) => kStates.get(key)?.rebuilds.delete(id);

function useInit<T = any>(fn: () => T, deps?: any[]): T {
  const ref = useRef<{ initialized?: boolean; data?: T; deps?: any[] }>({});
  if (!ref.current.initialized || !shallowEqual(ref.current.deps, deps)) {
    ref.current = { initialized: true, data: fn(), deps };
  }
  return ref.current.data!;
}

export function useXProvider<S = any>(key: string, initialState: InitialState<S>) {
  useInit(() => {
    !kStates.has(key) && XSta.set(key, initialState); // only initialize once
  }, []);
}

type IUseMemoWithSelector<S = any, D = any> = {
  getCurrent: () => S;
  getDeps: () => D;
  selector?: (deps: D) => any;
  onChange?: (prevState: S, nextState: S) => void;
};
function useMemoWithSelector<S = any, D = any>(props: IUseMemoWithSelector<S, D>) {
  const { getCurrent, getDeps, selector, onChange } = props;
  const ref = useRef<{
    initialized: boolean;
    state: S;
    deps?: D;
    diffChanges: VoidFunction;
  }>({ initialized: false } as any);
  if (!ref.current.initialized) {
    ref.current = { initialized: true, state: getCurrent() } as any;
  }
  ref.current.diffChanges = () => {
    const oldDeps = ref.current.deps;
    const newDeps = selector?.(getDeps());
    ref.current.deps = newDeps;
    if (!selector || !shallowEqual(oldDeps, newDeps)) {
      const nextState = getCurrent();
      onChange?.(ref.current.state, nextState);
      ref.current.state = nextState;
    }
  };
  return ref;
}
