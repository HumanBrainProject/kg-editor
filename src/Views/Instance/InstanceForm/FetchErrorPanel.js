import React from "react";
import injectStyles from "react-jss";
import { Button, Glyphicon } from "react-bootstrap";

const styles = {
  fetchErrorPanel: {
    position: "absolute",
    top: "50%",
    left: "50%",
    padding: "20px",
    border: "1px solid gray",
    borderRadius: "5px",
    transform: "translate(-50%, -50%)",
    textAlign: "center",
    minWidth: "220px",
    "& h4": {
      paddingBottom: "10px",
      color: "red"
    },
    "& button + button, & a + button, & a + a": {
      marginLeft: "20px"
    }
  },
  inlineFetchErrorPanel: {
    padding: "10px",
    "& h5": {
      marginTop: "0",
      color: "red"
    },
    "& small": {
      display: "block",
      paddingBottom: "6px",
      color:"grey",
      fontWeight:"400",
      fontSize:"0.8em",
      fontStyle: "italic",
      whiteSpace: "nowrap",
      "@media screen and (max-width:576px)": {
        wordBreak: "break-all",
        wordWrap: "break-word",
        whiteSpace: "normal",
      }
    },
    "& button span + span": {
      marginLeft: "4px"
    }
  }
};

@injectStyles(styles)
export default class FetchErrorPanel extends React.Component{
  handleRetry = (e) => {
    e.stopPropagation();
    this.props.onRetry(e);
  };

  render(){
    const { classes, id, show, error, inline } = this.props;
    return(
      (show)?
        (!inline)?
          <div className={classes.fetchErrorPanel}>
            <h4>{error}</h4>
            <div>
              <Button bsStyle="primary" onClick={this.handleRetry}>Retry</Button>
            </div>
          </div>
          :
          <div className={classes.inlineFetchErrorPanel}>
            <h5>{error}</h5>
            <small>Nexus ID: {id}</small>
            <div>
              <Button onClick={this.handleRetry}><Glyphicon glyph="refresh" /><span>Retry</span></Button>
            </div>
          </div>
        :
        null
    );
  }
}