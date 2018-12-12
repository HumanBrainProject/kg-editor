import React from "react";
import injectStyles from "react-jss";

const styles = {
  container:{

  }
};

@injectStyles(styles)
export default class HelpView extends React.Component{
  render(){
    const {classes} = this.props;
    return (
      <div className={classes.container}>

      </div>
    );
  }
}