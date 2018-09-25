import React from "react";
import injectStyles from "react-jss";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {Button} from "react-bootstrap";
import searchStore from "../../Stores/SearchStore";

const styles = {
  container:{
    position:"absolute",
    top:"50%",
    left:"50%",
    transform:"translate(-50%,-200px)",
    textAlign:"center"
  },
  icon:{
    fontSize:"10em",
    "& path":{
      fill:"rgba(0, 0, 0, 0.2)",
      stroke:"rgba(200,200,200,.1)",
      strokeWidth:"3px"
    }
  },
  text:{
    fontWeight:"300",
    fontSize:"1.2em"
  }
};

@injectStyles(styles)
export default class NoResults extends React.Component{
  handleRetry = () => {
    searchStore.fetchInstances();
  }

  render(){
    const { classes } = this.props;
    return(
      <div className={classes.container}>
        <div className={classes.icon}>
          <FontAwesomeIcon icon={"ban"}/>
        </div>
        <div className={classes.text}>
          There was a network problem retrieving the list of instances.<br/>
          If the problem persists, please contact the support.<br/><br/>
          <Button bsStyle={"primary"} onClick={this.handleRetry}>
            <FontAwesomeIcon icon={"redo-alt"}/> &nbsp; Retry
          </Button>
        </div>
      </div>
    );
  }
}