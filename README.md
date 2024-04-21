<div align="center">

![XSta Logo](/assets/cover.webp)

<div align="center"><strong>Turn any local state global in just a second ✨</strong></div>
<div align="center">Refine your React state management experience with XSta</div>
<br/>

[![中文文档](https://img.shields.io/badge/-中文文档-blue)](https://github.com/idootop/xsta/blob/main/README.zh-CN.md) [![NPM Version](https://badgen.net/npm/v/xsta)](https://www.npmjs.com/package/xsta) [![Minizipped Size](https://img.shields.io/bundlephobia/minzip/xsta)](https://www.npmjs.com/package/xsta) [![Downloads](https://img.shields.io/npm/dm/xsta.svg)](https://www.npmjs.com/package/xsta) [![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fidootop%2Fxsta.svg?type=shield&issueType=license)](https://github.com/idootop/xsta)

</div>

`XSta` is a featherlight React state management library that globalizes your state with the simplicity of a `useState`-like hook.
It feels like magic ✨: a simple one-second adjustment is all it takes to turn your local state into global state, seamlessly and efficiently.

## ✨ Features

- **😊 Intuitive by Design**
  > `XSta` removes the complexity from state management by offering a `useState`-like interface that effortlessly elevates your state to a global scope.
- **⚡️ Ultra-Lightweight**
  > With less than 200 lines of code, `XSta` embodies minimalism, providing robust state management without the bloat.
- **💪 Optimized for Performance**
  > Utilizes finely-tuned selectors to reduce unnecessary re-renders, ensuring your components only update when needed.
- **⭐️ Unbounded Flexibility**
  > Enables you to interact with your state from anywhere within your app, even outside of React components, offering complete control over state manipulation.
- **🪝 Hooked on React**
  > Fully embraces React hooks and includes Typescript typings right out of the box for an enhanced development experience with added type safety.

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

To use XSta, simply replace `useState` with `useXState` and provide a unique `key` for your state. This will instantly transform your local state into global state.

<details open>
<summary>👉 Example</summary>

```typescript
import { useXState } from 'xsta';

export default function Counter() {
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

### XSta⚡️

You can access and manipulate the global state from anywhere in your application using the `XSta`.

<details open>
<summary>👉 Example</summary>

```typescript
import { useXState, XSta } from 'xsta';

function externalFunction() {
  // Get the current state
  const count = XSta.get('count');

  // Update the state
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

### useXConsumer & Selector

If your state is a complex object, and you want to optimize re-renders by only updating when specific fields change, you can use a selector or `useXConsumer`.

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
  // This component will only re-render when `myState.text` changes
  const [state] = useXConsumer('myState', s => s.text);
  return <h1>Current text: {state.text}</h1>;
}

function Counter() {
  const [state, setState] = useXState('myState', { count: 0, text: 'hello' });

  function handleClick() {
    setState(prevState => {
      prevState.count += 1;
      prevState.text = ['❤️', '😚'][Math.round(Math.random())];
      return prevState;
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

### XConsumer

For complex pages, you can wrap computationally expensive components with `XConsumer`. This will cache the previous build of the component when a parent or ancestor triggers a rebuild. The subtree will only reconstruct when the selected state changes.

<details>
<summary>👉 Example</summary>

```typescript
import { useXState, XConsumer, XSta } from 'xsta';

export default function Counter() {
  const [state, setState] = useXState('myState', { count: 0, text: 'hello' });

  console.log('Counter rebuild', state);

  function handleClick() {
    setState({
      ...state,
      count: state.count + 1,
      text: ['hello', 'world'][Math.round(Math.random())],
    });
  }

  return (
    <>
      <button onClick={handleClick}>
        <p>You pressed me {state.count} times</p>
      </button>
      // WatchText will only rebuild when myState.text changes
      <XConsumer provider="myState" selector={s => s.text}>
        <WatchText />
      </XConsumer>
    </>
  );
}

function WatchText() {
  const state = XSta.get('myState');
  console.log('WatchText rebuild', state);
  return <h1>Current text: {state.text}</h1>;
}
```

</details>

### Registering a Function as State

To set a function as a state value, you cannot directly use `useXState('key', func)` or `XSta.set('key', func)`. XSta (including React's `setState`) interprets function arguments as state updater functions of the form `(prevState) => newState`.

To register a function as state, use the following pattern:

<details>
<summary>👉 Example</summary>

```typescript
const [_, setMyFunc] = useXState('key');
setMyFunc(() => newFunc);
```

`setMyFunc(() => newFunc)` updates the state to `newFunc`. The function is wrapped in an arrow function to bypass XSta's state updater interpretation.

Alternatively, you can use `XSta.set`:

```typescript
XSta.set('key', () => newFunc);
```

To set the initial state with a function:

```typescript
useXState('key', () => () => initFunc);
```

`useXState('key', () => () => initFunc)` sets the initial state to `initFunc`. The function needs to be wrapped twice because when using `useXState` to set the initial value, a function argument is interpreted as the initializer function for the state.

</details>

### Additional Features

XSta provides a few more utilities for advanced use cases:

- `useXProvider`: Initializes a global state value.
- `XSta.delete`: Deletes a global state value.
- `XSta.clear`: Clears all global state values.

<details>
<summary>👉 Example</summary>

```typescript
import { useXState, useXProvider, XSta, XConsumer } from 'xsta';

export default function APP() {
  // Initialize the "count" state
  useXProvider('count', 0);

  return (
    <>
      <Counter />
      // WatchText will only rebuild when myState.text changes
      <XConsumer provider="myState" selector={s => s.text}>
        {state => <WatchText state={state} />}
      </XConsumer>
    </>
  );
}

function Counter() {
  const [count, setCount] = useXState('count');

  function handleClick() {
    setCount(count + 1);
    // Delete the "count" state (won't trigger a re-render)
    XSta.delete('count');
    // Clear all global state (won't trigger any re-renders)
    XSta.clear();
  }

  return (
    <button onClick={handleClick}>
      <p>You pressed me {count} times</p>
    </button>
  );
}

function WatchText({ state }) {
  console.log('WatchText rebuild', state);
  return <h1>Current text: {state.text}</h1>;
}
```

</details>
