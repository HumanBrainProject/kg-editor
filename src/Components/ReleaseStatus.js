import React from "react";
import injectStyles from "react-jss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { uniqueId } from "lodash";

const styles = {
  status: {
    borderRadius: "0.14em",
    width: "2.5em",
    textAlign: "center",
    opacity: 1,
    padding: "2px",
    lineHeight: "normal",
    background: "currentColor",
    "&.released ": {
      color: "#337ab7",
    },
    "&.has-changed": {
      color: "#f39c12",
    },
    "&.not-released": {
      color: "var(--ft-color-error)",
    },
    "&.released.high-contrast $instanceStatus": {
      color: "#337ab7",
    },
    "&.has-changed.high-contrast $instanceStatus": {
      color: "#f39c12",
    },
    "&.not-released.high-contrast $instanceStatus": {
      color: "var(--ft-color-error)",
    },
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(50%, 1fr))",
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
};

@injectStyles(styles)
export default class ReleaseStatus extends React.Component {
  constructor(props) {
    super(props);
    this.tooltipId = uniqueId("release-tooltip");
  }

  render() {
    const { classes, instanceStatus, isChildren, highContrastChildren } = this.props;

    const instanceStatusClass = (instanceStatus === "NOT_RELEASED") ? "not-released"
      : (instanceStatus === "HAS_CHANGED") ? "has-changed"
        : "released";

    const hightContrast = highContrastChildren && isChildren ? "high-contrast" : "";


    return (
      <OverlayTrigger placement="top" overlay={
        <Tooltip id={this.tooltipId}>
          {isChildren ?
            <div>
              {instanceStatus === "NOT_RELEASED" ? <span>At least one of this instance children is <strong>not released</strong></span> :
                instanceStatus === "HAS_CHANGED" ? <span>At least one of this instance is <strong>different</strong> than its released version</span> :
                  <span>All of this instance children are <strong>released</strong></span>}
            </div>
            : <div>
              {instanceStatus === "NOT_RELEASED" ? <span>This instance is <strong>not released</strong>.</span> :
                instanceStatus === "HAS_CHANGED" ? <span>This instance is <strong>different</strong> than its released version</span> :
                  <span>This instance is <strong>released</strong></span>}
            </div>}
        </Tooltip>
      }>
        {!isChildren || (isChildren && instanceStatus) ?
          <div className={`${classes.status} ${instanceStatusClass} ${hightContrast} ${this.props.darkmode && !highContrastChildren ? "darkmode" : ""} `}>
            <div className={`${classes.instanceStatus}  `}>
              {instanceStatus === "NOT_RELEASED" ?
                <FontAwesomeIcon icon="unlink" />
                : instanceStatus === "HAS_CHANGED" ?
                  <FontAwesomeIcon icon="pencil-alt" />
                  : instanceStatus === "RELEASED" ?
                    <FontAwesomeIcon icon="check" />
                    :
                    <strong>?</strong>
              }
            </div>
          </div>
          : <span></span>}
      </OverlayTrigger>
    );
  }
}