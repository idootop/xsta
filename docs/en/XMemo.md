# XMemo - Memoized Component

`XMemo` is similar to `XWatch` but optimized for memoized rendering. It's a React component useful for computing and memoizing expensive values that can be passed as props or used in JSX.

## API Reference

```tsx
<XMemo xKey={string} watch={(state) => value}>
  {children}
</XMemo>
```

**Props:**

- `xKey`: string - The state key to watch
- `children`: function - ReactNode builder that receives the watched value
- `watch`: function (optional) - Function that extracts the value to watch from state
- `transform`: function (optional) - Function to transform the watched value

## Basic Usage

```tsx
function App() {
  const [, setState] = useXState("app", {
    criticalData: { value: 0 },
    nonCriticalData: { value: 0 },
  });

  return (
    <div>
      {/* This only re-renders when criticalData changes */}
      <XMemo xKey="app" watch={(app) => app.criticalData}>
        {(data) => <ExpensiveComponent data={data} />}
      </XMemo>

      <button
        onClick={() =>
          setState((prev) => ({
            nonCriticalData: { value: prev.nonCriticalData.value + 1 },
          }))
        }
      >
        Update Non-Critical (won't re-render above)
      </button>
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
      <XMemo
        xKey="counter"
        watch={(state: number) => state}
        transform={(state: number) => `Count: ${state}`}
      >
        {(message) => <div>{message}</div>}
      </XMemo>
      <button onClick={() => setCount((prev) => prev + 1)}>Increment</button>
    </div>
  );
}
```