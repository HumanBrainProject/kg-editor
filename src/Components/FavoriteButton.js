import React from "react";
import injectStyles from "react-jss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { SingleField } from "hbp-quickfire";

const styles = {
  container: {
    position: "relative"
  },
  button: {
    position: "relative",
    margin: 0,
    padding: 0,
    border: 0,
    background: "none",
    textAlign:"center",
    lineHeight:"normal",
    opacity:1,
    outline: "none",
    "& .icon": {
      color: "transparent",
      stroke: "var(--favorite-off-color)",
      strokeWidth: "4em",
      fontSize:"1em",
      verticalAlign:"baseline"
    },
    "&.is-favorite .icon": {
      color: "var(--favorite-on-color)",
      strokeWidth: 0
    },
    "&:hover .icon, &:active .icon": {
      color: "var(--favorite-off-color-highlight)",
      strokeWidth: 0
    },
    "&.is-favorite:hover .icon, .is-favorite:active .icon": {
      color: "var(--favorite-on-color-highlight)",
      strokeWidth: 0
    }
  },
  popOver: {
    position: "absolute",
    marginTop: "5px",
    background: "var(--list-bg-hover)",
    border: "1px solid var(--list-border-hover)",
    //background: "linear-gradient(var(--bg-gradient-angle), var(--bg-gradient-start), var(--bg-gradient-end))",
    //backgroundSize: "200%",
    padding: "15px 15px 0 15px",
    borderRadius: "3px",
    zIndex: 100
  },
  popOverCloseButton: {
    position: "absolute",
    top: "5px",
    right: "5px",
    backgroundColor: "transparent",
    border: "transparent"
  },
  popOverArrow: {
    position: "absolute",
    top: "-7px",
    left: "1px",
    width: 0,
    height: 0,
    border: "0 solid transparent",
    borderRightWidth: "6px",
    borderLeftWidth: "6px",
    borderBottom: "6px solid var(--list-border-hover)" //--bg-color-ui-contrast1
  }
};

@injectStyles(styles)
export default class FavoriteButton extends React.Component {
  constructor(props){
    super(props);
    this.state = {showPopOver: false};
    this.timer = null;
    this.handleIconClick = this.handleIconClick.bind(this);
    this.handlePopOverClose = this.handlePopOverClose.bind(this);
    this.handlePopOverOver = this.handlePopOverOver.bind(this);
    this.handlePopOverLeave = this.handlePopOverLeave.bind(this);
    this.handleValueChange = this.handleValueChange.bind(this);
    this.handleNew = this.handleNew.bind(this);
  }

  handleIconClick(event) {
    event && event.stopPropagation();
    this.setState(state => ({showPopOver: !state.showPopOver }));
  }

  handlePopOverOver() {
    if (this.state.showPopOver) {
      clearTimeout(this.timer);
    }
  }

  handlePopOverLeave() {
    if (this.state.showPopOver) {
      clearTimeout(this.timer);
      this.timer = setTimeout(() => this.handlePopOverClose(), 500);
    }
  }

  handlePopOverClose(event) {
    event && event.stopPropagation();
    this.setState({showPopOver: false});
    typeof this.props.onSave === "function" && this.props.onSave();
  }

  handleValueChange(event, field) {
    const favorites = field.value.map(favorite => favorite.id);
    typeof this.props.onChange === "function" && this.props.onChange(favorites);
  }

  handleNew(name) { // , field, store) {
    typeof this.props.onNew === "function" && this.props.onNew(name);
  }

  render() {
    const {classes, className, values, list} = this.props;
    const isFavorite = values && values.length;
    return (
      <div className={`${classes.container} ${className?className:""}`} onMouseLeave={this.handlePopOverLeave} onMouseOver={this.handlePopOverOver}>
        <button className={`${classes.button} ${isFavorite? "is-favorite": ""}`} onClick={this.handleIconClick}>
          <FontAwesomeIcon icon="star" className="icon" />
        </button>
        {this.state.showPopOver && (
          <div className={classes.popOver} onMouseLeave={this.handlePopOverLeave} onMouseOver={this.handlePopOverOver} onClick={event => event.stopPropagation()}>
            <SingleField type="DropdownSelect" label="Favorites:" value={values} options={list} mappingValue="id" mappingLabel="name" allowCustomValues={true} onChange={this.handleValueChange} onAddCustomValue={this.handleNew} />
            <button className={classes.popOverCloseButton} onClick={this.handlePopOverClose}><FontAwesomeIcon icon="times"></FontAwesomeIcon></button>
            <div className={classes.popOverArrow} />
          </div>
        )}
      </div>
    );
  }
}