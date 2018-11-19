import { BaseRouter } from "./base";
import * as React from "react";
import * as ReactDomServer from "react-dom/server";
import { Provider } from "react-redux";
import { matchRoutes, renderRoutes } from "react-router-config";
import { Route, StaticRouter, Switch } from "react-router-dom";
import { createStore } from "redux";
import * as config from "../../../config";
import * as Loading from "../../../iso/libs/components/Loading";
import RootContainer from "../../../iso/libs/components/RootContainer";
import RouteContainer from "../../../iso/libs/components/RouteContainer";
import * as metaCollector from "../../../iso/libs/metaCollector";
import { getPublicPath } from "../../getConfig";
import { IProxyConfig } from "../interface";
import LocalPageCache from "../LocalPageCache";

// export interface IServerRouter {
//     path: string;
//     meta?: any;
//     proxyConfig?: any;
//     clientRouter: RouteConfig[]
// }

export default class RootRouter extends BaseRouter {

    private meta: any;
    private proxyConfig;

    private pageRouter;

    public constructor(pageRouter, meta: any, proxyConfig: IProxyConfig[]) {
        super();
        this.setPageRouter(pageRouter, meta, proxyConfig);
    }

    public setRouter() {
        this.router.use(async (req, res, next) => {
            try {
                const originalUrl = req.originalUrl;
                const path = this.getUrlPath(originalUrl);
                const branch = matchRoutes(this.pageRouter, path);
                if (!branch[0]) {
                    // 找不到匹配的页面，由express的404兜底
                    next();
                    return;
                }
                if (this.meta.useLocalPageCache) {
                    const cachedHtml = LocalPageCache.get(branch[0].route.component);
                    if (cachedHtml) {
                        // 命中本地页面缓存
                        console.info("useLocalPageCache 命中缓存", path);
                        res.send(cachedHtml);
                        return;
                    }
                }
                const { preloadData = {}, pageReducerName = "" } =
                    await metaCollector.getInitialData(branch[0], req);
                const store = createStore(metaCollector.getRootReducer(), preloadData);
                const initialState: any = store.getState() || {};
                initialState[Loading.getReducerName(config.loadingId)] = this.meta.loading;
                const meta = Object.assign({}, this.meta, this.getMeta(initialState[pageReducerName] || {}));
                const publicPath = await getPublicPath();
                const Page = (<RootContainer
                    initialState={initialState}
                    meta={meta}
                    publicPath={publicPath}>
                    <Provider store={store}>
                        <StaticRouter location={req.originalUrl} context={{}}>
                            <RouteContainer>
                                {renderRoutes(this.pageRouter)}
                            </RouteContainer>
                        </StaticRouter>
                    </Provider>
                </RootContainer>);
                if (this.meta.useLocalPageCache) {
                    console.info("path:", path, "useLocalPageCache 本地页面缓存开关为开的状态，存入本地缓存，然后返回给客户端");
                    const html = "<!DOCTYPE html>" + ReactDomServer.renderToString(Page);
                    LocalPageCache.set(branch[0].route.component, html);
                    res.send(html);
                } else {
                    const htmlStream = ReactDomServer.renderToNodeStream(Page);
                    res.write("<!DOCTYPE html>");
                    htmlStream.pipe(res);
                }
            } catch (e) {
                console.error(e);
            }
        });
    }

    private setPageRouter(pageRouter, meta: any, proxyConfig: IProxyConfig[]) {
        this.pageRouter = pageRouter;
        this.meta = meta;
        this.proxyConfig = proxyConfig;
    }

    private getMeta(pageInitialState) {
        const meta: { title?, description?, keywords?} = {};
        if (pageInitialState.title) {
            meta.title = pageInitialState.title;
        }
        if (pageInitialState.description) {
            meta.description = pageInitialState.description;
        }
        if (pageInitialState.keywords) {
            meta.keywords = pageInitialState.keywords;
        }
        return meta;
    }

    private getUrlPath(url) {
        return url.split("?")[0];
    }
}
