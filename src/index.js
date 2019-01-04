import React from "react";
import { render } from "react-dom";
import { Provider } from 'react-redux'
import controller from './js/controller'
import App from "./js/components/views/App";
// uncomment next line to see controller in the browser console
// window.store = controller;
render(
  <Provider store={controller}>
    <App />
  </Provider>,
  document.getElementById("app")
);
