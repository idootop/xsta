# XMemo - 缓存组件

`XMemo` 类似 `XWatch`，但针对缓存渲染进行了优化。适合计算和缓存昂贵的值，用于传递 props 或在 JSX 中使用。

## API 参考

```tsx
<XMemo xKey={string} watch={(state) => value}>
  {children}
</XMemo>
```

**Props:**

- `xKey`: string - 要监听的状态键
- `children`: function - 接收监听值的 ReactNode 构建函数
- `watch`: function（可选）- 从状态中提取要监听的值的函数
- `transform`: function（可选）- 转换监听值的函数

## 基础用法

```tsx
function App() {
  const [, setState] = useXState("app", {
    criticalData: { value: 0 },
    nonCriticalData: { value: 0 },
  });

  return (
    <div>
      {/* 仅在 criticalData 变化时重新渲染 */}
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
        更新非关键数据（上面不会重新渲染）
      </button>
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
      <XMemo
        xKey="counter"
        watch={(state: number) => state}
        transform={(state: number) => `计数: ${state}`}
      >
        {(message) => <div>{message}</div>}
      </XMemo>
      <button onClick={() => setCount((prev) => prev + 1)}>增加</button>
    </div>
  );
}
```
