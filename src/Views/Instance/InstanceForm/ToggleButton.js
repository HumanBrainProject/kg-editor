import React from "react";
import injectStyles from "react-jss";
import { Button, Glyphicon } from "react-bootstrap";

const styles = {
  container: {
    width: "40px",
    height: "34px",
    perspective: "600px"
  },
  panel: {
    position: "relative",
    height: "100%",
    width: "100%",
    transition: "transform 1s",
    transformStyle: "preserve-3d",
    "&.isOn": {
      transform: "rotateY(180deg)"
    }
  },
  button: {
    position: "absolute",
    height: "100%",
    width: "100%",
    backfaceVisibility: "hidden"
  },
  on: {

  },
  off: {
    transform: "rotateY(180deg)"
  }
};

@injectStyles(styles)
export default class ToggleButton extends React.Component{
  render(){
    const { classes, isOn, onToggle, offToggle, onGlyph, offGlyph, onTitle, offTitle } = this.props;

    const handleOnToggle = (e) => {
      e.stopPropagation();
      onToggle(e);
    };

    const handleOffToggle = (e) => {
      e.stopPropagation();
      offToggle(e);
    };

    return(
      <div className={classes.container}>
        <div className={classes.panel + (isOn?" isOn":"")}>
          <div className={classes.button + " " + classes.on}>
            <Button onClick={handleOnToggle} bsStyle="default" title={onTitle}><Glyphicon glyph={onGlyph} onClick={handleOnToggle} title={onTitle} /></Button>
          </div>
          <div className={classes.button + " " + classes.off}>
            <Button onClick={handleOffToggle} bsStyle="default" title={offTitle}><Glyphicon glyph={offGlyph} onClick={handleOffToggle} title={offTitle} /></Button>
          </div>
        </div>
      </div>
    );
  }
}