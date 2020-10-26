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

import React, { useEffect, useRef } from "react";
import Dropdown from "react-bootstrap/Dropdown";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { createUseStyles } from "react-jss";

const useStyles = createUseStyles({
  container: {
    "& .option": {
      position: "relative"
    }
  }
});


const NewValues = ({types, currentType, value, onSelectNext, onSelectPrevious, onSelect, onCancel}) => (
  <React.Fragment>
    {types.map(type => <NewValue type={type} key={type.name} value={value} onSelectNext={onSelectNext} onSelectPrevious={onSelectPrevious} onSelect={onSelect} onCancel={onCancel} hasFocus={currentType === type.name} />)}
  </React.Fragment>
);

const NewValue = ({ type, value, hasFocus, onSelectNext, onSelectPrevious, onSelect, onCancel }) => {

  const classes = useStyles();

  const ref = useRef();

  useEffect(() => {
    if (hasFocus) {
      ref.current.focus();
    }
  });

  const handleOnSelect = () => {
    onSelect(type.name);
  };

  const handleKeyDown = e => {
    if(e) {
      switch(e.keyCode) {
      case 38: {
        e.preventDefault();
        onSelectPrevious(type.name);
        break;
      }
      case 40: {
        e.preventDefault();
        onSelectNext(type.name);
        break;
      }
      case 13: {
        e.preventDefault();
        onSelect(type.name);
        break;
      }
      case 27: {
        e.preventDefault();
        onCancel();
        break;
      }
      }
    }
  };

  const style = type.color ? { color: type.color } : {};

  return (
    <Dropdown.Item className={`quickfire-dropdown-item ${classes.container}`} key={type.name} onSelect={handleOnSelect}>
      <div tabIndex={-1} className="option" onKeyDown={handleKeyDown} ref={ref}>
        <em>Add a new <span style={style}>
          <FontAwesomeIcon fixedWidth icon="circle" />
        </span>
        {type.label} </em> : <strong>{value}</strong>
      </div>
    </Dropdown.Item>
  );
};

export default NewValues;