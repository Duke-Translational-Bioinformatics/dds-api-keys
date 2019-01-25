import React from "react";
import { render } from "react-dom";
import { Provider } from 'react-redux'
import model from './js/model'
import App from "./js/views/App";
import { ThemeProvider } from "styled-components";
import { theme } from "dracs";

// uncomment next line to see model in the browser console
// window.store = model;
render(
  <Provider store={model}>
      <ThemeProvider theme={theme} >
        <App />
      </ThemeProvider>
  </Provider>,
  document.getElementById("app")
);
