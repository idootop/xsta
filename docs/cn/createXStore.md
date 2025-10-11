# createXStore - 创建 Store

`createXStore` 创建一个 store 实例，拥有自己的状态和方法。

## API 参考

```tsx
const store = createXStore<S>(initialState: S);
```

**返回对象包含：**

- `getState()` - 获取当前状态
- `setState(newState)` - 更新状态
- `useXState()` - 监听状态变化
- `useXComputed(func)` - 使用计算属性
- `XWatch(watch, children)` - 监听组件
- `XMemo(watch, children)` - 缓存组件

## 基础用法

```tsx
import { createXStore } from "xsta";

const counterStore = createXStore({ count: 0 });

function Counter() {
  const [state, setState] = counterStore.useXState();

  return (
    <div>
      <p>计数: {state.count}</p>
      <button onClick={() => setState((prev) => ({ count: prev.count + 1 }))}>
        增加
      </button>
    </div>
  );
}
```

## 使用 `getState` 和 `setState`

```tsx
const userStore = createXStore({ count: 0, name: "Alice" });

// 在 React 组件外获取状态
const currentState = userStore.getState();
console.log(currentState.count); // 0

// 在 React 组件外设置状态
userStore.setState({ count: 5, name: "Bob" });
```

## Store 配合 `useXComputed`

```tsx
const cartStore = createXStore({
  items: [
    { id: 1, name: "商品 1", price: 10, quantity: 2 },
    { id: 2, name: "商品 2", price: 15, quantity: 1 },
  ],
});

function CartSummary() {
  const total = cartStore.useXComputed((state) =>
    state.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  );

  return <div>总计: ¥{total}</div>;
}
```

## Store 中封装方法

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
      <p>计数: {state.count}</p>
      <button onClick={state.increment}>+</button>
    </div>
  );
}
```

## Store 配合 `XWatch`

```tsx
const userStore = createXStore({
  firstName: "张",
  lastName: "三",
  age: 25,
});

function UserGreeting() {
  return (
    <userStore.XWatch watch={(state) => state.firstName}>
      {(name) => <h1>你好, {name}!</h1>}
    </userStore.XWatch>
  );
}
```

## Store 配合 `XMemo`

```tsx
const dataStore = createXStore({
  numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
});

function Sum() {
  return (
    <dataStore.XMemo
      watch={(state) => state.numbers.reduce((a, b) => a + b, 0)}
    >
      {(sum) => <p>总和: {sum}</p>}
    </dataStore.XMemo>
  );
}
```

## 中间件

```tsx
const logger = (setState: any) => (newState: any, options?: any) => {
  console.log("之前的状态:", useStore.getState());
  setState(newState, options);
  console.log("之后的状态:", useStore.getState());
};

const store = createXStore({ count: 0 });

// 用中间件包装 setState
const originalSetState = store.setState;
store.setState = logger(originalSetState);
```
