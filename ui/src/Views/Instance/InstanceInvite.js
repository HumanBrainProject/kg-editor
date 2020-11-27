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
import { observer } from "mobx-react-lite";
import { createUseStyles } from "react-jss";

import Preview from "../Preview";
// import Reviewers from "./InstanceInvite/Reviewers";
import BGMessage from "../../Components/BGMessage";

const useStyles = createUseStyles({
  container: {
    position: "relative",
    width: "100%",
    height: "100%",
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
});

const InstanceInvite = observer(({ instance: { id, permissions} }) => {
  const classes = useStyles();
  return (
    <div className={classes.container}>
      <div className={classes.panel}>
        {permissions.canInviteForSuggestion?
          <React.Fragment>
            <Preview className={classes.preview} instanceId={id} showEmptyFields={false} showAction={false} showBookmarkStatus={false} showType={true} showStatus={false} showMetaData={false} />
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
});
InstanceInvite.displayName = "InstanceInvite";

export default InstanceInvite;