# useXState - React State Hook

`useXState` is a React hook that provides a simple way to manage global state. It works similarly to React's `useState`, but the state is shared across all components using the same key.

## API Reference

```tsx
const [state, setState] = useXState<T>(key: string, initialState?: T | (() => T));
```

**Parameters:**

- `key`: string - The unique identifier for the state
- `initialState`: value or function (optional) - Initial state value, only used if the key doesn't exist

**Returns:**

- `[state, setState]` - Current state and setter function

## Basic Usage

```tsx
import { useXState } from "xsta";

function Counter() {
  const [count, setCount] = useXState("counter", 0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}
```

## Sharing State Across Components

```tsx
// Component 1
function Controls() {
  const [count, setCount] = useXState("shared-counter", 0);
  return (
    <div>
      <button onClick={() => setCount((prev) => prev + 1)}>Increment</button>
      <button onClick={() => setCount((prev) => prev - 1)}>Decrement</button>
    </div>
  );
}

// Component 2
function Display() {
  const [count] = useXState("shared-counter");
  return <div>Count: {count}</div>;
}

// App
function App() {
  return (
    <>
      <Controls />
      <Display />
    </>
  );
}
```

## Silent Updates

Use the `silent` option to update state without triggering re-renders:

```tsx
function Analytics() {
  const [count, setCount] = useXState("counter", 0);

  const incrementSilently = () => {
    // Update state but don't trigger re-render
    setCount((prev) => prev + 1, { silent: true });
  };

  return (
    <div>
      <p>Visible count: {count}</p>
      <button onClick={incrementSilently}>Increment Silently</button>
    </div>
  );
}
```
