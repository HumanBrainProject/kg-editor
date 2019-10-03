import React from "react";
import { observer } from "mobx-react";
import { DropdownButton, MenuItem } from "react-bootstrap";
import injectStyles from "react-jss";
import authStore from "../Stores/AuthStore";

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
    gridTemplateColumns: "auto 1fr auto"
  }
};

@injectStyles(styles)
@observer
export default class WorkspaceSelector extends React.Component {

  selectWorkspace = (eventKey) => authStore.setCurrentWorkspace(eventKey);

  render() {
    const { classes } = this.props;

    return (
      <div className={`${classes.container}`}>
        {authStore.workspaces.length > 1 ?
          <DropdownButton
            id="dropdown-menu"
            title={authStore.currentWorkspace}
            key={authStore.currentWorkspace}
          >
            {authStore.workspaces.map(workspace =>
              <MenuItem key={workspace}
                eventKey={workspace}
                active={workspace === authStore.currentWorkspace}
                onSelect={this.selectWorkspace}>
                {workspace}</MenuItem>
            )}
          </DropdownButton> : authStore.currentWorkspace}
      </div>
    );
  }
}