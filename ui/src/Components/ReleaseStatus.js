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
import { createUseStyles } from "react-jss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import uniqueId from "lodash/uniqueId";

const useStyles = createUseStyles({
  status: {
    borderRadius: "0.14em",
    width: "2.5em",
    textAlign: "center",
    opacity: 1,
    padding: "2px",
    lineHeight: "normal",
    background: "currentColor",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(50%, 1fr))",
    color: "#404040",
    "&[status=UNRELEASED]": {
      color: "var(--ft-color-error)"
    },
    "&[status=HAS_CHANGED]": {
      color: "#f39c12"
    },
    "&[status=RELEASED]": {
      color: "#337ab7"
    },
    "&:not([status]) $instanceStatus": {
      color: "gray"
    },
    "&.darkmode $instanceStatus": {
      color: "var(--bg-color-ui-contrast2)"
    },
    "&.high-contrast $instanceStatus": {
      backgroundColor: "var(--bg-color-ui-contrast2)"
    }
  },
  instanceStatus: {
    color: "white",
    "& .svg-inline--fa": {
      fontSize: "0.7em",
      verticalAlign: "baseline"
    },
    "&:only-child": {
      "& .svg-inline--fa": {
        fontSize: "0.8em"
      },
    },

  },
});

const getIconStatus = status => {
  switch (status) {
  case "UNRELEASED": return "unlink";
  case "HAS_CHANGED": return "pencil-alt";
  case "RELEASED": return "check";
  default: break;
  }
  return "question";
};

const MessageStatus = ({status}) => {
  switch (status) {
  case "UNRELEASED": return <span>This instance is <strong>not released</strong>.</span>;
  case "HAS_CHANGED": return <span>This instance is <strong>different</strong> than its released version</span>;
  case "RELEASED": return <span>This instance is <strong>released</strong></span>;
  default: break;
  }
  return <strong>Unknown entity</strong>;
};

const renderOverlayTooltip = instanceStatus => (
  <Tooltip id={uniqueId("release-tooltip")}>
    <div>
      <MessageStatus status={instanceStatus} />
    </div>
  </Tooltip>
);


const ReleaseStatus = ({instanceStatus, darkmode}) => {
  const classes = useStyles();
  return (
    <OverlayTrigger placement="top" overlay={renderOverlayTooltip(instanceStatus)}>
      <div className={`${classes.status} ${darkmode? "darkmode" : ""} `} status={instanceStatus}>
        <div className={`${classes.instanceStatus}  `}>
          <FontAwesomeIcon icon={getIconStatus(instanceStatus)} />
        </div>
      </div>
    </OverlayTrigger>
  );
};

export default ReleaseStatus;