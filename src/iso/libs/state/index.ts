import cndStaticSegmentPath from "./cdnStaticSegmentPath";
import isDebug from "./isDebug";
import isDocker from "./isDocker";
import swarmEnvironmentName from "./swarmEnvironmentName";

export default {
    apis: {},
    isDocker,
    cndStaticSegmentPath,
    isDebug,
    isClientBootstraped: false,
    swarmEnvironmentName,
} as {
    apis: object,
    isDocker: boolean,
    cndStaticSegmentPath: string,
    isDebug: boolean,
    isClientBootstraped: boolean,
    swarmEnvironmentName: string,
};
