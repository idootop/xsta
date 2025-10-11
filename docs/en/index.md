# XSta

An ultra-lightweight (< 200 lines) React state management library.

## Installation

```bash
npm install xsta
```

## Quick Start

### 1. Basic Usage

Replace `useState` with `useXState`:

```tsx
import { useXState } from "xsta";

function Counter() {
  const [count, setCount] = useXState("count", 0);

  return <button onClick={() => setCount(count + 1)}>Count: {count}</button>;
}
```

### 2. Access State Outside Components

```tsx
import { XSta } from "xsta";

function increment() {
  const count = XSta.get("count");
  XSta.set("count", count + 1);
}
```

### 3. Create a Store with Actions (Recommended)

```tsx
import { createXStore } from "xsta";

const counterStore = createXStore({
  count: 0,
  increment() {
    counterStore.setState((s) => ({ count: s.count + 1 }));
  },
});

function Counter() {
  const [state] = counterStore.useXState();

  return (
    <div>
      <p>Count: {state.count}</p>
      <button onClick={state.increment}>+</button>
    </div>
  );
}
```

### 4. Performance Optimization

Only re-render when specific values change:

```tsx
const total = store.useXComputed((state) =>
  state.items.reduce((sum, item) => sum + item.price, 0)
);
```

## Complete API List

### Core APIs

#### [`useXState(key, initialState?)`](./useXState.md)

Global state hook, like `useState` but shared across components.

#### [`createXStore(initialState)`](./createXStore.md)

Create an isolated store with state and actions. Returns store object with hooks and methods.

#### [`XSta`](./XSta.md)

Global state manager for accessing state outside React:

- `get(key)` - Get state value
- `set(key, value, options?)` - Set state value
- `has(key)` - Check if state exists
- `delete(key)` - Remove state
- `clear()` - Clear all states
- `keys()` - Get all state keys
- `subscribe(key, callback)` - Subscribe to state changes

### Performance APIs

#### [`useXComputed(key, selector?, transform?)`](./useXComputed.md)

Subscribe to state with optional selector. Only re-renders when selected value changes.

#### [`XWatch`](./XWatch.mdx)

Component wrapper for selective state subscription with render function.

#### [`XMemo`](./XMemo.md)

Like `XWatch` but memoizes the children for expensive renders.

### Lifecycle APIs

#### [`useXRoot(key, initialState?)`](./useXRoot.md)

Initialize state and automatically cleanup on component unmount.

---

📖 [View detailed examples and patterns](./createXStore.md)
