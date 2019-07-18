import React from "react";
import injectStyles from "react-jss";
import { Button } from "react-bootstrap";

const styles = {
  container: {
    position: "absolute",
    top: "0",
    left: "0",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.25)",
    borderRadius: "9px",
    zIndex: "1200",
    "&[inline='false']": {
      top: "-10px",
      left: "-10px",
      width: "calc(100% + 20px)",
      height: "calc(100% + 20px)",
      borderRadius: "0"
    }
  },
  panel: {
    position: "absolute",
    top: "50%",
    left: "50%",
    minWidth: "220px",
    transform: "translate(-50%, -50%)",
    padding: "10px",
    borderRadius: "5px",
    background: "white",
    textAlign: "center",
    boxShadow: "2px 2px 4px #7f7a7a",
    "& h4": {
      margin: "0",
      paddingBottom: "10px",
      color: "red"
    },
    "& button + button, & a + button, & a + a": {
      marginLeft: "20px"
    }
  }
};

@injectStyles(styles)
export default class SaveErrorPanel extends React.Component{
  render(){
    const { classes, show, error, onCancel, onRetry, inline } = this.props;
    const handleCancel = (e) => {
      e.stopPropagation();
      onCancel(e);
    };const handleRetry = (e) => {
      e.stopPropagation();
      onRetry(e);
    };
    return(
      (show)?
        <div className={classes.container} inline={inline?"true":"false"}>
          <div className={classes.panel}>
            <h4>{error}</h4>
            <div>
              <Button bsStyle="default" onClick={handleCancel}>Cancel</Button>
              <Button bsStyle="primary" onClick={handleRetry}>Retry</Button>
            </div>
          </div>
        </div>
        :
        null
    );
  }
}