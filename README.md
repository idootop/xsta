<div align="center">

![XSta Logo](/assets/cover.webp)

<div align="center"><strong>⚡️ An ultra-lightweight React state management solution</strong></div>
<div align="center">Less than 200 lines of code, with zero learning curve and migration costs</div>
<br/>

[![中文文档](https://img.shields.io/badge/-中文文档-blue)](https://github.com/idootop/xsta/blob/main/README.zh-CN.md) [![NPM Version](https://badgen.net/npm/v/xsta)](https://www.npmjs.com/package/xsta) [![Minizipped Size](https://img.shields.io/bundlephobia/minzip/xsta)](https://www.npmjs.com/package/xsta) [![Downloads](https://img.shields.io/npm/dm/xsta.svg)](https://www.npmjs.com/package/xsta) [![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fidootop%2Fxsta.svg?type=shield&issueType=license)](https://github.com/idootop/xsta)

</div>

`XSta` is an ultra-lightweight (<200 lines) React state management solution that provides an intuitive `useState` Hook-like interface, offering a seamless state management experience with zero learning curve and migration cost.

## ✨ Highlights

- **🐦 Tiny yet Powerful** Less than 200 lines of code, a full-fledged React state management solution, battle-tested for production.
- **🧩 Zero Learning and Migration Costs** Just replace `useState` with `useXState`, and the local component state becomes instantly shareable across other components - it's that easy!
- **💪 Performance Optimized** Only re-render when component's subscribed state changes, effortlessly optimizing complex page performance.

## 📦 Installation

```bash
# With npm
npm install xsta

# With pnpm
pnpm install xsta

# With Yarn
yarn add xsta
```

## ⚡️ Get Started

Simply replace `useState` with `useXState` and provide a unique `key` to turn your local component state into a globally shareable state.

<details open>
<summary>👉 Example</summary>

```typescript
import { useXState } from 'xsta';

export default function Counter() {
  const [count, setCount] = useXState('count', 0); //  It's that easy!

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

You can also directly access and modify specific state from anywhere outside components using `XSta`.

When the external state changes, dependent components will automatically update.

<details open>
<summary>👉 Example</summary>

```typescript
import { useXState, XSta } from 'xsta';

function externalFunction() {
  const count = XSta.get('count');
  XSta.set('count', count + 1);
}

export default function Counter() {
  const [count, setCount] = useXState('count', 0);

  return (
    <button onClick={externalFunction}>
      <p>You pressed me {count} times</p>
    </button>
  );
}
```

</details>

## 💎 Best Practices

To better manage state during development, it's common to encapsulate state-related operations by module.

`XStaManager` provides a basic state management interface for this purpose. Here's a simple example of `createXStaManager`.

<details>
<summary>👉 Example</summary>

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

Furthermore, you can extend `XStaManager` and provide a unified state management interface. **(Recommended)**

<details open>
<summary>👉 Example</summary>

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

## ⚙️ Advanced

### XConsumer

If a component is computationally expensive to build, or if your state is a complex object with multiple components depending on different properties, you can wrap it with `XConsumer` and use a state selector to control when the child components should re-render.

<details>
<summary>👉 Example</summary>

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
    <>
      <XConsumer provider="profile" selector={s => s.avatar}>
        <UserAvatar /> {/* UserAvatar will only re-render when avatar changes */}
      </XConsumer>
      <XConsumer provider="profile" selector={s => [s.age, s.bio]}>
        {profile => {
          // You can also directly access the current state value
          return <UserInfo age={profile.age} bio={profile.bio} />;
        }}
      </XConsumer>
    </>
  );
}
```

</details>

### useConsumer

`useXConsumer` is an alias for `useXState` that allows for more convenient subscription to state updates.

<details>
<summary>👉 Example</summary>

```typescript
import { useXConsumer } from 'xsta';

function WatchText() {
  // This component will automatically re-render when myState.text changes
  const [state] = useXConsumer('myState', s => s.text);
  return <p>Current text: {state.text}</p>;
}
```

</details>

### Additional Features

`XSta` provides a few more utilities for advanced use cases:

- `useXProvider(key, initialState)`: Initializes a global state value.
- `XSta.delete(key)`: Deletes a global state value.
- `XSta.clear(key)`: Clears all global state values.

<details>
<summary>👉 Example</summary>

```typescript
import { useXState, useXProvider, XSta } from 'xsta';

const initialState = 0;

export default function APP() {
  // Initialize state
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
        // Delete the "count" state
        XSta.delete('count');
        // Clear all states
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

Note: By default, `XSta` does not automatically initialize or clean up global states. Instead, developers decide when to initialize and destroy state values. Therefore, please be careful when using it to prevent issues like using an uninitialized state or memory leaks.
