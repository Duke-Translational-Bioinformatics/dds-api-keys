import { createStore } from "redux";
import rootReducer from "../reducers";
const controller = createStore(rootReducer);
export default controller;
