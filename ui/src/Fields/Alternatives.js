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

import React, { useState, useEffect, useRef } from "react";
import { createUseStyles } from "react-jss";

import Avatar from "../Components/Avatar";
import Alternative from "./Alternative";

const useStyles = createUseStyles({
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
});

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

const Alternatives = ({ className, list, disabled, parentContainerClassName, ValueRenderer, onSelect, onRemove }) => {

  const classes = useStyles();

  const wrapperRef = useRef();
  const alternativesRef = useRef();

  const [open, setOpen] = useState(false);
  const [fixedWidth, setFixedWidth] = useState(null);

  const handleToggle = e => {
    e.preventDefault();
    setOpen(!open);
  };

  const handleSelect = (alternative, e) => {
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
      setOpen(false);
    } else if (alternative && (!e || (e && (!e.keyCode || e.keyCode === 13)))) { // enter
      e && e.preventDefault();
      typeof onSelect === "function" && onSelect(alternative.value);
      setOpen(false);
    }
  };

  const handleRemove = e => {
    e && e.preventDefault();
    typeof onRemove === "function" && onRemove();
    setOpen(false);
  };

  const handleInputKeyStrokes = e => {
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
      setOpen(false);
    }
  };

  const clickOutHandler = e => {
    if(wrapperRef.current && !wrapperRef.current.contains(e.target)){
      setOpen(false);
    }
    if (open && !fixedWidth && alternativesRef.current) {
      const width = getContainerWidth(wrapperRef.current, parentContainerClassName);
      if (width && width > wrapperRef.current.offsetLeft) {
        let maxWidth = width - wrapperRef.current.offsetLeft;
        if (alternativesRef.current.offsetWidth) {
          if (alternativesRef.current.offsetWidth > maxWidth) {
            setFixedWidth(maxWidth);
          }
        } else {
          setFixedWidth(maxWidth);
        }
      }
    }
  };

  useEffect(() => {
    window.addEventListener("mouseup", clickOutHandler, false);
    window.addEventListener("touchend", clickOutHandler, false);
    window.addEventListener("keyup", clickOutHandler, false);
    return () => {
      window.removeEventListener("mouseup", clickOutHandler, false);
      window.removeEventListener("touchend", clickOutHandler, false);
      window.removeEventListener("keyup", clickOutHandler, false);
    };
  });

  if (!list || !list.length) {
    return null;
  }


  const style = fixedWidth?{ width: fixedWidth + "px" }:{};

  return (
    <div className={`${classes.container} ${className?className:""}`} ref={wrapperRef}>
      <button className={classes.button}
        title="show alternatives"
        onKeyDown={handleInputKeyStrokes}
        onClick={handleToggle}>
        {list.map(alternative => {
          const users = (!alternative || !alternative.users)?[]:alternative.users;
          return (
            users.map(user => (
              <Avatar userId={user.id} name={user.name} key={user.id} picture={user.picture} />
            ))
          );
        })}
      </button>
      <ul className={`quickfire-dropdown dropdown-menu ${classes.dropdown} ${open?"open":""}`} style={style} ref={alternativesRef} >
        {list.map(alternative => {
          const key = (!alternative || !alternative.users)?"":alternative.users.reduce((acc, user) => {
            acc += user.id;
            return acc;
          }, "");
          return (
            <Alternative key={key} alternative={alternative} ValueRenderer={ValueRenderer} onRemove={handleRemove} onSelect={handleSelect} className={fixedWidth?classes.fixedWidthDropdownItem:null} />
          );
        })}
      </ul>
    </div>
  );
};

export default Alternatives;