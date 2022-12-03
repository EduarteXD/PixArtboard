import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import "./colorSchema.scss";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <>
    <App />
  </>
);