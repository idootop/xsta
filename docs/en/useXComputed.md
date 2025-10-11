# useXComputed - Computed State Hook

`useXComputed` is a React hook that derives and memoizes values from state. It only re-renders when the watched value changes (using shallow equality comparison), making it efficient for computing derived state.

## API Reference

```tsx
const computed = useXComputed<S, V, D>(
  key: string,
  watch: (state: S) => V,
  transform?: (value: V) => D
);
```

**Parameters:**

- `key`: string - The state key to watch
- `watch`: function - Function that extracts the value to watch from state
- `transform`: function (optional) - Function to transform the watched value

**Returns:**

- Computed value of type `D` (or `V` if `transform` not provided)

## Basic Usage

```tsx
import { useXState, useXComputed, XSta } from "xsta";

XSta.set("counter", 0);

function Counter() {
  const doubled = useXComputed("counter", (state: number) => state * 2);

  return (
    <div>
      <p>Doubled: {doubled}</p>
      <button onClick={() => XSta.set("counter", (prev: number) => prev + 1)}>
        Increment
      </button>
    </div>
  );
}
```

## With `transform`

```tsx
XSta.set("data", {
  numbers: [1, 2, 3, 4, 5],
  text: "hello",
  timestamp: Date.now(),
});

function ExpensiveComputation() {
  // Only recalculate when numbers change, not text or timestamp
  const sortedNumbers = useXComputed(
    "data",
    (state) => state.numbers,
    (numbers) => [...numbers].sort((a, b) => b - a)
  );

  return <div>{sortedNumbers.join(", ")}</div>;
}
```
