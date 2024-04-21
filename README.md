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
- **✅ React State Management Made Right** With a familiar `useState` Hook-like interface, managing global state becomes as simple as using the built-in `useState` Hook.
- **⚡️ Instant Global State** Just replace `useState` with `useXState`, and your local component state becomes instantly shareable across parent, child, or sibling components - it's that easy!
- **🧩 Zero Learning and Migration Costs** Compatible with existing React state management libraries, making it easy to switch.
- **💪 Performance Optimized** Built-in state selectors and `XConsumer` component ensure that components only re-render when their subscribed state changes, effortlessly optimizing complex page performance.
- **⭐️ Flexible and Efficient** Beyond using the Hook, you can also access and modify specific state from anywhere outside components. When the external state changes, dependent components will automatically update.
- **🛡️ TypeScript Support** Native support for TypeScript, ensuring type safety and auto-completion.
- **😜 Try It Out!** With its negligible bundle size, zero learning curve, and seamless migration, `XSta` offers an ultra-smooth React state management experience.

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

Simply replace `useState` with `useXState` and provide a unique `key` to turn your local component state into a globally shareable state accessible and modifiable by other parent, child, or sibling components.

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

### XSta⚡️

You can also directly access and modify specific state from anywhere outside components using `XSta`.

When the external state changes, dependent components will automatically update.

<details open>
<summary>👉 Example</summary>

```typescript
import { useXState, XSta } from 'xsta';

function externalFunction() {
  // Get state
  const count = XSta.get('count');
  // Update state (will automatically trigger Counter component re-render)
  XSta.set('count', count + 1);
}

export default function Counter() {
  const [count, setCount] = useXState('count', 0);

  function handleClick() {
    externalFunction();
  }

  return (
    <button onClick={handleClick}>
      <p>You pressed me {count} times</p>
    </button>
  );
}
```

</details>

### XConsumer

If a component is computationally expensive to build, or if your state is a complex object with multiple components depending on different properties, you can wrap the performance-critical components with `XConsumer` and use a state selector to control when the child components should re-render.

If the state selector's return value remains unchanged, `XConsumer` will reuse the previous build result of the child component, reducing unnecessary re-renders and optimizing resource consumption.

<details open>
<summary>👉 Example</summary>

```typescript
import { useXState, XConsumer, XSta } from 'xsta';

export default function UserProfile() {
  const [profile, setProfile] = useXState('profile', {
    name: 'XSta',
    avatar: 'https://github.com/fluidicon.png',
    age: 18,
    bio: 'hello world!',
  });

  console.log('UserProfile rebuild', profile);

  function handleClick() {
    const age = profile.age;
    setProfile({
      ...profile,
      age: [age, age + 1][Math.round(Math.random())],
      bio: ['hello XSta!', 'hello world!'][Math.round(Math.random())],
    });
  }

  return (
    <>
      {/* UserAvatar will only re-render when avatar changes */}
      <XConsumer provider="profile" selector={s => s.avatar}>
        <UserAvatar />
      </XConsumer>
      {/* UserInfo will only re-render when age or bio changes */}
      <XConsumer provider="profile" selector={s => [s.age, s.bio]}>
        {/* You can also directly access the current state value in the child component of XConsumer */}
        {profile => <UserInfo age={profile.age} bio={profile.bio} />}
      </XConsumer>
      <button onClick={handleClick}>Refresh</button>
    </>
  );
}

function UserAvatar() {
  const avatar = XSta.get('profile').avatar;
  console.log('UserAvatar rebuild', avatar);
  return <img src={avatar} alt="avatar" width={128} />;
}

function UserInfo({ age, bio }) {
  console.log('UserInfo rebuild', { age, bio });
  return (
    <>
      <p>Age: {age}</p>
      <p>Bio: {bio}</p>
    </>
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

// Provide a unique key and initial state to create the manager
export const CounterState = createXStaManager({
  key: 'count',
  initialState: 0,
});

// Counter.ts
import { CounterState } from 'counter.state';

function externalFunction() {
  // Use the created CounterState to update the state
  CounterState.setState(count => count + 1);
}

export default function Counter() {
  // Use the created CounterState to access the state in the component
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

### useConsumer

`useXConsumer` is an alias for `useXState` that allows for more convenient subscription to state updates.

<details>
<summary>👉 Example</summary>

```typescript
import { useXState, useXConsumer } from 'xsta';

export default function APP() {
  return (
    <>
      <Counter />
      <WatchText />
    </>
  );
}

function WatchText() {
  // This component will automatically re-render when myState.text changes
  const [state] = useXConsumer('myState', s => s.text);
  console.log('WatchText rebuild', state);
  return <p>Current text: {state.text}</p>;
}

function Counter() {
  const [state, setState] = useXState('myState', { count: 0, text: 'hello' });

  console.log('Counter rebuild', state);

  function handleClick() {
    setState({
      count: state.count + 1,
      text: ['hello', 'world'][Math.round(Math.random())],
    });
  }

  return (
    <button onClick={handleClick}>
      <p>You pressed me {state.count} times</p>
    </button>
  );
}
```

</details>

### Registering a Function as State

When you want to set a function as a state value (e.g., registering a public callback), `XSta`, like React, treats function-typed state values as state update functions, which means: `(prevState) => newState`.

Therefore, you cannot directly use `useXState('key', func)` or `XSta.set('key', func)` to set a function as a state value, or it will lead to unexpected behavior! 🚨

The recommended approach is to use an object to store the callback function instead of setting the callback function directly as a state value.

<details>
<summary>👉 Example</summary>

```typescript
const callback = () => alert('hello world!');

const [state] = XSta.set('key', { callback });

state.callback();
```

</details>

If you really need to do this, you can use the following method to set a function as a state value.

<details>
<summary>👉 Example</summary>

```typescript
const callback = () => alert('hello world!');

XSta.set('key', callback); // ❌
XSta.set('key', () => callback); // ✅

useXState('key', callback); // ❌
useXState('key', () => () => callback); // ✅ （not recommend）
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
