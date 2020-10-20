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

  const handleSelectWorkspace = eventKey => {
    appStore.setCurrentWorkspace(eventKey);
  };

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