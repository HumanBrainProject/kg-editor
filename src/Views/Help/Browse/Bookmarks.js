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
        <h1>Bookmark lists</h1>
        <p>The KG Editor app lets you create your own bookmark lists of instances to access and monitor easily specific instances.</p>

        <h2>Associate an instance to bookmark lists</h2>
        <p>In the instances list of a given node type, a star icon appears on every item, letting you know if you have this instance bookmarked or not.</p>
        <p>(Screenshot)</p>

        <p>Clicking on this icon will bring a tooltip with a user input allowing you to add/remove the instance to/from a bookmark list, or create a new list.</p>
        <p>(Screenshot)</p>
      </div>
    );
  }
}