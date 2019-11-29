import React from "react";
import injectStyles from "react-jss";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

const styles = {
  container:{
    position:"absolute !important",
    top:"50%",
    left:"50%",
    transform:"translate(-50%,-200px)",
    textAlign:"center"
  },
  icon:{
    fontSize:"10em",
    "& path":{
      fill:"var(--bg-color-blend-contrast1)",
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
class BGMessage extends React.Component{
  render(){
    const { classes } = this.props;
    return(
      <div className={classes.container}>
        <div className={classes.icon}>
          <FontAwesomeIcon icon={this.props.icon} transform={this.props.transform}/>
        </div>
        <div className={classes.text}>
          {this.props.children}
        </div>
      </div>
    );
  }
}

export default BGMessage;