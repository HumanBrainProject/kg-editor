import React from "react";
import injectStyles from "react-jss";
import { observer } from "mobx-react";
import MultiToggle from "../../../Components/MultiToggle";
import releaseStore from "../../../Stores/ReleaseStore";
import appStore from "../../../Stores/AppStore";

const styles = {
  container: {
    height: 0,
    marginTop: "-1px",
    marginRight: "20px",
    "&.no-release": {
      marginLeft: "24px"
    },
    "&.no-unrelease": {
      marginRight: "24px"
    }
  },
};

@injectStyles(styles)
@observer
class ReleaseNodeToggle extends React.Component {
  handleChange = status => {
    appStore.togglePreviewInstance();
    const { node } = this.props;
    releaseStore.markNodeForChange(node, status);
    releaseStore.handleWarning(node, status);
  };

  handleStopClick = e => {
    e && e.stopPropagation();
  };

  render() {
    const { classes, node } = this.props;
    if (!node || !releaseStore) {
      return null;
    }

    return (
      <div
        className={`${classes.container} ${
          node.status === "RELEASED" ? "no-release" : ""
        } ${node.status === "UNRELEASED" ? "no-unrelease" : ""}`}
        onClick={this.handleStopClick}
      >
        <MultiToggle
          selectedValue={node.pending_status}
          onChange={this.handleChange}
        >
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
  }
}

export default ReleaseNodeToggle;