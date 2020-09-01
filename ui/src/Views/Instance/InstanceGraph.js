/*
*   Copyright (c) 2020, EPFL/Human Brain Project PCO
*
*   Licensed under the Apache License, Version 2.0 (the "License");
*   you may not use this file except in compliance with the License.
*   You may obtain a copy of the License at
*
*       http://www.apache.org/licenses/LICENSE-2.0
*
*   Unless required by applicable law or agreed to in writing, software
*   distributed under the License is distributed on an "AS IS" BASIS,
*   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*   See the License for the specific language governing permissions and
*   limitations under the License.
*/

import React from "react";
import { observer } from "mobx-react";
import injectStyles from "react-jss";

import graphStore from "../../Stores/GraphStore";
import GraphViz from "./InstanceGraph/GraphViz";
import GraphSettings from "./InstanceGraph/GraphSettings";
import FetchingLoader from "../../Components/FetchingLoader";

const styles = {
  container: {
    position: "relative",
    width: "100%",
    height: "100%",
    display: "grid",
    gridGap: "10px",
    gridTemplateRows: "1fr",
    gridTemplateColumns: "1fr 450px",
    padding: "10px",
    color: "var(--ft-color-normal)"
  },

  graph: {
    background: "var(--bg-color-ui-contrast2)",
    border: "1px solid var(--border-color-ui-contrast1)",
    overflow: "hidden",
    position: "relative",
  },

  settings: {
    background: "var(--bg-color-ui-contrast2)",
    border: "1px solid var(--border-color-ui-contrast1)",
    overflow: "auto",
    position: "relative"
  }
};

@injectStyles(styles)
@observer
class GraphInstance extends React.Component {
  componentDidMount() {
    graphStore.fetchGraph(this.props.instance.id);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.instance !== this.props.instance) {
      graphStore.fetchGraph(this.props.instance.id);
    }
  }

  render() {
    const { classes } = this.props;

    return (
      <div className={classes.container}>
        <div className={classes.graph}>
          {graphStore.isFetching ?
            <FetchingLoader>Fetching visualization data...</FetchingLoader>
            :
            <GraphViz />
          }
        </div>
        <div className={classes.settings}>
          {graphStore.isFetching ?
            <FetchingLoader>Fetching data...</FetchingLoader>
            :
            <GraphSettings />
          }
        </div>
      </div>
    );
  }
}

export default GraphInstance;