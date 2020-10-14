/*
*   Copyright (c) 2020, EPFL/Human Brain Project PCO
*
*   Licensed under the Apache License, Version 2.0 (the "License");
*   you may not use this file except in compliance with the License.
*   You may obtain a copy of the License at
*
*       http://www.apache.org/licenses/LICENSE-2.0
*
*   Unless required by applicable law or agreed to in writing, software
*   distributed under the License is distributed on an "AS IS" BASIS,
*   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*   See the License for the specific language governing permissions and
*   limitations under the License.
*/

import React from "react";
import injectStyles from "react-jss";

import Avatar from "../Components/Avatar";
import Alternative from "./Alternative";

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
  },
  fixedWidthDropdownItem: {
    wordWBreak: "normal",
    whiteSpace: "normal"
  }
};

const getContainerWidth = (node, className) => {
  if (node && className) {
    while (node !== document.body && node.className && !node.className.includes(className)) {
      node = node.parentNode;
    }
    if (node) {
      return node.offsetWidth;
    }
  }
  return null;
};

@injectStyles(styles)
class Alternatives extends React.Component {
  constructor (props) {
    super(props);
    this.state = { open: false, maxWidth:  null};
  }

  handleToggle = e => {
    e.preventDefault();
    if (!this.props.disabled) {
      this.setState(state => ({ open: !state.open }));
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
      this.setState({ open: false });
    } else if (alternative && (!e || (e && (!e.keyCode || e.keyCode === 13)))) { // enter
      e && e.preventDefault();
      typeof onSelect === "function" && onSelect(alternative.value);
      this.setState({ open: false });
    }
  }

  handleRemove = e => {
    const { onRemove } = this.props;
    e && e.preventDefault();
    typeof onRemove === "function" && onRemove();
    this.setState({ open: false });
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
      this.setState({ open: false });
    }
  }

  clickOutHandler = e => {
    if(!this.wrapperRef || !this.wrapperRef.contains(e.target)){
      this.setState({ open: false });
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

  componentDidUpdate() {
    const { parentContainerClassName } = this.props;

    if (this.state.open && !this.state.fixedWidth && this.wrapperRef) {
      const width = getContainerWidth(this.wrapperRef, parentContainerClassName);
      if (width && width > this.wrapperRef.offsetLeft) {
        let maxWidth = width - this.wrapperRef.offsetLeft;
        if (this.alternativesRef && this.alternativesRef.offsetWidth) {
          if (this.alternativesRef.offsetWidth > maxWidth) {
            this.setState({fixedWidth: maxWidth});
          }
        } else {
          this.setState({fixedWidth: maxWidth});
        }
      }
    }
  }

  render() {
    const {classes, className, show, disabled, list, ValueRenderer } = this.props;

    if (!show || !list || !list.length) {
      return null;
    }

    const style = this.state.fixedWidth?
      {
        width: this.state.fixedWidth + "px"
      }
      :{};

    return (
      <div className={`${classes.container} ${className?className:""}`} ref={ref=>this.wrapperRef=ref}>
        <button className={classes.button}
          title="show alternatives"
          disabled={disabled}
          onKeyDown={this.handleInputKeyStrokes}
          onClick={this.handleToggle}>
          {list.map(alternative => {
            const users = (!alternative || !alternative.users)?[]:alternative.users;
            return (
              users.map(user => (
                <Avatar userId={user.id} name={user.name} key={user.id} />
              ))
            );
          })}
        </button>
        <ul className={`quickfire-dropdown dropdown-menu ${classes.dropdown} ${this.state.open?"open":""}`} style={style} ref={ref=>{this.alternativesRef = ref;}}>
          {list.map(alternative => {
            const key = (!alternative || !alternative.users)?"":alternative.users.reduce((acc, user) => {
              acc += user.id;
              return acc;
            }, "");
            return (
              <Alternative key={key} alternative={alternative} ValueRenderer={ValueRenderer} onRemove={this.handleRemove} onSelect={this.handleSelect} className={this.state.fixedWidth?classes.fixedWidthDropdownItem:null} />
            );
          })}
        </ul>
      </div>
    );
  }
}

export default Alternatives;