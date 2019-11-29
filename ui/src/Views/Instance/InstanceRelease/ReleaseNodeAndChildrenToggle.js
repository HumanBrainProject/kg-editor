import React from "react";
import { observer } from "mobx-react";
import injectStyles from "react-jss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import releaseStore from "../../../Stores/ReleaseStore";

const styles = {
  container: {
    display: "flex",
    flexDirection: "row",
    height: "24px",
    background: "var(--bg-color-ui-contrast4)",
    borderRadius: "20px"
  },
  btn: {
    textAlign:"center",
    width: "24px",
    height:"24px",
    lineHeight:"24px",
    cursor:"pointer",
    fontSize:"0.66em",
    transition:"all .2s ease",
    background:"none",
    "&:hover":{
      background:"var(--bg-color-ui-contrast1)",
      borderRadius:"50%",
      transform:"scale(1.12)",
      fontSize:"0.8em"
    }
  },
  releaseBtn: {
    extend: "btn",
    color: "#3498db"
  },
  doNothingBtn: {
    extend: "btn",
    color: "#999",
    "&:hover":{
      transform: "scale(1)"
    }
  }
};

@injectStyles(styles)
@observer
class ReleaseNodeAndChildrenToggle extends React.Component {
  handleClick = status => {
    const node = releaseStore.instancesTree;
    releaseStore.markAllNodeForChange(node, status);
  }

  render() {
    const { classes } = this.props;
    return (
      <div className={classes.container}>
        <div onClick={() => this.handleClick("RELEASED")} className={classes.releaseBtn} title="release all">
          <FontAwesomeIcon icon="check"/>
        </div>
        <div onClick={() => this.handleClick()} className={classes.doNothingBtn} title="do nothing">
          <FontAwesomeIcon icon="dot-circle"/>
        </div>
      </div>
    );
  }
}

export default ReleaseNodeAndChildrenToggle;