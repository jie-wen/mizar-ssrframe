import * as fs from "fs-extra";
import state from "../iso/libs/state";

const packageJSON = fs.readJSONSync("./package.json");
let cdnServer = "";
let cdnSwitch = false;
let publicPath = "";


export async function getPublicPath(): Promise<string> {
    if (state.isDebug) {
        return "/" + packageJSON.cdn + "/";
    }
    if (publicPath === "") {
        publicPath = (cdnServer || "") + "/" + packageJSON.cdn + "/";
    }
    return publicPath;
}

export function getPackageVersion(): string {
    return packageJSON.cdn || "";
}
