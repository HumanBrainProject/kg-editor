/*
 * Copyright 2018 - 2021 Swiss Federal Institute of Technology Lausanne (EPFL)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * This open source software code was developed in part or in whole in the
 * Human Brain Project, funded from the European Union's Horizon 2020
 * Framework Programme for Research and Innovation under
 * Specific Grant Agreements No. 720270, No. 785907, and No. 945539
 * (Human Brain Project SGA1, SGA2 and SGA3).
 *
 */

import React from "react";
import { createUseStyles } from "react-jss";
import { observer } from "mobx-react-lite";
import MultiToggle from "../../../Components/MultiToggle";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

import useStores from "../../../Hooks/useStores";

const useStyles = createUseStyles({
  container: {
    height: 0,
    marginTop: "-1px",
    "&.no-release": {
      marginLeft: "24px"
    },
    "&.no-unrelease": {
      marginRight: "24px"
    },
    "& .ban svg": {
      color: "var(--release-color-not-released)",
      fontSize: "1.5em"
    },
    "&.status-undefined .ban svg": {
      color: "gray"
    }
  }
});

const ReleaseNodeToggle = observer(({ node }) => {

  const classes = useStyles();

  const { instanceStore, releaseStore } = useStores();

  const handleChange = status => {
    instanceStore.togglePreviewInstance();
    releaseStore.markNodeForChange(node, status);
  };

  const handleStopClick = e => {
    e && e.stopPropagation();
  };

  if (!node || !releaseStore) {
    return null;
  }

  if(!node.permissions.canRelease || node.status === null) {
    return (
      <div className={`${classes.container} status-${node.status}`} title={node.status === null ? "Unknown entity": "You do not have permission to release the instance."} >
        <span className="ban"><FontAwesomeIcon  icon="ban" /></span>
      </div>
    );
  }

  return(
    <div className={`${classes.container} ${node.status === "RELEASED" ? "no-release" : ""} ${node.status === "UNRELEASED" ? "no-unrelease" : ""}`} onClick={handleStopClick}>
      <MultiToggle selectedValue={node.pending_status} onChange={handleChange}>
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
        {node.status !== "UNRELEASED" && (
          <MultiToggle.Toggle
            color={"#e74c3c"}
            value={"UNRELEASED"}
            icon="unlink"
          />
        )}
      </MultiToggle>
    </div>
  );
});
ReleaseNodeToggle.displayName = "ReleaseNodeToggle";

export default ReleaseNodeToggle;