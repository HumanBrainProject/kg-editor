import React from "react";
import injectStyles from "react-jss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const styles = {
  fetchingPanel: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    fontSize: "1.2em",
    fontWeight: "lighter",
    width:"100%",
    textAlign:"center"
  },
  fetchingLabel: {
    paddingLeft: "6px",
    display:"inline-block"
  }
};

@injectStyles(styles)
export default class FetchingLoader extends React.Component{
  render(){
    const { classes } = this.props;

    return (
      <div className={classes.fetchingPanel}>
        <FontAwesomeIcon icon="circle-notch" spin/>
        <span className={classes.fetchingLabel}>
          {this.props.children}
        </span>
      </div>
    );
  }
}