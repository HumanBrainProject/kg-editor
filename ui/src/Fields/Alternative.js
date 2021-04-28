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

import React, { useRef, useEffect } from "react";
import { createUseStyles } from "react-jss";
import Dropdown from "react-bootstrap/Dropdown";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { useStores } from "../Hooks/UseStores";

import User from "../Components/User";

const useStyles = createUseStyles({
  container: {
    "& .option em .user + .user:before": {
      content: "'; '"
    },
    "& .option": {
      position: "relative",
      paddingLeft: "3px",
    },
    "& .option .parenthesis": {
      display: "inline-block",
      transform: "scaleY(1.4)"
    },
    "& .selected": {
      position: "absolute",
      top: "50%",
      left: "-15px",
      transform: "translateY(-50%)"
    }
  },
  nullValue:{
    color: "grey",
    fontStyle: "italic"
  },
  removeIcon: {
    marginLeft: "3%"
  }
});

const Alternative = ({ alternative, ValueRenderer, className, hasFocus, onSelect, onSelectPrevious, onSelectNext, onCancel, onRemove }) => {

  const { authStore } = useStores();

  const classes = useStyles();

  const ref = useRef();

  useEffect(() => {
    if (hasFocus) {
      ref.current.focus();
    }
  });

  const handleSelect = e => {
    typeof onSelect === "function" && onSelect(alternative.value, e);
  };

  const handleKeyDown = e => {
    if(e) {
      switch(e.keyCode) {
      case 38: {
        e.preventDefault();
        onSelectPrevious(alternative.value);
        break;
      }
      case 40: {
        e.preventDefault();
        onSelectNext(alternative.value);
        break;
      }
      case 13: {
        e.preventDefault();
        onSelect(alternative.value);
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

  const handleRemoveClick = e => {
    e.stopPropagation();
    typeof onRemove === "function" && onRemove(e);
  };

  const users = (!alternative || !alternative.users)?[]:alternative.users;
  const isOwnAlternative = users.find(user => authStore.user.id === user.id);
  return (
    <Dropdown.Item className={classes.container} onSelect={handleSelect}>
      <div tabIndex={-1} className={`option ${className?className:""}`} onKeyDown={handleKeyDown} ref={ref} >
        {alternative.value != null ? <strong>
          <ValueRenderer alternative={alternative} />
        </strong> : <span className={classes.nullValue}>no value</span>} <em><div className="parenthesis">(</div>{
          users.map(user => (
            <User userId={user.id} name={user.name} key={user.id} picture={user.picture} />
          ))
        }<div className="parenthesis">)</div></em>
        {alternative.selected?
          <FontAwesomeIcon icon="check" className="selected" />
          :null
        }
        {isOwnAlternative && (
          <span className={classes.removeIcon}><FontAwesomeIcon onClick={handleRemoveClick} icon="times" /></span>
        )}
      </div>
    </Dropdown.Item>
  );
};

export default Alternative;