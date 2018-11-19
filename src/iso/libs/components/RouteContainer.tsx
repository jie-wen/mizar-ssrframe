import * as queryString from "querystring";
import * as React from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import { matchRoutes } from "react-router-config";
import * as config from "../../../config";
import { getInitialData } from "../metaCollector";
import getLoading from "./Loading";
const Loading = getLoading(config.loadingId);

class RouteContainer extends React.Component<{ history?, location?, dispatch?, pageRouter, loading}> {
    constructor(props) {
        super(props);
        if (!props.history) {
            return;
        }
        props.history.listen(async (location, action) => {
            // 当在浏览器端用无刷新的形式切换页面时，该函数被触发
            const branch = matchRoutes(props.pageRouter, location.pathname);
            if (!branch[0]) {
                return;
            }
            const { preloadData, pageReducerName } = await getInitialData(branch[0],
                {
                    baseUrl: location.pathname,
                    query: queryString.parse(location.search),
                },
            );
            props.dispatch({ type: config.frameworkId, data: preloadData });
            if (preloadData[pageReducerName].title) {
                document.title = preloadData[pageReducerName].title;
            }
        });
    }

    public render() {
        return (
            <div>
                {this.props.children}
                <Loading />
            </div>
        );
    }
}

export default withRouter(connect()(RouteContainer));
