# useXState - React 状态 Hook

`useXState` 是管理全局状态的 React Hook。用法类似 React 的 `useState`，但状态在所有使用相同 key 的组件间共享。

## API 参考

```tsx
const [state, setState] = useXState<T>(key: string, initialState?: T | (() => T));
```

**参数：**

- `key`: string - 状态的唯一标识符
- `initialState`: 值或函数（可选）- 初始状态值，仅在 key 不存在时使用

**返回值：**

- `[state, setState]` - 当前状态和设置函数

## 基础用法

```tsx
import { useXState } from "xsta";

function Counter() {
  const [count, setCount] = useXState("counter", 0);

  return (
    <div>
      <p>计数: {count}</p>
      <button onClick={() => setCount(count + 1)}>增加</button>
    </div>
  );
}
```

## 跨组件共享状态

```tsx
// 组件 1
function Controls() {
  const [count, setCount] = useXState("shared-counter", 0);
  return (
    <div>
      <button onClick={() => setCount((prev) => prev + 1)}>增加</button>
      <button onClick={() => setCount((prev) => prev - 1)}>减少</button>
    </div>
  );
}

// 组件 2
function Display() {
  const [count] = useXState("shared-counter");
  return <div>计数: {count}</div>;
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

## 静默更新

使用 `silent` 选项更新状态但不触发重新渲染：

```tsx
function Analytics() {
  const [count, setCount] = useXState("counter", 0);

  const incrementSilently = () => {
    // 更新状态但不触发重新渲染
    setCount((prev) => prev + 1, { silent: true });
  };

  return (
    <div>
      <p>显示的计数: {count}</p>
      <button onClick={incrementSilently}>静默增加</button>
    </div>
  );
}
```
