# useXComputed - 计算状态 Hook

`useXComputed` 是用于从状态派生并缓存值的 React Hook。仅在监听的值变化时重新渲染（使用浅比较），适合计算派生状态。

## API 参考

```tsx
const computed = useXComputed<S, V, D>(
  key: string,
  watch: (state: S) => V,
  transform?: (value: V) => D
);
```

**参数：**

- `key`: string - 要监听的状态键
- `watch`: function - 从状态中提取要监听的值的函数
- `transform`: function（可选）- 转换监听值的函数

**返回值：**

- 类型为 `D` 的计算值（如果没有提供 `transform` 则为 `V` 类型）

## 基础用法

```tsx
import { useXState, useXComputed, XSta } from "xsta";

XSta.set("counter", 0);

function Counter() {
  const doubled = useXComputed("counter", (state: number) => state * 2);

  return (
    <div>
      <p>双倍值: {doubled}</p>
      <button onClick={() => XSta.set("counter", (prev: number) => prev + 1)}>
        增加
      </button>
    </div>
  );
}
```

## 使用 `transform`

```tsx
XSta.set("data", {
  numbers: [1, 2, 3, 4, 5],
  text: "hello",
  timestamp: Date.now(),
});

function ExpensiveComputation() {
  // 仅在 numbers 变化时重新计算，text 或 timestamp 变化不会触发
  const sortedNumbers = useXComputed(
    "data",
    (state) => state.numbers,
    (numbers) => [...numbers].sort((a, b) => b - a)
  );

  return <div>{sortedNumbers.join(", ")}</div>;
}
```
