import React from "react";
import injectStyles from "react-jss";
import { Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import HeaderPanel from "./HeaderPanel";

const styles = {
  fetchErrorPanel: {
    position: "absolute !important",
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
  },
  retryIcon: {
    marginRight: "4px"
  }
};

@injectStyles(styles)
class FetchErrorPanel extends React.Component{
  handleRetry = (e) => {
    e.stopPropagation();
    this.props.onRetry(e);
  };

  render(){
    const { classes, id, show, error, inline } = this.props;
    if (!show) {
      return null;
    }
    return(
      (!inline)?
        <div className={classes.fetchErrorPanel}>
          <h4>{error}</h4>
          <div>
            <Button bsStyle="primary" onClick={this.handleRetry}>Retry</Button>
          </div>
        </div>
        :
        <div className={classes.inlineFetchErrorPanel}>
          <HeaderPanel className={classes.panelHeader} />
          <h5>{error}</h5>
          <small>ID: {id}</small>
          <div>
            <Button onClick={this.handleRetry}><FontAwesomeIcon className={classes.retryIcon} icon="sync-alt" /><span>Retry</span></Button>
          </div>
        </div>
    );
  }
}

export default FetchErrorPanel;