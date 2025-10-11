# XSta

一个极简的 React 状态管理库（< 200 行代码）。

## 安装

```bash
npm install xsta
```

## 快速开始

### 1. 基础用法

使用 `useXState` 替换 `useState`：

```tsx
import { useXState } from "xsta";

function Counter() {
  const [count, setCount] = useXState("count", 0);

  return <button onClick={() => setCount(count + 1)}>计数: {count}</button>;
}
```

### 2. 在组件外访问状态

```tsx
import { XSta } from "xsta";

function increment() {
  const count = XSta.get("count");
  XSta.set("count", count + 1);
}
```

### 3. 封装 Store 相关操作（推荐）

```tsx
import { createXStore } from "xsta";

const counterStore = createXStore({
  count: 0,
  increment() {
    counterStore.setState((s) => ({ count: s.count + 1 }));
  },
});

function Counter() {
  const [state] = counterStore.useXState();

  return (
    <div>
      <p>计数: {state.count}</p>
      <button onClick={state.increment}>+</button>
    </div>
  );
}
```

### 4. 性能优化

仅在特定值变化时重新渲染：

```tsx
const total = store.useXComputed((state) =>
  state.items.reduce((sum, item) => sum + item.price, 0)
);
```

## 完整 API 列表

### 核心 API

#### [`useXState(key, initialState?)`](./useXState.md)

全局状态 Hook，用法类似 `useState`，但可跨组件共享。

#### [`createXStore(initialState)`](./createXStore.md)

创建独立的 store，包含状态和操作方法。返回带有 hooks 和方法的 store 对象。

#### [`XSta`](./XSta.md)

全局状态管理器，用于在 React 外访问状态：

- `get(key)` - 获取状态值
- `set(key, value, options?)` - 设置状态值
- `has(key)` - 检查状态是否存在
- `delete(key)` - 删除状态
- `clear()` - 清空所有状态
- `keys()` - 获取所有状态键
- `subscribe(key, callback)` - 订阅状态变化

### 性能优化 API

#### [`useXComputed(key, selector?, transform?)`](./useXComputed.md)

订阅状态并可选择性地提取值。仅在选中的值变化时重新渲染。

#### [`XWatch`](./XWatch.mdx)

用于选择性订阅状态的组件包装器，支持渲染函数。

#### [`XMemo`](./XMemo.md)

类似 `XWatch`，但会缓存子组件，适合昂贵的渲染场景。

### 生命周期 API

#### [`useXRoot(key, initialState?)`](./useXRoot.md)

初始化状态，并在组件卸载时自动清理。

---

📖 [查看详细示例和使用模式](./createXStore.md)
