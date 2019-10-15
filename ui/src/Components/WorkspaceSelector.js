import React from "react";
import { observer } from "mobx-react";
import { Dropdown, MenuItem } from "react-bootstrap";
import { matchPath } from "react-router-dom";
import injectStyles from "react-jss";
import authStore from "../Stores/AuthStore";
import CustomDropdownToggle from "./CustomDropdownToggle";
import routerStore from "../Stores/RouterStore";
import instanceStore from "../Stores/InstanceStore";


const styles = {
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
};

@injectStyles(styles)
@observer
export default class WorkspaceSelector extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentLocation: routerStore.history.location.pathname
    };
    routerStore.history.listen(location => {
      this.setState({ currentLocation: location.pathname });
    });
  }

  selectWorkspace = eventKey => {
    if(instanceStore.openedInstances.size > 0) {
      if(authStore.currentWorkspace !== eventKey && window.confirm("You are about to change workspace. All opened instances will be closed. Continue ?")) {
        authStore.setCurrentWorkspace(eventKey);
        this.handleCloseAllInstances();
      }
    } else {
      authStore.setCurrentWorkspace(eventKey);
    }
  }

  handleCloseAllInstances = ()  => {
    if (!(matchPath(this.state.currentLocation, { path: "/", exact: "true" })
      || matchPath(this.state.currentLocation, { path: "/browse", exact: "true" })
      || matchPath(this.state.currentLocation, { path: "/help/*", exact: "true" }))) {
      routerStore.history.push("/browse");
    }
    instanceStore.removeAllInstances();
  }

  render() {
    const { classes } = this.props;

    return (
      <div className={classes.container} title={`${authStore.currentWorkspace} workspace`}>
        {authStore.workspaces.length > 1 ?
          <Dropdown id="dropdown-custom-1">
            <CustomDropdownToggle bsRole="toggle">{authStore.currentWorkspace}</CustomDropdownToggle>
            <Dropdown.Menu className={classes.dropdownMenu}>
              {authStore.workspaces.map(workspace =>
                <MenuItem key={workspace}
                  eventKey={workspace}
                  onSelect={this.selectWorkspace}>
                  {workspace}</MenuItem>
              )}
            </Dropdown.Menu>
          </Dropdown>
          : authStore.currentWorkspace}
      </div>
    );
  }
}