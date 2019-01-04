import React from "react";
import { render } from "react-dom";
import { Provider } from 'react-redux'
import model from './js/model'
import App from "./js/components/views/App";
// uncomment next line to see model in the browser console
// window.store = model;
render(
  <Provider store={model}>
    <App />
  </Provider>,
  document.getElementById("app")
);
