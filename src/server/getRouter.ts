import { RouteConfig } from "react-router-config";
import { getPublicPath } from "./getConfig";
import handleMeta from "./libs/handleMeta";
import Router from "./libs/router";
import { BaseRouter } from "./libs/router/base";

export async function getAsyncRouter(pageRouter): Promise<any> {
    const publicPath = await getPublicPath();

    return new class extends BaseRouter {
        public setRouter() {
            pageRouter.forEach((singlePageRouterConfig) => {
                const path = singlePageRouterConfig.path;
                const singlePageClientRouter = singlePageRouterConfig.clientRouter;
                const singleParsedMeta = Object.assign({},
                    handleMeta(singlePageRouterConfig.meta, publicPath));
                const singlePageProxyConfig = singlePageRouterConfig.proxyConfig;
                this.router.get(path,
                    new Router(singlePageClientRouter, singleParsedMeta, singlePageProxyConfig).getRouter());
            });
        }
    }();
}
