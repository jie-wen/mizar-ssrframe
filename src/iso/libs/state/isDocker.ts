import cdnStaticSegmentPath from "./cdnStaticSegmentPath";

let isDocker;
if (cdnStaticSegmentPath) {
    isDocker = true;
} else {
    isDocker = false;
}

export default isDocker;
