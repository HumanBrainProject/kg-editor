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
        <h1>Explore the graph from an instance</h1>
        <p>The “Explore” view of an opened instance allows you to visualise in a graphical way all the instances linked to the opened instance. For the moment, the view shows 2 levels of depth of outgoing links, and 1 level below of incoming links to the opened instance.</p>

        <h2>Visualise</h2>
        <p>The view is made out of two panels. The left one offers the actual visualisation, and the right one shows the list of all the node types that you can currently see, that you can expand to see a list of all the instances of a type.</p>
        <p>(Screenshot)</p>

        <p>By default, all the instances of a same node type are regrouped, for ease of readability. You can visually differentiate different types of nodes. Circles are individual instances, squares are groups of instances of the same node type, and the big circle with a dashed border is the current opened instance. </p>
        <p>Clicking on a group (square) node will ungroup it, and thus show all the individual instances of this group. </p>
        <p>Clicking on an individual instance node, or its corresponding item in the lists on the right panel, will open this instance in a new tab, in “Explore” mode.</p>
        <p>(Screenshot)</p>

        <p>You can hover a node to highlight it and its direct links and linked nodes. You can differentiate two types of links, outgoing (green) and incoming (orange), with the arrows indicating the direction as well.</p>
        <h2>Configure</h2>

        <p>You can use the right panel toggles to group, ungroup or hide a node type. </p>
        <p>On the left panel, you can drag around all the nodes, and zoom in/out, to adjust the view to your needs.</p>
        <p>(Screenshot)</p>

        <h2>Capture</h2>
        <p>The capture button will export and download the current view.</p>

        <p>(Screenshot)</p>
      </div>
    );
  }
}