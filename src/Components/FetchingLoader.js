import React from "react";
import injectStyles from "react-jss";

const generateRandomName = () => [...`${new Date().getTime()}`].reduce((r, c) => r + String.fromCharCode(65 + Number(c)), "");
const animationId = generateRandomName();

const styles = {
  fetchingPanel: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    fontSize: "18px",
    fontWeight: "lighter",
    minWidth: "220px"
  },
  fetchingGlyphicon: {
    composes: "glyphicon glyphicon-refresh",
    animation: `${animationId} .9s infinite linear`,
    transformOrigin: "50% 44%"
  },
  [`@keyframes ${animationId}`]: {
    "from": {
      transform: "scale(1) rotate(0deg)"
    },
    "to": {
      transform: "scale(1) rotate(360deg)"
    }
  },
  fetchingLabel: {
    paddingLeft: "6px"
  }
};

@injectStyles(styles)
export default class FetchingLoader extends React.Component{
  render(){
    const { classes } = this.props;

    return (
      <div className={classes.fetchingPanel}>
        <span className={classes.fetchingGlyphicon}></span>
        <span className={classes.fetchingLabel}>
          {this.props.children}
        </span>
      </div>
    );
  }
}