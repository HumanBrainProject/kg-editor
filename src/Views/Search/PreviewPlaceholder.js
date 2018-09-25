import React from "react";
import injectStyles from "react-jss";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

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
export default class PreviewPlaceholder extends React.Component{
  render(){
    const { classes } = this.props;
    return(
      <div className={classes.container}>
        <div className={classes.icon}>
          <FontAwesomeIcon icon={"money-check"}/>
        </div>
        <div className={classes.text}>
          Select an instance to display its preview here.
        </div>
      </div>
    );
  }
}