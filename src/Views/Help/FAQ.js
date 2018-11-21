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
        <h1>Frequently asked questions</h1>
        <p>This section needs you.</p>
        <p>You have a question or a suggestion for a useful information to mention about a feature of this application? Please contact us by email at : kg-team@humanbrainproject.eu</p>
      </div>
    );
  }
}