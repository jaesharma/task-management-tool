import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { Provider } from "react-redux";
import store from "./store";
import "./styles/index.css";
import { ConfirmProvider } from "material-ui-confirm";

ReactDOM.render(
  <Provider store={store}>
    <ConfirmProvider>
      <App />
    </ConfirmProvider>
  </Provider>,
  document.getElementById("root")
);
