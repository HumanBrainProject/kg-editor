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

import React, { useState } from "react";
import { createUseStyles } from "react-jss";
import { observer } from "mobx-react-lite";
import { Dropdown, Form } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const useStyles = createUseStyles({
  targetTypes: {
    minWidth: "30%",
    "&.dropdown > button.btn.dropdown-toggle, &.dropdown > button.btn.dropdown-toggle:hover, &.dropdown > button.btn.dropdown-toggle:active":
      {
        border: 0, //"1px solid #ced4da",
        background: "transparent",
        color: "#212529",
        width: "100%",
        paddingRight: "2px",
        textOverflow: "ellipsis",
        textAlign: "right",
        outline: 0
      }
  },
  targetTypesSearch: {
    paddingLeft: "5px",
    paddingRight: "5px"
  },
  infoCircle: {
    marginLeft: "5px",
    transform: "translateY(2px)"
  }
});

const FILTER_THRESHOLD = 10; //Show filter only if there are more than 5 elements

const TargetTypeSelection = observer(({ types, selectedType, id, onSelect }) => {
    const [filter, setFilter] = useState("");
    const [filteredTypes, setFilteredTypes] = useState(types);
    const classes = useStyles();

    const handleFilterChange = event => {
      const { value } = event.target;
      setFilter(value);
      const filtered = types.filter(type =>
        type.label.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredTypes(filtered);
    };

    return (
      <Dropdown className={classes.targetTypes} onSelect={onSelect}>
        <Dropdown.Toggle id={id}>
          <FontAwesomeIcon icon={"circle"} color={selectedType.color} />
          &nbsp;&nbsp;
          {selectedType.label ? selectedType.label : selectedType.name}
        </Dropdown.Toggle>
        <Dropdown.Menu>
          {types.length > FILTER_THRESHOLD && (
            <>
            <div className={classes.targetTypesSearch}>
              <Form.Control
                type="text"
                placeholder="Search type..."
                value={filter}
                onChange={handleFilterChange}
              />
              </div>
              <Dropdown.Divider />
            </>
          )}
          {filteredTypes.map(type => (
            <Dropdown.Item
              key={type.name}
              eventKey={type.name}
              title={type.description ? type.description : type.name}
            >
              <FontAwesomeIcon icon={"circle"} color={type.color} />
              &nbsp;&nbsp;{type.label ? type.label : type.name}
              {type.description && (
                <FontAwesomeIcon
                  className={classes.infoCircle}
                  icon="info-circle"
                />
              )}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown>
    );
  }
);
TargetTypeSelection.displayName = "TargetTypeSelection";

export default TargetTypeSelection;
