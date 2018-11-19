import * as BodyParser from "body-parser";
import * as Compression from "compression";
import * as CookieParser from "cookie-parser";
import * as Express from "express";
import * as Http from "http";
import * as net from "net";
import * as Path from "path";
import "source-map-support/register";

export class WebServer {
    public server: net.Server;
    public app: Express.Express;
    protected name = "WebServer";
    private port: number = null;
    private router = null;
    private staticRootPath = null;
    private staticOptions = {};

    constructor(config) {
        this.app = Express();
        this.server = Http.createServer(this.app);
        if (config && config.port) {
            this.port = config.port;
        }
    }

    /**
     * 启动Web服务器
     */
    public async bootstrapAsync() {
        this.setCloseHandle();
        this.ready();
        await this.startup();
        console.log(this.name, "bootstrapAsync", "port", this.port);
        return this;
    }
    /**
     * 挂载该Web服务器的router点
     * @param router
     */
    public setRouter(router) {
        this.router = router;
        return this;
    }
    /**
     * 配置其它自定义中间件
     * @param {Express.RequestHandler | Express.ErrorRequestHandler | Express.NextFunction | any} handler
     */
    public useMiddleware(handler: Express.RequestHandler | Express.ErrorRequestHandler | Express.NextFunction | any) {
        this.app.use(handler);
        return this;
    }
    /**
     * 关闭该web服务器
     */
    public close() {
        console.warn(this.name, "close", "port", this.port);
    }

    /**
     * @deprecated 过时的方法，应该使用bootstrapAsync
     */
    public async bootstrap() {
        await this.bootstrapAsync();
    }
    /**
     * @deprecated 过时的方法，不应由外部调用
     * 处理退出时的事件
     */
    private setCloseHandle() {
        process.once("SIGINT", () => {
            this.close();
        });
    }
    /**
     * @deprecated 过时的方法，不应由外部调用
     */
    private ready() {
        // this.app.set("port", this.port);
        this.errorEventHandler();
        this.setHttpLogger();
        this.setMiddleware();
        return this;
    }

    private setHealthCheck() {
        this.app.get("/status", (req, res) => {
            // 监控程序通过访问 /status https的状态码为200来判断服务是否健康
            res.send("OK");
        });
    }

    private errorEventHandler() {
        process.on("uncaughtException", (error) => {
            console.error(this.name, "errorEventHandler",
                "UNCAUGHT_EXCEPTION", "!!!未处理的严重异常.被process.uncaughtException捕获!!!", error);
        });
    }
    
    private async startup() {
        return new Promise((resolve, reject) => {
            this.server.listen(this.port, (error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });
    }
    /**
     * 中间件配置
     * 注意：执行顺序对应用的影响
     */
    private setMiddleware() {
        this.app.use(Compression());
        this.app.use(CookieParser());
        this.app.use(BodyParser.json());
        this.app.use(BodyParser.urlencoded({
            limit: 10 * 1024 * 1024,
            extended: true,
        }));
        if (this.staticRootPath !== null) {
            this.app.use(Express.static(Path.resolve(this.staticRootPath), this.staticOptions));
        }
        this.setHealthCheck();
        if (this.router !== null) {
            // 业务
            this.app.use(this.router.getRouter());
        }
    }
    /**
     * 链接日志服务，收集每次网络请求的详情日志
     */
    private setHttpLogger() {
        // 将请求写入日志
    }

    public setStatic(staticRootPath, staticOptions) {
        this.staticRootPath = staticRootPath;
        this.staticOptions = staticOptions;
        return this;
    }

}

export default WebServer;
