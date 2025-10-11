# XWatch - 监听组件

`XWatch` 是监听状态变化的 React 组件，当监听的值变化时重新渲染其子元素。

## API 参考

```tsx
<XWatch xKey={string} watch={(state) => value}>
  {children}
</XWatch>
```

**Props:**

- `xKey`: string - 要监听的状态键
- `children`: function - 接收监听值的 ReactNode 构建函数
- `watch`: function（可选）- 从状态中提取要监听的值的函数
- `transform`: function（可选）- 转换监听值的函数

## 基础用法

```tsx
import { XWatch, useXState } from "xsta";

function App() {
  const [, setCount] = useXState("counter", 0);

  return (
    <div>
      <XWatch xKey="counter" watch={(state: number) => state}>
        {(count) => <div>计数: {count}</div>}
      </XWatch>
      <button onClick={() => setCount((prev) => prev + 1)}>增加</button>
    </div>
  );
}
```

## 使用 `transform`

```tsx
import { XWatch, useXState } from "xsta";

function App() {
  const [, setCount] = useXState("counter", 0);

  return (
    <div>
      <XWatch
        xKey="counter"
        watch={(state: number) => state}
        transform={(state: number) => `计数: ${state}`}
      >
        {(message) => <div>{message}</div>}
      </XWatch>
      <button onClick={() => setCount((prev) => prev + 1)}>增加</button>
    </div>
  );
}
```
