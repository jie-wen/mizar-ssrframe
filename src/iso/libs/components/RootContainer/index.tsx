import * as React from "react";

export default (props) => {
    const { initialState, publicPath } = props;
    const { title, keywords, description, favicon, styles,
        scripts, links, metas, children, isMobile,
        uiDesignWidth, reducerName } = props.meta;

    const viewport = "width=device-width,initial-scale=1,minimum-scale=1.0,maximum-scale=1,user-scalable=no";
    return (
        <html>
            <head>
                <meta charSet="UTF-8" />
                <meta httpEquiv="Content-Type" content="text/html; charset=UTF-8" />
                <meta httpEquiv="x-ua-compatible" content="ie=edge" />
                <meta name="viewport" content={viewport} />
                <meta name="keywords" content={keywords} />
                <meta name="description" content={description} />
                {metas}
                <title>{title}</title>
                <link href={favicon} rel="icon" />
                <link href={favicon} rel="shortcut icon" />
                <link href={favicon} rel="bookmark" />
                {links}
                {styles && styles.map((style) => <link rel="stylesheet" key={style} href={style} type="text/css" />)}
                {
                    isMobile ?
                        <script dangerouslySetInnerHTML={{
                            __html: `
                            (function () {
                                function setRootFontSize() {
                                    var rootElement = document.documentElement;
                                    var styleElement = document.createElement("style");
                                    var dpr = Number(window.devicePixelRatio.toFixed(5)) || 1;
                                    var rootFontSize = rootElement.clientWidth / ${uiDesignWidth / 100};
                                    rootElement.setAttribute("data-dpr", dpr.toString());
                                    rootElement.firstElementChild.appendChild(styleElement);
                                    styleElement.innerHTML = "html{font-size:" + rootFontSize + "px!important;}";
                                }
                                setRootFontSize();
                                window.addEventListener("resize", setRootFontSize);
                            })();
                        `,
                        }}></script>
                        : ""
                }
            </head>
            <body>
                <div id="app">
                    {props.children}
                </div>
                <script dangerouslySetInnerHTML={{
                    __html: `window.__INITIAL_STATE__ = ${JSON.stringify(initialState).replace(/</g, "\\u003c")}`,
                }}>
                </script>
                <script dangerouslySetInnerHTML={{
                    __html: `window.publicPath=${JSON.stringify(publicPath)}`,
                }}>
                </script>
                {scripts && scripts.map((script) => <script key={script} src={script} />)}
            </body>
        </html>
    );
};
