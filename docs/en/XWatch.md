# XWatch - Watch Component

`XWatch` is a React component that watches state changes and re-renders its children when the watched value changes.

## API Reference

```tsx
<XWatch xKey={string} watch={(state) => value}>
  {children}
</XWatch>
```

**Props:**

- `xKey`: string - The state key to watch
- `children`: function - ReactNode builder that receives the watched value
- `watch`: function(optional) - Function that extracts the value to watch from state
- `transform`: function (optional) - Function to transform the watched value

## Basic Usage

```tsx
import { XWatch, useXState } from "xsta";

function App() {
  const [, setCount] = useXState("counter", 0);

  return (
    <div>
      <XWatch xKey="counter" watch={(state: number) => state}>
        {(count) => <div>Count: {count}</div>}
      </XWatch>
      <button onClick={() => setCount((prev) => prev + 1)}>Increment</button>
    </div>
  );
}
```

## With `transform`

```tsx
import { XWatch, useXState } from "xsta";

function App() {
  const [, setCount] = useXState("counter", 0);

  return (
    <div>
      <XWatch
        xKey="counter"
        watch={(state: number) => state}
        transform={(state: number) => `Count: ${state}`}
      >
        {(message) => <div>{message}</div>}
      </XWatch>
      <button onClick={() => setCount((prev) => prev + 1)}>Increment</button>
    </div>
  );
}
```
