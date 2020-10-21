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

import React, { useState, useEffect } from "react";
import { observer } from "mobx-react";
import { Dropdown, MenuItem } from "react-bootstrap";
import { createUseStyles } from "react-jss";
import authStore from "../Stores/AuthStore";
import CustomDropdownToggle from "./CustomDropdownToggle";
import routerStore from "../Stores/RouterStore";
import appStore from "../Stores/AppStore";

const useStyles = createUseStyles({
  container: {
    height: "50px",
    lineHeight: "50px",
    color: "var(--ft-color-normal)",
    background: "var(--bg-color-ui-contrast2)",
    padding: "0 20px 0 20px",
    border: "1px solid var(--border-color-ui-contrast2)",
    borderLeft: "none",
    cursor: "pointer",
    display: "grid",
    gridTemplateColumns: "auto 1fr auto",
    "& .btn-group": {
      margin: "-2px"
    }
  },
  dropdownMenu: {
    background: "var(--ft-color-loud)",
    margin: "0 0 0 -20px",
    fontSize: "0.9em"
  }
});

const WorkspaceSelector = observer(() => {
  const classes = useStyles();

  const [currentLocationPathname, setCurrentLocationPathname] = useState(routerStore.history.location.pathname);

  useEffect(() => {
    const unlisten = routerStore.history.listen(location => {
      setCurrentLocationPathname(location.pathname);
    });
    return unlisten;
  }, []);

  const handleSelectWorkspace = eventKey => appStore.setCurrentWorkspace(eventKey);

  return (
    <div key={currentLocationPathname} className={classes.container} title={`${appStore.currentWorkspaceName} workspace`}>
      {authStore.workspaces.length > 1 ?
        <Dropdown id="dropdown-custom-1">
          <CustomDropdownToggle bsRole="toggle">{appStore.currentWorkspaceName}</CustomDropdownToggle>
          <Dropdown.Menu className={classes.dropdownMenu}>
            {authStore.workspaces.map(workspace =>
              <MenuItem key={workspace.id}
                eventKey={workspace.id}
                onSelect={handleSelectWorkspace}>
                {workspace.name||workspace.id}</MenuItem>
            )}
          </Dropdown.Menu>
        </Dropdown>
        : appStore.currentWorkspaceName}
    </div>
  );
});

export default WorkspaceSelector;