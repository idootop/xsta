# useXRoot - 根状态管理器

`useXRoot` 是管理状态生命周期的 React Hook。它在组件挂载时初始化状态，在组件卸载时自动清理。适合组件级的全局状态。

## API 参考

```tsx
useXRoot<T>(key: string, initialState?: T | (() => T));
```

**参数：**

- `key`: string - 状态的唯一标识符
- `initialState`: 值或函数（可选）- 初始状态值

## 基础用法

```tsx
import { useXRoot } from "xsta";

function App() {
  // 初始化状态，组件卸载时自动清理
  useXRoot("app-state", { count: 0, user: null });

  return <div>App 内容</div>;
}
```

## 为子组件提供状态

```tsx
function Root() {
  // 初始化共享状态
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

## 应用级状态

```tsx
function App() {
  // 初始化应用级状态
  useXRoot("app", {
    theme: "dark",
    language: "zh-CN",
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
  return <header className={app.theme}>欢迎, {app.user?.name}</header>;
}
```
