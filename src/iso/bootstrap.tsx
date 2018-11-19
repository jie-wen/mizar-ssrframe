declare let __webpack_public_path__: string;

import * as React from "react";
import * as ReactDom from "react-dom";
import { Provider } from "react-redux";
import { renderRoutes } from "react-router-config";
import { BrowserRouter } from "react-router-dom";
import { getStore } from "./getStore";
import RouteContainer from "./libs/components/RouteContainer";
import "./libs/polyfill";
import state from "./libs/state";

export function bootstrap(pageRouter) {
    __webpack_public_path__ = (window as any).publicPath;
    return (id) => {
        ReactDom.render(
            <Provider store={getStore()} >
                <BrowserRouter>
                    <RouteContainer>
                        {renderRoutes(pageRouter)}
                    </RouteContainer>
                </BrowserRouter>
            </Provider>,
            document.getElementById(id),
        );
        state.isClientBootstraped = true;
    };
}
