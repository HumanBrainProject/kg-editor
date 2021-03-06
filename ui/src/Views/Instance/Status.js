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
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import statusStore from "../../Stores/StatusStore";
import ReleaseStatus from "../../Components/ReleaseStatus";

let styles = {
  container: {
    fontSize: "0.75em",
    display: "inline-block",
    "& > div:only-child": {
      display: "block",
      position: "relative",
      zIndex: "5",
    },
    "& > div:first-child:not(:only-of-type)": {
      display: "block",
      position: "relative",
      zIndex: "5",
      boxShadow: "0.2em 0.2em 0.1em var(--release-status-box-shadow)"
    },
    "& > div:not(:first-child)": {
      position: "relative",
      top: "-0.3em",
      left: "0.6em",
      display: "block",
      zIndex: "3"
    },
  },
  loader: {
    borderRadius: "0.14em",
    width: "2.5em",
    background: "var(--bg-color-ui-contrast2)",
    textAlign: "center",
    color: "var(--ft-color-loud)",
    border: "1px solid var(--ft-color-loud)",
    "& .svg-inline--fa": {
      fontSize: "0.8em",
      verticalAlign: "baseline"
    }
  }
};

@injectStyles(styles)
@observer
export default class Status extends React.Component {
  componentDidMount() {
    statusStore.fetchStatus(this.props.id);
  }

  render() {
    let instanceStatus = statusStore.getInstance(this.props.id);
    const { classes } = this.props;

    return (
      instanceStatus ?<div className={`${classes.container} status`}>
        {instanceStatus.hasFetchError ?
          <div className={classes.loader}>
            <FontAwesomeIcon icon={"question-circle"} />
          </div>
          : !instanceStatus.isFetched ?
            <div className={classes.loader}>
              <FontAwesomeIcon icon={"circle-notch"} spin />
            </div>
            :
            <ReleaseStatus darkmode={this.props.darkmode} instanceStatus={instanceStatus.data.status} isChildren={false} />
        }
        {instanceStatus.hasFetchErrorChildren ?
          <div className={classes.loader}>
            <FontAwesomeIcon icon={"question-circle"} />
          </div>
          : !instanceStatus.isFetchedChildren ?
            <div className={classes.loader}>
              <FontAwesomeIcon icon={"circle-notch"} spin />
            </div>
            :
            <ReleaseStatus darkmode={this.props.darkmode} instanceStatus={instanceStatus.data.childrenStatus ? instanceStatus.data.childrenStatus : null} highContrastChildren={true} isChildren={true} />
        }
      </div>:null
    );
  }
}