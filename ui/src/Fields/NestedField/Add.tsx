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

import React from "react";
import { observer } from "mobx-react-lite";
import Button from "react-bootstrap/Button";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import DropdownButton from "react-bootstrap/DropdownButton";
import Dropdown from "react-bootstrap/Dropdown";
import { createUseStyles } from "react-jss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { SimpleType } from "../../types";

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

interface AddProps {
  className: string;
  types: SimpleType[];
  onClick: (type: string) => void;
}

const Add = observer(({ className, types, onClick }: AddProps) => {
  const classes = useStyles();

  if (!Array.isArray(types) || !types.length) {
    return null;
  }

  const handleSingleTypeAdd = () => onClick(types[0].name);

  if (types.length === 1) {
    return (
      <Button
        className={`${classes.actionBtn} ${className ? className : ""}`}
        size="sm"
        variant="primary"
        onClick={handleSingleTypeAdd}
        title="Add"
      >
        <FontAwesomeIcon icon="plus" />
      </Button>
    );
  }

  return (
    <DropdownButton
      as={ButtonGroup}
      key="right"
      id="dropdown-button-drop-right"
      drop="end"
      variant="primary"
      title={<FontAwesomeIcon icon="plus" />}
      className={`${classes.dropdownBtn} ${className ? className : ""}`}
    >
      {types.map(type => (
        <Dropdown.Item
          key={type.name}
          eventKey={type.name}
          onClick={() => onClick(type.name)}
        >
          {type.label}
        </Dropdown.Item>
      ))}
    </DropdownButton>
  );
});
Add.displayName = "Add";

export default Add;
