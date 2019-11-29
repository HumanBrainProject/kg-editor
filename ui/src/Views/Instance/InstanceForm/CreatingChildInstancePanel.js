import React from "react";
import injectStyles from "react-jss";
import FetchingLoader from "../../../Components/FetchingLoader";

let styles = {
  container:{
    background:"rgba(255,255,255,0.75)",
    position:"absolute",
    top:0,
    left:0,
    width:"100%",
    height:"100%",
    zIndex:1001
  }
};

@injectStyles(styles)
class CreatingChildInstancePanel extends React.Component{
  render(){
    const {classes} = this.props;
    return(
      this.props.show?
        <div className={classes.container}>
          <FetchingLoader>Creating a new instance...</FetchingLoader>
        </div>
        :null
    );
  }
}

export default CreatingChildInstancePanel;