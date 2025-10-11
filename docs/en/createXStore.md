# createXStore - Store Factory

`createXStore` creates an isolated, encapsulated store with its own state and methods.

## API Reference

```tsx
const store = createXStore<S>(initialState: S);
```

**Returns an object with:**

- `getState()` - Get current state
- `setState(newState)` - Update state
- `useXState()` - React hook for state
- `useXComputed(func)` - React hook for computed values
- `XWatch(watch, children)` - Watch component
- `XMemo(watch, children)` - Memo component

## Basic Usage

```tsx
import { createXStore } from "xsta";

const counterStore = createXStore({ count: 0 });

function Counter() {
  const [state, setState] = counterStore.useXState();

  return (
    <div>
      <p>Count: {state.count}</p>
      <button onClick={() => setState((prev) => ({ count: prev.count + 1 }))}>
        Increment
      </button>
    </div>
  );
}
```

## Using `getState` and `setState`

```tsx
const userStore = createXStore({ count: 0, name: "Alice" });

// Get state outside React Component
const currentState = userStore.getState();
console.log(currentState.count); // 0

// Set state outside React Component
userStore.setState({ count: 5, name: "Bob" });
```

## `useXComputed` with Store

```tsx
const cartStore = createXStore({
  items: [
    { id: 1, name: "Item 1", price: 10, quantity: 2 },
    { id: 2, name: "Item 2", price: 15, quantity: 1 },
  ],
});

function CartSummary() {
  const total = cartStore.useXComputed((state) =>
    state.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  );

  return <div>Total: ${total}</div>;
}
```

## Store with Actions

```tsx
const counterStore = createXStore({
  count: 0,
  increment: () => {
    counterStore.setState((prev) => ({ count: prev.count + 1 }));
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

## `XWatch` with Store

```tsx
const userStore = createXStore({
  firstName: "Alice",
  lastName: "Smith",
  age: 25,
});

function UserGreeting() {
  return (
    <userStore.XWatch watch={(state) => state.firstName}>
      {(name) => <h1>Hello, {name}!</h1>}
    </userStore.XWatch>
  );
}
```

## `XMemo` with Store

```tsx
const dataStore = createXStore({
  numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
});

function Sum() {
  return (
    <dataStore.XMemo
      watch={(state) => state.numbers.reduce((a, b) => a + b, 0)}
    >
      {(sum) => <p>Sum: {sum}</p>}
    </dataStore.XMemo>
  );
}
```

## Middleware Pattern

```tsx
const logger = (setState: any) => (newState: any, options?: any) => {
  console.log("Previous state:", useStore.getState());
  setState(newState, options);
  console.log("Next state:", useStore.getState());
};

const store = createXStore({ count: 0 });

// Wrap setState with middleware
const originalSetState = store.setState;
store.setState = logger(originalSetState);
```
