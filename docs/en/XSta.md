# XSta - Core State Management

`XSta` is the core API that provides low-level state management functions. It manages a global store where you can set, get, and subscribe to state changes.

## API Reference

### `XSta.set(key, newState, options?)`

Set or update state for a given key.

**Parameters:**

- `key`: string - The unique identifier for the state
- `newState`: value or function - The new state or a function that receives the previous state
- `options`: object (optional)
  - `silent`: boolean - If true, don't notify subscribers

**Example:**

```tsx
import { XSta } from "xsta";

// Set initial state
XSta.set("counter", { count: 0 });

// Update with new value
XSta.set("counter", { count: 5 });

// Update with function
XSta.set("counter", (prev) => ({ count: prev.count + 1 }));

// Merge with existing state
XSta.set("user", { age: 26 });

// Silent update (no re-renders)
XSta.set("counter", { count: 10 }, { silent: true });
```

### `XSta.get(key)`

Get the current state for a given key.

**Example:**

```tsx
const state = XSta.get("counter");
console.log(state); // { count: 0 }
```

### `XSta.has(key)`

Check if a key exists in the store.

**Example:**

```tsx
if (XSta.has("counter")) {
  console.log("Counter exists");
}
```

### `XSta.delete(key)`

Delete a state entry from the store.

**Example:**

```tsx
XSta.delete("counter");
```

### `XSta.keys()`

Get all keys in the store.

**Example:**

```tsx
const keys = XSta.keys();
console.log(keys); // ['counter', 'user', 'settings']
```

### `XSta.clear()`

Clear all state from the store.

**Example:**

```tsx
XSta.clear();
```

### `XSta.subscribe(key, callback)`

Subscribe to state changes for a given key.

**Returns:** Unsubscribe function

**Example:**

```tsx
const unsubscribe = XSta.subscribe("counter", () => {
  console.log("Counter changed:", XSta.get("counter"));
});

// Later, unsubscribe
unsubscribe();
```

## Complete Example

```tsx
import { XSta } from "xsta";

// Initialize state
XSta.set("counter", { count: 0, step: 1 });

// Subscribe to changes
const unsubscribe = XSta.subscribe("counter", () => {
  console.log("State changed:", XSta.get("counter"));
});

// Update state
XSta.set("counter", (prev) => ({
  count: prev.count + prev.step,
  step: prev.step,
}));

// Merge update
XSta.set("counter", { step: 2 }, { merge: true });

// Check state
console.log(XSta.get("counter")); // { count: 1, step: 2 }

// Clean up
unsubscribe();
XSta.delete("counter");
```