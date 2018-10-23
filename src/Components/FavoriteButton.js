import React from "react";
import injectStyles from "react-jss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const styles = {
  container: {
    textAlign:"center",
    opacity:1,
    lineHeight:"normal",
    "& button": {
      position: "relative",
      background: "none",
      padding: 0,
      margin: 0,
      border: 0,
      outline: "none"
    },
    "& button .icon": {
      color: "transparent",
      stroke: "var(--favorite-off-color)",
      strokeWidth: "4em",
      fontSize:"1em",
      verticalAlign:"baseline"
    },
    "&.is-favorite button .icon": {
      color: "var(--favorite-on-color)",
      strokeWidth: 0
    },
    "& button:hover .icon, & button:active .icon": {
      color: "var(--favorite-off-color-highlight)",
      strokeWidth: 0
    },
    "&.is-favorite button:hover .icon, .is-favorite button:active .icon": {
      color: "var(--favorite-on-color-highlight)",
      strokeWidth: 0
    }
  }
};

@injectStyles(styles)
export default class FavoriteButton extends React.Component{
  render(){
    const {classes, isFavorite, onClick} = this.props;
    return(
      <div className={`${classes.container} ${isFavorite? "is-favorite": ""}`}>
        <button onClick={onClick}>
          <FontAwesomeIcon icon="star" className="icon" />
        </button>
      </div>
    );
  }
}