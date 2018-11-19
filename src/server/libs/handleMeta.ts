
export default function handleMeta(getMeta, publicPath) {
    let finalMeta = { favicon: "", styles: [], scripts: [], metas: [], links: [] };
    let meta;
    if (Object.prototype.toString.call(getMeta) === "[object Function]") {
        meta = getMeta();
    } else {
        meta = getMeta;
    }
    finalMeta = Object.assign({}, meta);
    const getFinalPath = handleRelativePath(publicPath);
    finalMeta.favicon = getFinalPath(finalMeta.favicon || "favicon.ico");
    if (finalMeta.styles) {
        finalMeta.styles = finalMeta.styles.map((style) => {
            return getFinalPath(style);
        });
    }
    if (finalMeta.scripts) {
        finalMeta.scripts = finalMeta.scripts.map((script) => {
            return getFinalPath(script);
        });
    }
    if (finalMeta.links) {
        finalMeta.links = finalMeta.links.map((link) => {
            if (link.props.href) {
                link.props.href = getFinalPath(link.props.href);
                return link;
            }
            return link;
        });
    }
    return finalMeta;
}

function handleRelativePath(publicPath) {
    return (path, assetsCategory = "") => {
        if (!path.startsWith("http://") && !path.startsWith("https")) {
            // 是个相对路径
            if (assetsCategory !== "" && !assetsCategory.endsWith("/")) {
                assetsCategory = assetsCategory + "/";
            }
            return `${publicPath}${assetsCategory}${path}`;
        }
        return path;
    };
}
