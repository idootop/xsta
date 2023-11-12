import { ReactNode, useEffect, useRef, useState } from "react";
import { shallowEqual } from "external-shallow-equal";

let id = 0;
const newId = () => (id++).toString();

let states: Record<
  string,
  { state: any; rebuilds: Record<string, VoidFunction> }
> = {
  // [key]: {
  //   state: [state],
  //   rebuilds: {
  //     [id]: [rebuildCallback],
  //   },
  // },
};

/**
 * XSta is a featherlight React state management library that globalizes your state with the simplicity of a `useState`-like hook.
 */
export const XSta: {
  readonly get: <S = any>(key: string) => S;
  readonly set: <S = any>(key: string, state: S) => void;
  readonly remove: (key: string) => void;
  readonly clear: () => void;
} = {
  get(key) {
    return states[key]?.state;
  },
  set(key, state) {
    if (states[key]) {
      if (!shallowEqual(states[key].state, state)) {
        states[key].state = state;
        Object.values(states[key].rebuilds).forEach((rebuild) => rebuild());
      }
    } else {
      states[key] = {
        state: state,
        rebuilds: {},
      };
    }
  },
  remove(key) {
    delete states[key];
  },
  clear() {
    states = {};
  },
};

function useRebuild() {
  const [flag, setFlag] = useState(false);
  return () => setFlag(!flag);
}

function useInit<T = undefined>(fn: () => T, deps: any[]): T {
  const ref = useRef<any>({ inited: false, data: undefined, deps: undefined });
  if (!ref.current.inited || !shallowEqual(ref.current.deps, deps)) {
    ref.current.data = fn();
    ref.current.deps = deps;
    ref.current.inited = true;
  }
  return ref.current.data;
}

export function useXProvider<S = undefined>(
  key: string,
  initialState: (() => S) | S
) {
  useInit(() => {
    if (typeof initialState === "function") {
      initialState = (initialState as CallableFunction)();
    }
    if (!states[key]) {
      XSta.set(key, initialState);
    }
  }, []);
}

function addRebuildCallback(key: string, id: string, rebuild: VoidFunction) {
  if (states[key]) {
    states[key].rebuilds[id] = rebuild;
  } else {
    states[key] = { state: undefined, rebuilds: { [id]: rebuild } };
  }
}

function removeRebuildCallback(key: string, id: string) {
  if (states[key]) {
    delete states[key].rebuilds[id];
  }
}

type IXState<S = any> = [
  S, // state
  (value: S | ((prevState: S) => S)) => void, // setState
  () => S // getState
];

export function useXState<S = any>(
  key: string,
  initialState?: S | (() => S),
  options?: { selector?: (state: S | undefined) => any }
): IXState<S> {
  useXProvider(key, initialState);
  const ref = useRef({ id: newId(), rebuild: undefined as any });
  ref.current.rebuild = useRebuild();
  const getCurrent = (): IXState<S> => [
    XSta.get(key),
    (newState) => {
      if (typeof newState === "function") {
        const oldState = XSta.get(key);
        newState = (newState as CallableFunction)(oldState);
      }
      XSta.set(key, newState);
    },
    () => XSta.get(key),
  ];
  const selectorRef = useMemoSelectorRef<IXState<S>, S>({
    selector: options?.selector,
    getCurrent,
    getDeps: () => XSta.get(key),
    onChange: () => {
      ref.current.rebuild();
    },
  });
  useEffect(() => {
    const id = ref.current.id;
    addRebuildCallback(key, id, () => {
      selectorRef.current.diffChanges();
    });
    return () => {
      removeRebuildCallback(key, id);
    };
  }, [key, selectorRef]);
  return selectorRef.current.state ?? getCurrent();
}

function useMemoSelectorRef<S = any, D = S>(props: {
  getCurrent: () => S;
  getDeps?: () => D;
  selector?: (deps: D | undefined) => any;
  onChange?: (oldState: S, newState: S) => void;
  immediately?: boolean; // diff changes immediately
}) {
  const { getCurrent, getDeps, selector, onChange, immediately } = props;
  const ref = useRef<{
    inited: boolean;
    state: S;
    deps?: D;
    diffChanges: VoidFunction;
  }>({ inited: false } as any);
  if (!ref.current.inited) {
    ref.current.state = getCurrent();
    ref.current.inited = true;
  }
  ref.current.diffChanges = () => {
    const oldDeps = ref.current.deps;
    const newDeps = selector?.(getDeps?.());
    ref.current.deps = newDeps;
    if (!selector || !shallowEqual(oldDeps, newDeps)) {
      const newState = getCurrent();
      onChange?.(ref.current.state, newState);
      ref.current.state = newState;
    }
  };
  if (immediately) {
    ref.current.diffChanges();
  }
  return ref;
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
  children: ReactNode | ((state: any) => any);
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
