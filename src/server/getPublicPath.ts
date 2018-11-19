import { getPublicPath as configGetPublicPath } from "./getConfig";
/**
 * @deprecated 应从getConfig.ts 导出 getPublicPath来使用
 */
export async function getPublicPath() {
    return await configGetPublicPath();
}
