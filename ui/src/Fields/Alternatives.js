/*
 * Copyright 2018 - 2021 Swiss Federal Institute of Technology Lausanne (EPFL)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * This open source software code was developed in part or in whole in the
 * Human Brain Project, funded from the European Union's Horizon 2020
 * Framework Programme for Research and Innovation under
 * Specific Grant Agreements No. 720270, No. 785907, and No. 945539
 * (Human Brain Project SGA1, SGA2 and SGA3).
 *
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

const Alternatives = ({ className, list, disabled, parentContainerRef, ValueRenderer, onSelect, onRemove }) => {

  const classes = useStyles();

  const wrapperRef = useRef();
  const alternativesRef = useRef();

  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(null);

  const handleToggle = e => {
    e.preventDefault();
    setOpen(!open);
  };

  const close = () => {
    setCurrent(null);
    setOpen(false);
  };

  const handleSelect = value => {
    typeof onSelect === "function" && onSelect(value);
    close();
  };

  const handleSelectPrevious = value => {
    if (!list.length) {
      setCurrent(null);
      return;
    }
    const index = list.findIndex(alternative => alternative.value === value);
    if (index === -1) {
      const alternative = list[0] ;
      setCurrent(alternative.value);
    } else if (index > 0){
      const alternative = list[index - 1] ;
      setCurrent(alternative.value);
    } else {
      const alternative = list[list.length-1];
      setCurrent(alternative.value);
    }
  };

  const handleSelectNext = value => {
    if (!list.length) {
      setCurrent(null);
      return;
    }
    const index = list.findIndex(alternative => alternative.value === value);
    if (index === -1) {
      const alternative = list[0] ;
      setCurrent(alternative.value);
    } else if (index < list.length -1){
      const alternative = list[index + 1] ;
      setCurrent(alternative.value);
    } else {
      const alternative = list[0];
      setCurrent(alternative.value);
    }
  };

  const handleCancel = () => {
    close();
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
      handleSelectNext(current);
    } else if(e && e.keyCode === 38){ // Up
      e && e.preventDefault();
      handleSelectPrevious(current);
    } else if(e && e.keyCode === 27) { //escape
      e && e.preventDefault();
      close();
    } else if (e.keyCode === 13) { // enter
      e && e.preventDefault();
      if (open) {
        if (current) {
          typeof onSelect === "function" && onSelect(current);
        }
        close();
      } else {
        setOpen(true);
      }
    }
  };

  const clickOutHandler = e => {
    if(!open && wrapperRef.current && wrapperRef.current.contains(e.target)){
      if (alternativesRef.current) {
        const containerWidth = parentContainerRef.current.offsetWidth;
        if (containerWidth && containerWidth > wrapperRef.current.offsetLeft) {
          const width = containerWidth - wrapperRef.current.offsetLeft;
          alternativesRef.current.style.width = width + "px";
        }
      }
    } else {
      setOpen(false);
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!list || !list.length) {
    return null;
  }

  const renderUsers = () => {
    return list.map(alternative => (
      alternative.users.map(user => (
        <Avatar userId={user.id} name={user.name} key={user.id} picture={user.picture} />
      ))
    ));
  };

  const renderAlternative = () => {
    return list.map(alternative => {
      const key = alternative.users.map(user => user.id).join(";");
      return (
        <Alternative
          key={key}
          alternative={alternative}
          hasFocus={alternative.value === current}
          ValueRenderer={ValueRenderer}
          onRemove={handleRemove}
          onSelect={handleSelect}
          onSelectNext={handleSelectNext}
          onSelectPrevious={handleSelectPrevious}
          onCancel={handleCancel}
          className={classes.fixedWidthDropdownItem} />
      );
    });
  };

  return (
    <div className={`${classes.container} ${className?className:""}`} ref={wrapperRef}>
      <button className={classes.button}
        title="show alternatives"
        onKeyDown={handleInputKeyStrokes}
        onClick={handleToggle}>
        {renderUsers()}
      </button>
      <ul className={`dropdown-menu ${classes.dropdown} ${open?"open":""}`} ref={alternativesRef} >
        {renderAlternative()}
      </ul>
    </div>
  );
};

export default Alternatives;