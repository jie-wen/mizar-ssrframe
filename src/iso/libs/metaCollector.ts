import { matchRoutes } from "react-router-config";
import { combineReducers } from "redux";
import { all, call } from "redux-saga/effects";
import * as config from "../../config";
import { fetchWithRequestObject } from "../fetch";
import { getStore } from "../getStore";
import appState from "./state";

const finalReducer = {};
const sagas = [];
const reducerComponentMap = {};

function finalPageReducer(pageReducer) {
    // reducer中间件
    return (state, action) => {
        if (action.type === config.frameworkId) {
            // 用来做页面首屏渲染的初始数据
            return { ...state, ...action.data };
        } else {
            return pageReducer(state, action);
        }
    };
}

export function registerRedux(reducer, reducerName, saga, component, subComponents) {
    finalReducer[reducerName] = finalPageReducer(reducer);
    reducerComponentMap[reducerName] = { component, reducer, subComponents };
    if (saga) {
        sagas.push(call(saga));
    }
    if (appState.isClientBootstraped) {
        const store = getStore();
        store.replaceReducer(combineReducers(finalReducer));
        store.sagaMiddleware.run(manualRunSagaMiddleware(saga));
    }
}

function manualRunSagaMiddleware(saga: any) {
    return function* runSaga() {
        yield call(saga);
    };
}

export function getRootReducer(): any {
    return combineReducers(finalReducer);
}

export function* rootSaga(): any {
    yield all(sagas);
}

export async function getInitialData(matchedBranch, request) {
    // 该方法根据路由和请求找到对应的组件获取初始数据。被client端RouterContainer和server端路由入口调用。
    const query = request.query;
    const urlParams = matchedBranch.match.params;
    const pageComponent = matchedBranch.route.component;
    const { preloadData, pageReducerName } = await collectPreloadData(
        reducerComponentMap, pageComponent, request, query, urlParams);
    return { preloadData, pageReducerName };
}

async function getSinglePreloadData(component, reducer, request, query, urlParams) {
    let initialData = {};
    if (component.getInitialData) {
        try {
            initialData = await component.getInitialData(fetchWithRequestObject(request), query, urlParams);
            console.info("getSinglePreloadData initialData", initialData);
        } catch (e) {
            console.error("获取初始数据失败", e);
        }
    }
    let initialState = reducer(undefined, {});
    initialState = typeof initialState === "object" ? initialState : {};
    return Object.assign({}, initialState, initialData);
}

async function collectPreloadData(rcMap, targetComponent, request, query, urlParams) {
    let preloadData = {};
    let pageReducerName = "";
    await Promise.all(
        Object.keys(rcMap)
            .map(async (reducerName) => {
                if (rcMap[reducerName].component === targetComponent) {
                    pageReducerName = reducerName;
                    const reducer = rcMap[reducerName].reducer;
                    const subComponents = rcMap[reducerName].subComponents;
                    // 找到当前页的组件
                    preloadData[reducerName] = await getSinglePreloadData(
                        targetComponent, reducer, request, query, urlParams);
                    if (subComponents) {
                        await Promise.all(
                            subComponents.map(async (subComponent) => {
                                const subComPreloadData = await collectPreloadData(
                                    rcMap, subComponent, request, query, urlParams);
                                preloadData = { ...preloadData, ...subComPreloadData.preloadData };
                            }),
                        );
                    }
                }
            }),
    );
    return { preloadData, pageReducerName };
}
