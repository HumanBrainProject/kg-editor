import React from "react";
import injectStyles from "react-jss";

import Avatar from "./Alternatives/Avatar";
import Alternative from "./Alternatives/Alternative";

const styles = {
  container: {
    display: "inline-block",
    position: "relative"
  },
  button: {
    background: "none",
    borderRadius: "20px",
    "&:not(:hover), &:disabled, &:hover:disabled": {
      borderColor: "transparent",
    },
    "& .avatar + .avatar": {
      marginLeft: "5px"
    }
  },
  dropdown: {
    maxHeight:"33vh",
    overflowY:"auto",
    "&.open":{
      display:"block"
    }
  }
};

@injectStyles(styles)
export default class Alternatives extends React.Component {
  constructor (props) {
    super(props);
    this.state = { open: false };
  }

  handleToggle = e => {
    e.preventDefault();
    if (!this.props.disabled) {
      this.setState(state => state.open = !state.open);
    }
  }

  handleSelect = (alternative, e) => {
    const { disabled, onSelect } = this.props;
    if (disabled) {
      return;
    }
    if(e && e.keyCode === 40){ // Down
      e && e.preventDefault();
      const alternatives = this.alternativesRef.querySelectorAll(".option");
      let index = Array.prototype.indexOf.call(alternatives, e.target) + 1;
      if (index >= alternatives.length) {
        index = 0;
      }
      alternatives[index].focus();
    } else if(e && e.keyCode === 38){ // Up
      e && e.preventDefault();
      const alternatives = this.alternativesRef.querySelectorAll(".option");
      let index = Array.prototype.indexOf.call(alternatives, e.target) - 1;
      if (index < 0) {
        index = alternatives.length - 1;
      }
      alternatives[index].focus();
    } else if(e && e.keyCode === 27) { //escape
      e && e.preventDefault();
      this.setState(state => state.open = false);
    } else if (alternative && (!e || (e && (!e.keyCode || e.keyCode === 13)))) { // enter
      e && e.preventDefault();
      typeof onSelect === "function" && onSelect(alternative.value);
      this.setState(state => state.open = false);
    }
  }

  handleInputKeyStrokes = e => {
    const { disabled } = this.props;
    if (disabled) {
      return;
    }
    if(e && e.keyCode === 40){ // Down
      e && e.preventDefault();
      const alternatives = this.alternativesRef.querySelectorAll(".option");
      let index = Array.prototype.indexOf.call(alternatives, e.target) + 1;
      if (index >= alternatives.length) {
        index = 0;
      }
      alternatives[index].focus();
    } else if(e && e.keyCode === 38){ // Up
      e && e.preventDefault();
      const alternatives = this.alternativesRef.querySelectorAll(".option");
      let index = Array.prototype.indexOf.call(alternatives, e.target) - 1;
      if (index < 0) {
        index = alternatives.length - 1;
      }
      alternatives[index].focus();
    } else if(e && e.keyCode === 27) { //escape
      e && e.preventDefault();
      this.setState(state => state.open = false);
    }
  }

  clickOutHandler = e => {
    if(!this.wrapperRef || !this.wrapperRef.contains(e.target)){
      this.setState(state => state.open = false);
    }
  };

  listenClickOutHandler(){
    window.addEventListener("mouseup", this.clickOutHandler, false);
    window.addEventListener("touchend", this.clickOutHandler, false);
    window.addEventListener("keyup", this.clickOutHandler, false);
  }

  unlistenClickOutHandler(){
    window.removeEventListener("mouseup", this.clickOutHandler, false);
    window.removeEventListener("touchend", this.clickOutHandler, false);
    window.removeEventListener("keyup", this.clickOutHandler, false);
  }

  componentDidMount() {
    this.listenClickOutHandler();
  }

  componentWillUnmount(){
    this.unlistenClickOutHandler();
  }

  render() {
    const {classes, className, show, disabled, list, field} = this.props;

    if (!show || !list || !list.length) {
      return null;
    }

    return (
      <div className={`${classes.container} ${className?className:""}`} ref={ref=>this.wrapperRef=ref}>
        <button className={classes.button}
          title="show alternatives"
          disabled={disabled}
          onKeyDown={this.handleInputKeyStrokes}
          onClick={this.handleToggle}>
          {list.map(alternative => {
            const userIds = (!alternative || !alternative.userIds)?[]:(typeof alternative.userIds === "string")?[alternative.userIds]:alternative.userIds;
            return (
              userIds.map(userId => (
                <Avatar key={userId} userId={userId} />
              ))
            );
          })}
        </button>
        <ul className={`quickfire-dropdown dropdown-menu ${classes.dropdown} ${this.state.open?"open":""}`} ref={ref=>{this.alternativesRef = ref;}}>
          {list.map(alternative => (
            <Alternative key={alternative.value} alternative={alternative} field={field} onSelect={this.handleSelect}/>
          ))}
        </ul>
      </div>
    );
  }
}