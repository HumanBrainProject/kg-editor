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
        <h1>Statistics</h1>

        <p>The stats feature of the application offer an easy access to the KG Statistics application. This application shows the current stats of the database at a structure level.</p>
        <p>(Screenshot)</p>
      </div>
    );
  }
}