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
        <h1>Create an instance</h1>
        <p>You have three different ways of creating a new instance.</p>

        <h2>From the main application navigation</h2>
        <p>From the dashboard, you can use the “New instance” quick access to create a new instance. Choose the type of instance you want to create in the window shown after clicking on this button.</p>
        <p>
          <img className={"screenshot"} src={`${window.rootPath}/assets/Help/CreateAnInstance/new-instance-button.png`}/>
        </p>

        <h2>From the “Browse” screen</h2>
        <p>In the browse/search feature, you can create a new instance by hovering a node type on the left panel and clicking on the corresponding “Plus” button.</p>
        <p>
          <img className={"screenshot"} src={`${window.rootPath}/assets/Help/CreateAnInstance/create-instance.png`}/>
        </p>

        <h2>From the instance edit mode</h2>
        <p>Please see the “Edit” section to know more about creating instances from this mode.</p>
      </div>
    );
  }
}

export default HelpView;