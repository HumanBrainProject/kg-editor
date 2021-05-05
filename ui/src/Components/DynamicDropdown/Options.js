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

import React, { useEffect, useRef } from "react";
import Dropdown from "react-bootstrap/Dropdown";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { createUseStyles } from "react-jss";

const useStyles = createUseStyles({
  container: {
    "& :hover $preview": {
      display: "block"
    }
  },
  option: {
    position: "relative"
  },
  preview: {
    display: "none",
    position: "absolute",
    top: "50%",
    right: "-10px",
    borderRadius: "2px",
    background: "var(--bg-color-ui-contrast2)",
    color: "var(--ft-color-louder)",
    padding: "3px 6px",
    cursor: "pointer",
    transform: "translateY(-50%)"
  },
  icon: {
    paddingRight: "8px"
  }
});

const Options = ({values, current, onSelectNext, onSelectPrevious, onSelect, onCancel, onPreview}) => (
  <>
    {values.map(value =>
      <Option value={value}
        key={value.id}
        onSelectNext={onSelectNext}
        onSelectPrevious={onSelectPrevious}
        onSelect={onSelect}
        onCancel={onCancel}
        onPreview={onPreview}
        hasFocus={current === value.id}/>
    )}
  </>
);

const Option = ({ value, hasFocus, onSelectNext, onSelectPrevious, onSelect, onCancel, onPreview }) => {

  const ref = useRef();

  const classes = useStyles();

  useEffect(() => {
    if (hasFocus) {
      ref.current.focus();
    }
  });

  const handleOnSelect = () => {
    onSelect(value.id);
  };

  const handleKeyDown = e => {
    if(e) {
      switch(e.keyCode) {
      case 38: {
        e.preventDefault();
        onSelectPrevious(value.id);
        break;
      }
      case 40: {
        e.preventDefault();
        onSelectNext(value.id);
        break;
      }
      case 13: {
        e.preventDefault();
        onSelect(value.id);
        break;
      }
      case 27: {
        e.preventDefault();
        onCancel();
        break;
      }
      default:
        break;
      }
    }
  };

  const handleOnPreview = e => {
    e && e.stopPropagation();
    onPreview(value.id, value.name);
  };

  const style = value.type.color ? { color: value.type.color } : {};

  return (
    <Dropdown.Item className={classes.container} onSelect={handleOnSelect}>
      <div title={value.type.name} tabIndex={-1} className={classes.option} onKeyDown={handleKeyDown} ref={ref}>
        <span className={classes.icon} style={style}>
          <FontAwesomeIcon fixedWidth icon="circle" />
        </span>
        {value.name}
        <div className={classes.preview} title="preview" onClick={handleOnPreview}>
          <FontAwesomeIcon icon="eye" />
        </div>
      </div>
    </Dropdown.Item>
  );
};


export default Options;