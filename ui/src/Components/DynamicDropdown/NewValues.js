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

import { useStores } from "../../Hooks/UseStores";

const useStyles = createUseStyles({
  option: {
    position: "relative"
  }
});


const NewValues = ({types, currentType, value, onSelectNext, onSelectPrevious, onSelect, onCancel}) => (
  <>
    {types.map(type => <NewValue type={type} key={type.name} value={value} onSelectNext={onSelectNext} onSelectPrevious={onSelectPrevious} onSelect={onSelect} onCancel={onCancel} hasFocus={currentType === type.name} />)}
  </>
);

const NewValue = ({ type, value, hasFocus, onSelectNext, onSelectPrevious, onSelect, onCancel }) => {

  const classes = useStyles();

  const  { typeStore } = useStores();

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
      default:
        break;
      }
    }
  };

  const style = type.color ? { color: type.color } : {};

  const typeDefinition = typeStore.typesMap.get(type.name);

  return (
    <Dropdown.Item onSelect={handleOnSelect}>
      <div tabIndex={-1} className={classes.option} onKeyDown={handleKeyDown} ref={ref}>
        <em>Add a new <span style={style}>
          <FontAwesomeIcon fixedWidth icon="circle" />
        </span>
        {type.label} </em>{!!typeDefinition && !!typeDefinition.labelField && (
          <strong>{value}</strong>
        )}
      </div>
    </Dropdown.Item>
  );
};

export default NewValues;