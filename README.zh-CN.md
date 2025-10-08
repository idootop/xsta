<div align="center">

![XSta Logo](/assets/cover.webp)

<div align="center"><strong>⚡️ 超轻量的 React 状态管理库</strong></div>
<div align="center">不到 200 行代码，轻松搞定 React 状态管理</div>
<br/>

[![NPM Version](https://badgen.net/npm/v/xsta)](https://www.npmjs.com/package/xsta) [![Minizipped Size](https://img.shields.io/bundlephobia/minzip/xsta)](https://www.npmjs.com/package/xsta) [![Downloads](https://img.shields.io/npm/dm/xsta.svg)](https://www.npmjs.com/package/xsta) [![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fidootop%2Fxsta.svg?type=shield&issueType=license)](https://github.com/idootop/xsta)

</div>

`XSta` 是一个超轻量（< 200 lines）的 React 状态管理库，它提供了与原生 `useState` Hook 一致的状态管理接口，零学习、迁移成本，给你极致丝滑的 React 状态管理新体验。

## ✨ 亮点

- **🐦 麻雀虽小，五脏俱全** 核心不到 200 行代码（包含换行和注释），提供了完备的 React 状态管理解决方案，生产环境可用。
- **✅ 让 React 状态管理变简单** 只需将 `useState` 替换为 `useXState`，即可将组件内状态快速共享给其他父子、兄弟组件使用，就这么简单！
- **💪 专注性能优化** 内置状态选择器，确保各个组件只在其关注的状态改变时，才触发 re-render，轻松搞定复杂页面性能优化。
- **🧩 零学习、迁移成本** 可与项目中其他已使用的状态管理库共存，轻松切换，迁移无忧。

## 📦 安装

```bash
# With npm
npm install xsta

# With pnpm
pnpm install xsta

# With Yarn
yarn add xsta
```

## ⚡️ 快速上手

你只需要将 `useState` 替换为 `useXState`，并提供一个独一无二的 `key`，

即可将组件内的**本地状态**快速共享为其他父子或兄弟组件都可以访问和修改的**全局状态**。

<details open>
<summary>👉 示例代码</summary>

```typescript
import { useXState } from 'xsta';

export default function Counter() {
  // 将 useState 替换为 useXState，并绑定一个独一无二的 key
  const [count, setCount] = useXState('count', 0);

  function handleClick() {
    setCount(count + 1);
  }

  return (
    <button onClick={handleClick}>
      <p>You pressed me {count} times</p>
    </button>
  );
}
```

</details>

你也可以通过 `XSta` 在组件外的任意位置直接访问和修改指定状态，当外部状态变更时，依赖此状态的组件会自动更新。

<details open>
<summary>👉 示例代码</summary>

```typescript
import { useXState, XSta } from 'xsta';

function externalFunction() {
  // 获取状态
  const count = XSta.get('count');
  // 更新状态（会自动触发 Counter 组件 re-render）
  XSta.set('count', count + 1);
}

export default function Counter() {
  const [count] = useXState('count', 0);

  return (
    <button onClick={externalFunction}>
      <p>You pressed me {count} times</p>
    </button>
  );
}
```

</details>

## 💎 最佳实践

在开发过程中，为了更好的管理状态，通常会按照模块划分，封装各个状态相关的操作。

对此，`XStaManager` 对外提供了基础的状态管理接口，下面是 `createXStaManager` 的一个简单示例。

<details>
<summary>👉 示例代码</summary>

```typescript
// counter.state.ts
import { createXStaManager } from 'xsta';

export const CounterState = createXStaManager({
  key: 'count',
  initialState: 0,
});

// Counter.ts
import { CounterState } from 'counter.state';

function externalFunction() {
  CounterState.setState(count => count + 1);
}

export default function Counter() {
  const [count] = CounterState.useState();

  return (
    <button onClick={externalFunction}>
      <p>You pressed me {count} times</p>
    </button>
  );
}
```

</details>

更进一步的，你也可以继承 `XStaManager`，然后对外提供统一的状态管理接口。**（推荐）**

<details open>
<summary>👉 示例代码</summary>

```typescript
// counter.state.ts
import { XStaManager } from 'xsta';

class _CounterState extends XStaManager<number> {
  key = 'count';
  initialState = 0;

  get oddOrEven() {
    return this.getState() & 1 ? 'odd' : 'even';
  }

  increase = () => {
    this.setState(count => count + 1);
  };

  decrease = () => {
    this.setState(count => count - 1);
  };
}

export const CounterState = new _CounterState();

// Counter.ts
import { CounterState } from 'counter.state';

export default function Counter() {
  const [count] = CounterState.useState();

  return (
    <>
      <p>You pressed me {count} times</p>
      <p>Count is {CounterState.oddOrEven}</p>
      <button onClick={CounterState.increase}>Increase</button>
      <button onClick={CounterState.decrease}>Decrease</button>
    </>
  );
}
```

</details>

## ⚙️ 高级选项

### XConsumer

如果某个组件的构建比较昂贵，或者你的状态是一个复杂对象，有多个组件分别依赖它的不同属性：

> 比如一个公共的用户 profile 对象，用户头像组件只关心 avatar，用户简介组件只关心 bio 等

此时，你可以用 `XConsumer` 将需要性能优化的组件包裹起来，然后通过状态选择器（selector）控制子组件 re-render 的时机。

<details>
<summary>👉 示例代码</summary>

```typescript
import { useXState, XConsumer } from 'xsta';

export default function UserProfile() {
  const [profile, setProfile] = useXState('profile', {
    avatar: 'https://github.com/fluidicon.png',
    age: 18,
    bio: 'hello world!',
  });

  console.log('UserProfile rebuild', profile);

  return (
    <XConsumer provider="profile" selector={s => [s.avatar]}>
      {profile => {
        console.log('当 avatar 改变时，UserAvatar 才会 re-render', profile.avatar);
        return <UserAvatar />;
      }}
    </XConsumer>
  );
}
```

</details>

### useConsumer

`useXConsumer` 是 `useXState` 的一个别名，可以用来更方便的订阅状态更新。

<details>
<summary>👉 示例代码</summary>

```typescript
import { useXConsumer } from 'xsta';

function WatchText() {
  // 当 myState.text 改变时，此组件会自动更新
  const [state] = useXConsumer('myState', s => s.text);
  return <p>Current text: {state.text}</p>;
}
```

</details>

### 更多功能

除了上面列举的常用功能之外，`XSta` 还提供了以下方法：

- `useXProvider(key, initialState)`: 初始化状态值
- `XSta.delete(key)`: 删除一个全局状态
- `XSta.clear(key)`: 清空所有的状态

<details>
<summary>👉 示例代码</summary>

```typescript
import { useXState, useXProvider, XSta } from 'xsta';

const initialState = 0;

export default function APP() {
  // 初始化状态
  useXProvider('count', initialState);

  return (
    <>
      <CountViewer />
      <Increase />
      <Clear />
    </>
  );
}

function Clear() {
  return (
    <button
      onClick={() => {
        // 删除 "count" 状态
        XSta.delete('count');
        // 清空所有状态
        XSta.clear();
      }}
    >
      Clear
    </button>
  );
}

function CountViewer() {
  const [count] = useXState('count');

  return <p>You pressed me {count ?? initialState} times</p>;
}

function Increase() {
  return (
    <button
      onClick={() => {
        XSta.set('count', XSta.get('count', initialState) + 1);
      }}
    >
      Increase
    </button>
  );
}
```

</details>

注意：默认情况下 `XSta` 不会主动初始化或回收全局状态，而是由使用者决定状态值的初始化和销毁时机。所以在使用时请务必小心，防止状态尚未初始化，或内存泄漏等问题。

## ⚖️ License

MIT License © 2024-PRESENT [Del Wang](https://github.com/idootop)
