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
import { Button } from "react-bootstrap";

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
  },
  loader: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    zIndex: 10000,
    background: "var(--bg-color-blend-contrast1)",
    "& .fetchingPanel": {
      width: "auto",
      padding: "30px",
      border: "1px solid var(--border-color-ui-contrast1)",
      borderRadius: "4px",
      color: "var(--ft-color-loud)",
      background: "var(--list-bg-hover)"
    }
  },
  fetchErrorPanel: {
    position: "absolute !important",
    top: "50%",
    left: "50%",
    padding: "30px",
    border: "1px solid var(--border-color-ui-contrast1)",
    borderRadius: "4px",
    color: "var(--ft-color-loud)",
    background: "var(--list-bg-hover)",
    transform: "translate(-50%, -50%)",
    textAlign: "center",
    minWidth: "220px",
    "& h4": {
      paddingBottom: "10px",
      color: "var(--ft-color-error)"
    },
    "& button + button, & a + button, & a + a": {
      marginLeft: "20px"
    }
  }
};

@injectStyles(styles)
@observer
class GraphInstance extends React.Component {

  fetch = () => {
    graphStore.fetch(this.props.instance.id);
  }

  componentDidMount() {
    this.fetch();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.instance !== this.props.instance) {
      this.fetch();
    }
  }

  render() {
    const { classes, instance } = this.props;

    if (graphStore.fetchError) {
      return (
        <div className={classes.fetchErrorPanel}>
          <h4>Error while fetching graph data for instance &quot;{instance.id}&quot; ({graphStore.fetchError})</h4>
          <Button bsStyle="primary" onClick={this.fetch}>Retry</Button>
        </div>
      );
    }

    if (graphStore.isFetching) {

      return (
        <div className={classes.loader}>
          <FetchingLoader>Fetching visualization data for instance &quot;{instance.id}&quot; ...</FetchingLoader>
        </div>
      );
    }

    return (
      <div className={classes.container}>
        <div className={classes.graph}>
          <GraphViz />
        </div>
        <div className={classes.settings}>
          <GraphSettings />
        </div>
      </div>
    );
  }
}

export default GraphInstance;