import React from "react";
import { observer } from "mobx-react";
import injectStyles from "react-jss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import appStore from "../../Stores/AppStore";
import routerStore from "../../Stores/RouterStore";

const styles = {
  actions: {
    display: "grid",
    gridTemplateColumns: "repeat(5, 1fr)",
    gridGap: "10px",
    marginBottom: "20px"
  },
  action: {
    height: "34px",
    cursor: "pointer",
    overflow: "hidden",
    lineHeight: "34px",
    textAlign: "center",
    borderRadius: "2px",
    backgroundColor: "var(--bg-color-blend-contrast1)",
    color: "var(--ft-color-normal)",
    "&:hover": {
      color: "var(--ft-color-loud)"
    }
  }
};

@injectStyles(styles)
@observer
class Actions extends React.Component {
  handleOpenInstance(mode, event) {
    if (event.metaKey || event.ctrlKey) {
      appStore.openInstance(this.props.instanceId, mode);
    } else {
      routerStore.history.push(
        `/instance/${mode}/${this.props.instanceId}`
      );
    }
  }
  render() {
    const { classes } = this.props;

    return (
      <div className={classes.actions}>
        <div
          className={classes.action}
          onClick={this.handleOpenInstance.bind(this, "view")}
        >
          <FontAwesomeIcon icon="eye" />
                  &nbsp;&nbsp;Open
        </div>
        <div
          className={classes.action}
          onClick={this.handleOpenInstance.bind(this, "edit")}
        >
          <FontAwesomeIcon icon="pencil-alt" />
                  &nbsp;&nbsp;Edit
        </div>
        <div
          className={classes.action}
          onClick={this.handleOpenInstance.bind(this, "invite")}
        >
          <FontAwesomeIcon icon="user-edit" />
                  &nbsp;&nbsp;Invite
        </div>
        <div
          className={classes.action}
          onClick={this.handleOpenInstance.bind(this, "graph")}
        >
          <FontAwesomeIcon icon="project-diagram" />
                  &nbsp;&nbsp;Explore
        </div>
        <div
          className={classes.action}
          onClick={this.handleOpenInstance.bind(this, "release")}
        >
          <FontAwesomeIcon icon="cloud-upload-alt" />
                  &nbsp;&nbsp;Release
        </div>
        <div
          className={classes.action}
          onClick={this.handleOpenInstance.bind(this, "manage")}
        >
          <FontAwesomeIcon icon="cog" />
                  &nbsp;&nbsp;Manage
        </div>
      </div>
    );
  }
}

export default Actions;