declare let __webpack_public_path__: string;

import { getPackageVersion, getPublicPath } from "./getConfig";
import { getAsyncRouter } from "./getRouter";
import state from "../iso/libs/state";
import WebServer from "./webServer";

export async function bootstrap(serverRouter, config: { port: number }) {
    try {
        __webpack_public_path__ = await getPublicPath();
        let staticCacheStrategy = {};
        if (!state.isDebug) {
            staticCacheStrategy = { maxAge: 31536000000 };
        }
        const server = new WebServer({ port: config.port }).setStatic("client", staticCacheStrategy);
        await server.setRouter(await getAsyncRouter(serverRouter)).bootstrapAsync();
    } catch (e) {
        console.info("启动错误", e);
    }
}
