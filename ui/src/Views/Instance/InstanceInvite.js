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

import instanceStore from "../../Stores/InstanceStore";

import Preview from "../Preview";
// import Reviewers from "./InstanceInvite/Reviewers";
import BGMessage from "../../Components/BGMessage";

const rootPath = window.rootPath || "";

const styles = {
  container: {
    position: "relative",
    width: "100%",
    height: "100%",
    backgroundImage: `url('${window.location.protocol}//${window.location.host}${rootPath}/assets/graph.png')`,
    backgroundPosition: "50% 50%",
    "& .errorPanel, & .fetchingPanel": {
      color: "var(--ft-color-loud)",
      "& svg path": {
        stroke: "var(--ft-color-loud)",
        fill: "var(--ft-color-quiet)"
      }
    }
  },
  panel: {
    position: "relative",
    width: "60%",
    height: "calc(100% - 40px)",
    margin:"20px 20%",
    display: "grid",
    overflow: "hidden",
    gridTemplateRows: "1fr",
    gridTemplateColumns: "1fr 33%",
    gridColumnGap: "20px"
  },
  preview: {
    backgroundColor: "var(--bg-color-ui-contrast2)",
    color: "var(--ft-color-normal)"
  }
};

@injectStyles(styles)
@observer
class InstanceInvite extends React.Component{
  componentDidMount() {
    instanceStore.setReadMode(true);
  }

  componentDidUpdate(prevProps) {
    if (this.props.instance && this.props.instance !== prevProps.instance) {
      instanceStore.setReadMode(true);
    }
  }

  render(){
    const { classes, instance } = this.props;
    const { permissions } = instance;
    return (
      <div className={classes.container}>
        <div className={classes.panel}>
          {permissions.canInviteForSuggestion?
            <React.Fragment>
              <Preview className={classes.preview} instanceId={instance.id} showEmptyFields={false} showAction={false} showBookmarkStatus={false} showType={true} showStatus={false} showMetaData={false} />
              {/* <Reviewers id={this.props.id} /> */}
            </React.Fragment>
            :
            <BGMessage icon={"ban"} className={classes.error}>
              You are note entitled to invite people for suggestions.
            </BGMessage>
          }
        </div>
      </div>
    );
  }
}

export default InstanceInvite;