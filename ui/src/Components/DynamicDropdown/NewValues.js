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
import Button from "react-bootstrap/Button";

import { useStores } from "../../Hooks/UseStores";

const useStyles = createUseStyles({
  option: {
    position: "relative"
  },
  info: {
    backgroundColor: "rgba(255, 226, 20, 0.6)",
    padding: "5px",
    marginTop: "2px",
    cursor: "pointer"
  },
  create: {
    paddingBottom: "5px"
  }
});


const NewValueInCurentSpace = ({ type, value }) => {

  const  { typeStore } = useStores();

  const style = type.color ? { color: type.color } : {};

  const typeDefinition = typeStore.typesMap.get(type.name);

  return (
    <>
      <em>Add a new <span style={style}>
        <FontAwesomeIcon fixedWidth icon="circle" />
      </span>
      {type.label} </em>{!!typeDefinition && !!typeDefinition.labelField && (
        <strong>{value}</strong>
      )}
    </>
  );
};


const NewValueInExternalSpace = ({space, type}) => {

  const classes = useStyles();

  const style = type.color ? { color: type.color } : {};

  if (space.permissions.canCreate) {
    return (
      <div className={classes.create}>
        <Button variant="primary" size="sm">
          <em>Create an instance of type <span style={style}>
            <FontAwesomeIcon fixedWidth icon="circle" />
          </span>
          {type.label} in space <strong>{space.name}</strong></em>
        </Button>
      </div>
    );
  }

  return (
    <div className={classes.info}>
      <em>You are not allowed to create an instance of type <span style={style}>
        <FontAwesomeIcon fixedWidth icon="circle" />
      </span>
      {type.label} in space <strong>{space.name}</strong>. Please contact the support.</em>
    </div>
  );
};


const NewValue = ({ newValue, value, hasFocus, onSelectNext, onSelectPrevious, onSelect, onCancel, onExternalCreate }) => {

  const classes = useStyles();

  const ref = useRef();

  useEffect(() => {
    if (hasFocus) {
      ref.current.focus();
    }
  });

  const handleOnSelect = () => {
    if (newValue.isExternal) {
      if (newValue.space.permissions.canCreate) {
        onExternalCreate(newValue.space.name, newValue.type.name);
      }
    } else {
      onSelect(newValue.type.name);
    }
  };

  const handleKeyDown = e => {
    if(e) {
      switch(e.keyCode) {
      case 38: {
        e.preventDefault();
        onSelectPrevious(newValue.type.name);
        break;
      }
      case 40: {
        e.preventDefault();
        onSelectNext(newValue.type.name);
        break;
      }
      case 13: {
        e.preventDefault();
        handleOnSelect();
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

  return (
    <Dropdown.Item onSelect={handleOnSelect}>
      <div tabIndex={-1} className={classes.option} onKeyDown={handleKeyDown} ref={ref}>
        {newValue.isExternal?
          <NewValueInExternalSpace space={newValue.space} type={newValue.type} /> 
          :
          <NewValueInCurentSpace type={newValue.type} value={value} />
        }
      </div>
    </Dropdown.Item>
  );
};


const NewValues = ({newValues, current, value, onSelectNext, onSelectPrevious, onSelect, onCancel, onExternalCreate}) => (
  <>
    {newValues.map(newValue => <NewValue key={newValue.id} newValue={newValue} value={value} onSelectNext={onSelectNext} onSelectPrevious={onSelectPrevious} onSelect={onSelect} onExternalCreate={onExternalCreate} onCancel={onCancel} hasFocus={current === newValue.id} />)}
  </>
);


export default NewValues;