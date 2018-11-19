import axios from "axios";
import * as events from "events";
import * as httpMock from "node-mocks-http";
import * as config from "../config";
import { getStore } from "./getStore";
import * as loadingActions from "./libs/components/Loading/actions";
import isServer from "./libs/utils/isServer";

let loadingNumber = 0;

export const fetchWithRequestObject = (httpRequest) => async (url, options?) => {
    if (options === undefined) {
        options = url;
        url = options.url;
    }

    if (isServer) {
        // 是nodejs环境
        let data;
        if (url.startsWith("http://") || url.startsWith("https://")) {
            // 从服务端请求API团队提供的API服务
            // 这种情况下的请求，cookie是无法工作的，获取的IP会替换成客户端的IP
            const response = await axios(Object.assign({}, options));
            data = response.data;
        }
        return data;
    } else {
        // 客户端浏览器环境
        if (!options.noLoading) {
            // 显示loading
            showLoading();
        }
        const finalOptions = Object.assign({}, { withCredentials: true }, options);

        return new Promise((resolve, reject) => {
            axios(finalOptions)
                .then((response) => {
                    resolve(response.data);
                    hideLoading();
                }, (reason) => {
                    reject(reason);
                    hideLoading();
                });
        });
    }
};

function showLoading() {
    loadingNumber++;
    getStore().dispatch(loadingActions.showLoading(config.loadingId));
}

function hideLoading() {
    loadingNumber--;
    if (loadingNumber <= 0) {
        getStore().dispatch(loadingActions.hideLoading(config.loadingId));
    }
}

export const fetch = fetchWithRequestObject(null);
