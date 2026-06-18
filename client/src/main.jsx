import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { createAppStore } from "./store/index.js";
import { StoreProvider, useStoreRef } from "./store/redux.js";
import "./index.css";

function Root() {
  const store = useStoreRef(createAppStore);

  return (
    <StoreProvider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StoreProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
