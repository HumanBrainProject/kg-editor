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
import injectStyles from "react-jss";
import { observer } from "mobx-react";
import MultiToggle from "../../../Components/MultiToggle";
import releaseStore from "../../../Stores/ReleaseStore";
import instanceStore from "../../../Stores/InstanceStore";

const styles = {
  container: {
    height: 0,
    marginTop: "-1px",
    marginRight: "20px",
    "&.no-release": {
      marginLeft: "24px"
    },
    "&.no-unrelease": {
      marginRight: "24px"
    }
  },
};

@injectStyles(styles)
@observer
export default class ReleaseNodeToggle extends React.Component {
  handleChange = status => {
    instanceStore.togglePreviewInstance();
    const { node } = this.props;
    releaseStore.markNodeForChange(node, status);
    releaseStore.handleWarning(node, status);
  };

  handleStopClick = e => {
    e && e.stopPropagation();
  };

  render() {
    const { classes, node } = this.props;
    if (!node || !releaseStore) {
      return null;
    }

    return (
      <div
        className={`${classes.container} ${
          node.status === "RELEASED" ? "no-release" : ""
        } ${node.status === "NOT_RELEASED" ? "no-unrelease" : ""}`}
        onClick={this.handleStopClick}
      >
        <MultiToggle
          selectedValue={node.pending_status}
          onChange={this.handleChange}
        >
          {node.status !== "RELEASED" && (
            <MultiToggle.Toggle
              color={"#3498db"}
              value={"RELEASED"}
              icon="check"
            />
          )}
          <MultiToggle.Toggle
            color={"#999"}
            value={node.status}
            icon="dot-circle"
            noscale
          />
          {node.status !== "NOT_RELEASED" && (
            <MultiToggle.Toggle
              color={"#e74c3c"}
              value={"NOT_RELEASED"}
              icon="unlink"
            />
          )}
        </MultiToggle>
      </div>
    );
  }
}