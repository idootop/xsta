<div align="center">

![XSta Logo](/assets/cover.webp)

<div align="center"><strong>Turn any local state global in just a second ✨</strong></div>
<div align="center">Refine your React state management experience with XSta</div>
<br/>

![NPM Version](https://badgen.net/npm/v/xsta) ![Minizipped Size](https://badgen.net/bundlephobia/minzip/xsta) ![Downloads](https://img.shields.io/npm/dm/xsta.svg) ![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fidootop%2Fxsta.svg?type=small)

</div>

XSta is a featherlight React state management library that globalizes your state with the simplicity of a `useState`-like hook.

It feels like magic ✨: a simple one-second adjustment is all it takes to turn your local state into global state, seamlessly and efficiently.

## 🔥 Features

- **😊 Intuitive by Design**
  > XSta removes the complexity from state management by offering a `useState`-like interface that effortlessly elevates your state to a global scope.
- **⚡️ Ultra-Lightweight**
  > With less than 200 lines of code, XSta embodies minimalism, providing robust state management without the bloat.
- **💪 Optimized for Performance**
  > Utilizes finely-tuned selectors to reduce unnecessary re-renders, ensuring your components only update when needed.
- **⭐️ Unbounded Flexibility**
  > Enables you to interact with your state from anywhere within your app, even outside of React components, offering complete control over state manipulation.
- **🪝 Hooked on React**
  > Fully embraces React hooks and includes Typescript typings right out of the box for an enhanced development experience with added type safety.

## ⚡️ Installation

```bash
npm i xsta
```

## 💡 Usage

### usState 👉 useXState

Simply replace `useState` with `useXState` and assign a unique `key` to your state. Just like that, it becomes global.

```typescript
import { useXState } from "xsta";

export default function Counter() {
  const [count, setCount] = useXState("count", 0);

  function handleClick() {
    setCount(count + 1);
  }

  return <button onClick={handleClick}>You pressed me {count} times</button>;
}
```

### XSta⚡️

Accessing the global state outside of components, or from any location within your app, is straightforward with XSta.

```typescript
import { useXState, XSta } from "xsta";

function visitState() {
  // Access the state
  const count = XSta.get("count");
  alert("count is " + count);

  setTimeout(() => {
    // Update the state; components using useXState<count> will automatically refresh
    XSta.get("count", 0);
  }, 1000);
}

export default function Counter() {
  const [count, setCount] = useXState("count", 0);

  function handleClick() {
    setCount(count + 1);
    visitState();
  }

  return <button onClick={handleClick}>You pressed me {count} times</button>;
}
```

### useXConsumer & selector

If your state is a complex object and you wish to refresh the UI only when certain fields change, you can use a `selector` or `useXConsumer` to specify the values of interest.

```typescript
import { useXState, useXConsumer } from "xsta";

export default function APP() {
  return (
    <>
      <Counter />
      <WatchText />
    </>
  );
}

function WatchText() {
  // Component will refresh only when myState.text changes
  const [state] = useXConsumer("myState", (s) => s.text);
  // Or use a selector
  //   const [state] = useXState("myState", undefined, {
  //     selector: (s) => s.text,
  //   });
  return <h1>Current text: {state.text}</h1>;
}

function Counter() {
  const [state, setState] = useXState("myState", { count: 0, text: "hello" });

  function handleClick() {
    setState({
      ...state,
      count: state.count + 1,
      text: ["hello", "world"][Math.round(Math.random())],
    });
  }

  return (
    <button onClick={handleClick}>You pressed me {state.count} times</button>
  );
}
```

### XConsumer

For complex pages, wrap computationally expensive components with XConsumer. This will cache the previous build of the component when a parent or ancestor triggers a rebuild. The subtree will only reconstruct when the selected state changes.

```typescript
import { useXState, XConsumer, XSta } from "xsta";

export default function Counter() {
  const [state, setState] = useXState("myState", { count: 0, text: "hello" });
  console.log("Counter rebuild", state);

  // WatchText will only rebuild when myState.text changes
  const watchText = (
    <XConsumer xkey="myState" selector={(s) => s.text}>
      <WatchText />
    </XConsumer>
  );

  function handleClick() {
    setState({
      ...state,
      count: state.count + 1,
      text: ["hello", "world"][Math.round(Math.random())],
    });
  }

  return (
    <>
      <button onClick={handleClick}>You pressed me {state.count} times</button>
      {watchText}
    </>
  );
}

function WatchText() {
  const state = XSta.get("myState");
  console.log("WatchText rebuild", state);
  return <h1>Current text: {state.text}</h1>;
}
```

## Others

The features described above are the most commonly used in XSta, but there are more minor features available for you to utilize as needed.

```typescript
import { useXState, useXProvider, XSta, XConsumer } from "xsta";

export default function APP() {
  // Initialize the count value
  useXProvider("count", 0);

  return (
    <>
      <Counter />
      <XConsumer xkey="myState" selector={(s) => s.text}>
        {
          // WatchText will only rebuild when myState.text changes
          (state) => <WatchText state={state} />
        }
      </XConsumer>
    </>
  );
}

function Counter() {
  const [count, setCount] = useXState("count");

  function handleClick() {
    setCount(count + 1);
    // Remove count; note that this will not trigger a component refresh
    XSta.remove("count");
    // Clear all states; note that this will not trigger any component refresh
    XSta.clear();
  }

  return <button onClick={handleClick}>You pressed me {count} times</button>;
}

function WatchText({ state }) {
  console.log("WatchText rebuild", state);
  return <h1>Current text: {state.text}</h1>;
}
```
