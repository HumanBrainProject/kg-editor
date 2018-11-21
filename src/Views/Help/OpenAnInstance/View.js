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
        <h1>View an instance</h1>
        <p>That feature is made of scrolling panels, flowing form left to right. Each panel represents a level of depth in the graph relations of the opened instance, this one being the first panel. </p>
        <p>(Screenshot)</p>

        <p>You can hover a panel to have a look at it.click on it to bring it at the center. </p>
        <p>(Screenshot)</p>

        <p>If you click on an instance in that panel will then show a following panel containing the children instances of the clicked instance (given it has some). Clicking an instance will also reveal all the values of that instance and a button in the footer allowing you to open that instance in a new tab.</p>
        <p>(Screenshot)</p>

        <p>Hovering a value of an instance that is a linked instance will highlight it in the next panel. Clicking on that value will bring the next panel in the center and automatically select that instance.</p>
        <p>(Screenshot)</p>
      </div>
    );
  }
}