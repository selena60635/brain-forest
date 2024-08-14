import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

//暫時隱藏react-color引發的錯誤訊息
const err = console.error;
console.error = (...args) => {
  if (/defaultProps/.test(args[0])) return;
  err(...args);
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  // <React.StrictMode>
  <App />
  // </React.StrictMode>
);
