import { useEffect, useRef, useState } from "react";
import { Dispatch, ReactNode, SetStateAction } from "react";
import { shallowEqual } from "external-shallow-equal";

type StateRef = { state?: any; rebuilds: Map<string, VoidFunction> };
const kStates = new Map<string, StateRef>();

class _XSta {
  set<S = any>(key: string, nextState: S | ((prevState: S) => S | void)) {
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

export type IXState<S = any> = [S, Dispatch<SetStateAction<S>>];

export function useXState<S = any>(
  key: string,
  initialState?: S | (() => S),
  options?: { selector?: (state: S | undefined) => any }
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

export function useXConsumer<S = any>(
  xkey: string,
  selector?: (state: S | undefined) => any
) {
  return useXState(xkey, undefined, { selector });
}

export const XConsumer = (props: {
  xkey: string;
  selector?: (state: any) => any;
  children: ReactNode | ((state: any) => ReactNode);
}) => {
  const { xkey, selector, children } = props;
  const [state] = useXConsumer(xkey, selector);
  const memoChildrenRef = useMemoSelectorRef({
    selector,
    getCurrent: () => {
      if (typeof children === "function") {
        return children(state);
      }
      return children;
    },
    getDeps: () => XSta.get(xkey),
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

function useMemoSelectorRef<S = any, D = S>(props: {
  getCurrent: () => S;
  getDeps?: () => D;
  selector?: (deps: D | undefined) => any;
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
    const newDeps = selector?.(getDeps?.());
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
