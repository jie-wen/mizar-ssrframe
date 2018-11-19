import * as Express from "express";

export class BaseRouter {
    protected router: Express.Router = Express.Router();
    public getRouter(): Express.Router {
        this.setRouter();
        return this.router;
    }
    public setRouter() {
        // 用于注册Router
        console.info("未重载setRouter方法");
    }
}
