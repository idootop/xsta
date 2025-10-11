# useXRoot - Root State Manager

`useXRoot` is a React hook that manages the lifecycle of state. It initializes state when the component mounts and automatically cleans it up when the component unmounts. This is ideal for component-scoped global state.

## API Reference

```tsx
useXRoot<T>(key: string, initialState?: T | (() => T));
```

**Parameters:**

- `key`: string - The unique identifier for the state
- `initialState`: value or function (optional) - Initial state value

## Basic Usage

```tsx
import { useXRoot } from "xsta";

function App() {
  // Initialize state that will be cleaned up when component unmounts
  useXRoot("app-state", { count: 0, user: null });

  return <div>App content</div>;
}
```

## Providing State to Child Components

```tsx
function Root() {
  // Initialize shared state
  useXRoot("shared", { items: [], selectedId: null });

  return (
    <div>
      <ItemList />
      <ItemDetails />
    </div>
  );
}

function ItemList() {
  const [state, setState] = useXState("shared");
  return (
    <ul>
      {state.items.map((item) => (
        <li
          key={item.id}
          onClick={() =>
            setState((prev) => ({
              ...prev,
              selectedId: item.id,
            }))
          }
        >
          {item.name}
        </li>
      ))}
    </ul>
  );
}

function ItemDetails() {
  const [state] = useXState("shared");
  const selected = state.items.find((i) => i.id === state.selectedId);
  return <div>{selected?.name}</div>;
}
```

## Application-Level State

```tsx
function App() {
  // Initialize app-wide state
  useXRoot("app", {
    theme: "dark",
    language: "en",
    user: null,
    isAuthenticated: false,
  });

  return (
    <div>
      <Header />
      <Main />
      <Footer />
    </div>
  );
}

function Header() {
  const [app] = useXState("app");
  return <header className={app.theme}>Welcome, {app.user?.name}</header>;
}
```
