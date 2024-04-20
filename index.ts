import { useEffect, useRef, useState, ReactNode } from "react";
import { shallowEqual } from "external-shallow-equal";

type StateRef = { state?: any; rebuilds: Map<string, VoidFunction> };
const kStates = new Map<string, StateRef>();

class _XSta {
  set<S = any>(key: string, nextState: SetXStateAction<S>) {
    let needRefresh = false;
    if (typeof nextState === "function") {
      const prevState = XSta.get(key);
      nextState = (nextState as CallableFunction)(prevState);
      if (nextState === undefined) {
        needRefresh = true;
        nextState = prevState;
      }
    }
    const currentStateRef = kStates.get(key);
    if (currentStateRef) {
      if (needRefresh || !shallowEqual(currentStateRef.state, nextState)) {
        currentStateRef.state = nextState;
        currentStateRef.rebuilds.forEach((rebuild) => rebuild());
      }
    } else {
      kStates.set(key, { state: nextState, rebuilds: new Map() });
    }
  }
  get = <S = any>(key: string): S => kStates.get(key)?.state;
  delete = (key: string) => kStates.delete(key);
  clear = () => kStates.clear();
}

export const XSta = new _XSta();

export type SetXStateAction<S = any> = S | ((prevState: S) => S | void);
export type IXState<S = any> = [S, (value: SetXStateAction<S>) => void];
export type IXStateSelector<S = any> = (state: S) => any;
export function useXState<S = any>(
  key: string,
  initialState?: S | (() => S),
  options?: { selector?: IXStateSelector<S> }
): IXState<S> {
  useXProvider(key, initialState);
  const [flag, setFlag] = useState(false);
  const rebuild = () => setFlag(!flag);
  const ref = useRef({ id: `${newId()}`, rebuild });
  ref.current.rebuild = rebuild;
  const getCurrent = (): IXState<S> => [
    XSta.get(key),
    (nextState) => XSta.set(key, nextState),
  ];
  const selectorRef = useMemoSelectorRef<IXState<S>, S>({
    selector: options?.selector,
    getCurrent,
    getDeps: () => XSta.get(key),
    onChange: () => ref.current.rebuild(),
  });
  useEffect(() => {
    const id = ref.current.id;
    registerRebuildFn(key, id, () => selectorRef.current.diffChanges());
    return () => unregisterRebuildFn(key, id) as any;
  }, [key, selectorRef]);
  return selectorRef.current.state ?? getCurrent();
}

export abstract class XStaManager<S = any> {
  abstract key: string;
  abstract initialState: S;
  getState = () => XSta.get<S>(this.key) ?? this.initialState;
  setState = (nextState: S) => XSta.set<S>(this.key, nextState);
  deleteState = () => XSta.delete(this.key);
  useState = (options?: { selector?: IXStateSelector<S> }) =>
    useXState<S>(this.key, this.initialState, options);
  Consumer = (props: IConsumerProps<S>) =>
    XConsumer<S>({ provider: this.key, ...props });
}

export const createXStaManager = <S = any>(props: {
  key: string;
  initialState: S;
}) => {
  const { key, initialState } = props;
  return {
    key,
    initialState,
    getState: () => XSta.get<S>(key) ?? initialState,
    setState: (nextState: S) => XSta.set<S>(key, nextState),
    deleteState: () => XSta.delete(key),
    useState: (options?: { selector?: IXStateSelector<S> }) =>
      useXState<S>(key, initialState, options),
    Consumer: (props: IConsumerProps<S>) =>
      XConsumer<S>({ provider: key, ...props }),
  };
};

export function useXConsumer<S = any>(
  key: string,
  selector?: IXStateSelector<S>
) {
  return useXState(key, undefined, { selector });
}

type IConsumerProps<S = any> = {
  selector?: IXStateSelector<S>;
  children: ReactNode | ((state: S) => ReactNode);
};
export const XConsumer = <S = any>(
  props: IConsumerProps<S> & { provider: string }
) => {
  const { provider, selector, children } = props;
  const [state] = useXConsumer<S>(provider, selector);
  const memoChildrenRef = useMemoSelectorRef<ReactNode, S>({
    selector,
    getCurrent: () => {
      if (typeof children === "function") {
        return children(state);
      }
      return children;
    },
    getDeps: () => XSta.get(provider),
    immediately: true,
  });
  return memoChildrenRef.current.state;
};

let id = 0;
const newId = () => id++;
const registerRebuildFn = (key: string, id: string, rebuild: VoidFunction) => {
  if (kStates.has(key)) {
    kStates.get(key)!.rebuilds.set(id, rebuild);
  } else {
    kStates.set(key, { rebuilds: new Map().set(id, rebuild) });
  }
};
const unregisterRebuildFn = (key: string, id: string) =>
  kStates.get(key)?.rebuilds.delete(id);

function useInit<T = any>(fn: () => T, deps?: any[]): T {
  const ref = useRef<{ initialized?: boolean; data?: T; deps?: any[] }>({});
  if (!ref.current.initialized || !shallowEqual(ref.current.deps, deps)) {
    ref.current = { initialized: true, data: fn(), deps };
  }
  return ref.current.data!;
}

export function useXProvider<S = any>(
  key: string,
  initialState: (() => S) | S
) {
  useInit(() => {
    if (typeof initialState === "function") {
      initialState = (initialState as CallableFunction)();
    }
    if (!kStates.has(key)) {
      XSta.set(key, initialState); // only initialize once
    }
  }, []);
}

function useMemoSelectorRef<S = any, D = any>(props: {
  getCurrent: () => S;
  getDeps: () => D;
  selector?: (deps: D) => any;
  onChange?: (prevState: S, nextState: S) => void;
  immediately?: boolean; // diff changes immediately
}) {
  const { getCurrent, getDeps, selector, onChange, immediately } = props;
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
  if (immediately) ref.current.diffChanges();
  return ref;
}
