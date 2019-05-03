import React from "react";
import { observer } from "mobx-react";
import injectStyles from "react-jss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import statusStore from "../../Stores/StatusStore";
import ReleaseStatus from "../../Components/ReleaseStatus";

let styles = {
  container: {
    fontSize: "0.75em",
    display: "inline-block",
    "& > div:only-child": {
      display: "block",
      position: "relative",
      zIndex: "5",
    },
    "& > div:first-child:not(:only-of-type)": {
      display: "block",
      position: "relative",
      zIndex: "5",
      boxShadow: "0.2em 0.2em 0.1em var(--release-status-box-shadow)"
    },
    "& > div:not(:first-child)": {
      position: "relative",
      top: "-0.3em",
      left: "0.6em",
      display: "block",
      zIndex: "3"
    },
  },
  loader: {
    borderRadius: "0.14em",
    width: "2.5em",
    background: "var(--bg-color-ui-contrast2)",
    textAlign: "center",
    color: "var(--ft-color-loud)",
    border: "1px solid var(--ft-color-loud)",
    "& .svg-inline--fa": {
      fontSize: "0.8em",
      verticalAlign: "baseline"
    }
  }
};

@injectStyles(styles)
@observer
export default class Status extends React.Component {
  constructor(props) {
    super(props);
    statusStore.fetchStatus(this.props.id);
  }

  UNSAFE_componentWillReceiveProps(newProps) {
    statusStore.fetchStatus(newProps.id);
  }

  render() {
    let instanceStatus = statusStore.getInstance(this.props.id);
    const { classes } = this.props;
    return (
      <div className={`${classes.container} status`}>
        {instanceStatus.hasFetchError ?
          <div className={classes.loader}>
            <FontAwesomeIcon icon={"question-circle"} />
          </div>
          : !instanceStatus.isFetched ?
            <div className={classes.loader}>
              <FontAwesomeIcon icon={"circle-notch"} spin />
            </div>
            :
            <ReleaseStatus darkmode={this.props.darkmode} instanceStatus={instanceStatus.data.status} isChildren={false} />
        }
        {instanceStatus.hasFetchErrorChildren ?
          <div className={classes.loader}>
            <FontAwesomeIcon icon={"question-circle"} />
          </div>
          : !instanceStatus.isFetchedChildren ?
            <div className={classes.loader}>
              <FontAwesomeIcon icon={"circle-notch"} spin />
            </div>
            :
            <ReleaseStatus darkmode={this.props.darkmode} instanceStatus={instanceStatus.data.childrenStatus ? instanceStatus.data.childrenStatus : null} highContrastChildren={true} isChildren={true} />
        }
      </div>
    );
  }
}