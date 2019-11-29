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
        <h1>Introduction</h1>
        <p>Welcome to the Knowledge Graph Editor, the tool of choice for browsing, editing, reviewing, exploring and releasing the Knowledge Graph data.</p>
        <p>In this section you can find a lot of information about this application features.</p>
      </div>
    );
  }
}

export default HelpView;