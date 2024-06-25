// import { createStore, applyMiddleware } from "redux";
import { configureStore } from '@reduxjs/toolkit';
import rootReducer from "./root-reducer";

// for testing
export const store = configureStore({
    devTools: true,
    reducer: rootReducer
});


// for production
// export const store = createStore(rootReducer, applyMiddleware(thunk));

