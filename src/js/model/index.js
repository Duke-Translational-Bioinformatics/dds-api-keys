import { createStore } from "redux";
import rootReducer from "../reducers";
const model = createStore(rootReducer);
export default model;
