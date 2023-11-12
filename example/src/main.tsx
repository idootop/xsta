import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
    <ToastContainer
      position="bottom-right"
      newestOnTop={false}
      autoClose={false}
      draggable={false}
      theme="light"
    />
  </React.StrictMode>
);
