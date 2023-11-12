import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

import { XConsumer, XSta, useXState } from "xsta";

import { toast } from "react-toastify";

function App() {
  const [state, setState] = useXState("myState", {
    count: 0,
    text: "❤️",
  });

  const onClick = () => {
    setState({
      ...state,
      count: state.count + 1,
      text: ["❤️", "😚"][Math.round(Math.random())],
    });
  };

  toast("✅ parent: " + JSON.stringify(state, undefined, 4));

  return (
    <>
      <XConsumer xkey="myState" selector={(s) => s.text}>
        <Child />
      </XConsumer>
      <div className="card">
        <button onClick={onClick}>count is {state.count}</button>
        <p>Click the button to view the component building details.</p>
      </div>
    </>
  );
}

function Child() {
  const state = XSta.get("myState");
  toast("🔥 child: " + JSON.stringify(state, undefined, 4));
  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite {state.text} React</h1>
    </>
  );
}

export default App;
