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
import { observer } from "mobx-react-lite";
import Button from "react-bootstrap/Button";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import DropdownButton from "react-bootstrap/DropdownButton";
import Dropdown from "react-bootstrap/Dropdown";
import { createUseStyles } from "react-jss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const useStyles = createUseStyles({
  actionBtn: {
    fontSize: "x-small"
  },
  dropdownBtn: {
    "& > button": {
      fontSize: "x-small",
      "&::after": {
        display: "none !important"
      }
    }
  }
});

const Add = observer(({className, types, onClick}) => {

  const classes = useStyles();

  if (!Array.isArray(types) || !types.length) {
    return null;
  }

  const handleSingleTypeAdd = () => onClick(types[0].name);

  const handleOnSelect = type =>onClick(type);

  if (types.length === 1) {
    return(
      <Button className={`${classes.actionBtn} ${className?className:""}`} size="small" variant="primary" onClick={handleSingleTypeAdd} title="Add" >
        <FontAwesomeIcon icon="plus"/>
      </Button>
    );
  }

  return (
    <DropdownButton
      as={ButtonGroup}
      key="right"
      id="dropdown-button-drop-right"
      drop="right"
      variant="primary"
      title={<FontAwesomeIcon icon="plus" />}
      className={`${classes.dropdownBtn} ${className?className:""}`}
    >
      {types.map(type=> <Dropdown.Item key={type.name} eventKey={type.name} onSelect={handleOnSelect}>{type.label}</Dropdown.Item>)}
    </DropdownButton>
  );
});
Add.displayName = "Add";

export default Add;