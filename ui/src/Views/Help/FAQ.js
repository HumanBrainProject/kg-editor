import React from "react";
import injectStyles from "react-jss";

const styles = {
  container:{

  }
};

@injectStyles(styles)
class HelpView extends React.Component{
  render(){
    const {classes} = this.props;
    return (
      <div className={classes.container}>
        <h1>Frequently asked questions</h1>
        <p>This section needs you.</p>
        <p>Do you have a question or a suggestion for a useful information to mention about a feature of this application? Please contact us by email at : <a href={"mailto:kg-team@humanbrainproject.eu"}>kg-team@humanbrainproject.eu</a></p>
      </div>
    );
  }
}

export default HelpView;