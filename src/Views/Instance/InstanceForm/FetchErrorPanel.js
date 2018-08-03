import React from "react";
import injectStyles from "react-jss";
import { Button, Glyphicon } from "react-bootstrap";
import { Link } from "react-router-dom";

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
  render(){
    const { classes, id, show, error, onCancelBackLink, onRetry, inline } = this.props;
    const handleClick = (e) => {
      e.stopPropagation();
      onRetry(e);
    };
    return(
      (show)?
        (!inline)?
          <div className={classes.fetchErrorPanel}>
            <h4>{error}</h4>
            <div>
              {onCancelBackLink?<Link to={onCancelBackLink} className="btn btn-default">Cancel</Link>:null}
              <Button bsStyle="primary" onClick={this.fetchInstance}>Retry</Button>
            </div>
          </div>
          :
          <div className={classes.inlineFetchErrorPanel}>
            <h5>{error}</h5>
            <small>Nexus ID: {id}</small>
            <div>
              <Button onClick={handleClick}><Glyphicon glyph="refresh" /><span>Retry</span></Button>
            </div>
          </div>
        :
        null
    );
  }
}