# XSta - 核心状态管理

`XSta` 是提供底层状态管理功能的核心 API。它管理一个全局 store，可以设置、获取和订阅状态变化。

## API 参考

### `XSta.set(key, newState, options?)`

设置或更新指定 key 的状态。

**参数：**

- `key`: string - 状态的唯一标识符
- `newState`: 值或函数 - 新状态或接收旧状态的函数
- `options`: object（可选）
  - `silent`: boolean - 如果为 true，不通知订阅者

**示例：**

```tsx
import { XSta } from "xsta";

// 设置初始状态
XSta.set("counter", { count: 0 });

// 用新值更新
XSta.set("counter", { count: 5 });

// 用函数更新
XSta.set("counter", (prev) => ({ count: prev.count + 1 }));

// 合并现有状态
XSta.set("user", { age: 26 });

// 静默更新（不触发重新渲染）
XSta.set("counter", { count: 10 }, { silent: true });
```

### `XSta.get(key)`

获取指定 key 的当前状态。

**示例：**

```tsx
const state = XSta.get("counter");
console.log(state); // { count: 0 }
```

### `XSta.has(key)`

检查 store 中是否存在指定 key。

**示例：**

```tsx
if (XSta.has("counter")) {
  console.log("Counter 存在");
}
```

### `XSta.delete(key)`

从 store 中删除状态条目。

**示例：**

```tsx
XSta.delete("counter");
```

### `XSta.keys()`

获取 store 中的所有 key。

**示例：**

```tsx
const keys = XSta.keys();
console.log(keys); // ['counter', 'user', 'settings']
```

### `XSta.clear()`

清空 store 中的所有状态。

**示例：**

```tsx
XSta.clear();
```

### `XSta.subscribe(key, callback)`

订阅指定 key 的状态变化。

**返回值：** 取消订阅函数

**示例：**

```tsx
const unsubscribe = XSta.subscribe("counter", () => {
  console.log("Counter 变化:", XSta.get("counter"));
});

// 稍后，取消订阅
unsubscribe();
```

## 完整示例

```tsx
import { XSta } from "xsta";

// 初始化状态
XSta.set("counter", { count: 0, step: 1 });

// 订阅变化
const unsubscribe = XSta.subscribe("counter", () => {
  console.log("状态变化:", XSta.get("counter"));
});

// 更新状态
XSta.set("counter", (prev) => ({
  count: prev.count + prev.step,
  step: prev.step,
}));

// 合并更新
XSta.set("counter", { step: 2 }, { merge: true });

// 检查状态
console.log(XSta.get("counter")); // { count: 1, step: 2 }

// 清理
unsubscribe();
XSta.delete("counter");
```
