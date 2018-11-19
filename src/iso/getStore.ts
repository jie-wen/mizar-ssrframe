import { applyMiddleware, compose, createStore } from "redux";
import createSagaMiddleware from "redux-saga";
import { getRootReducer, rootSaga } from "./libs/metaCollector";

let store;
export function getStore() {
    if (store) {
        return store;
    }
    if (typeof window === "undefined") {
        // 非浏览器环境
        return;
    }
    const initialState = (window as any).__INITIAL_STATE__;
    delete (window as any).__INITIAL_STATE__;

    const sagaMiddleware = createSagaMiddleware();
    // const reduxDevToolMiddleware = (window as any).__REDUX_DEVTOOLS_EXTENSION__
    //     && (window as any).__REDUX_DEVTOOLS_EXTENSION__();
    const composeEnhancers =
        (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ?
            (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
            }) : compose;
    store = createStore(getRootReducer(),
        initialState,
        composeEnhancers(applyMiddleware(sagaMiddleware)),
    );
    sagaMiddleware.run(rootSaga);
    store.sagaMiddleware = sagaMiddleware;
    return store;
}
