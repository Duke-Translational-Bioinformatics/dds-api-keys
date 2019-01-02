import React from "react";
import { render } from "react-dom";
import { Provider } from 'react-redux'
import store from './js/store'
import App from "./js/components/presentational/App";
// uncomment next line to see store in the browser console
// window.store = store;
render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById("app")
);
