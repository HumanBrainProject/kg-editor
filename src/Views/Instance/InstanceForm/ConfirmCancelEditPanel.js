import React from "react";
import injectStyles from "react-jss";
import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";

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
      color: "#333"
    },
    "& button, & a.btn": {
      minWidth: "80px"
    },
    "& button + button, & a + button, & a + a": {
      marginLeft: "20px"
    }
  },
};

@injectStyles(styles)
export default class ConfirmCancelEditPanel extends React.Component{
  render(){
    const { classes, show, text, onConfirm, onCancel, onConfirmBackLink, useConfirmBackLink, inline} = this.props;
    const handleConfirm = (e) => {
      e.stopPropagation();
      onConfirm(e);
    };
    const handleCancel = (e) => {
      e.stopPropagation();
      onCancel(e);
    };
    return(
      (show)?
        <div className={classes.container} inline={inline?"true":"false"}>
          <div className={classes.panel}>
            <h4>{text}</h4>
            <div>
              {useConfirmBackLink?
                <Link to={onConfirmBackLink} className="btn btn-default">Yes</Link>
                :
                <Button bsStyle="default" onClick={handleConfirm}>Yes</Button>
              }
              <Button bsStyle="danger" onClick={handleCancel}>No</Button>
            </div>
          </div>
        </div>
        :
        null
    );
  }
}