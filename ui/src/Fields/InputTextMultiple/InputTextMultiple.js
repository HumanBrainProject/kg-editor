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
import { observer } from "mobx-react";
import { FormGroup } from "react-bootstrap";
import { createUseStyles } from "react-jss";

import List from "./List";
import Label from "../Label";

import Alternatives from "../Alternatives";

const useStyles = createUseStyles({
  values:{
    height:"auto",
    paddingBottom:"3px",
    position:"relative",
    minHeight: "34px",
    "& .btn":{
      marginRight:"3px",
      marginBottom:"3px"
    },
    "&:disabled":{
      pointerEvents:"none",
      display: "none !important"
    }
  },
  readMode:{
    "& .quickfire-label:after":{
      content: "':\\00a0'"
    },
    "& .quickfire-readmode-item:not(:last-child):after":{
      content: "';\\00a0'"
    }
  },
  alternatives: {
    marginLeft: "3px"
  },
  userInput:{
    background:"transparent",
    border:"none",
    color:"currentColor",
    outline:"none",
    width:"200px",
    maxWidth:"33%",
    marginBottom:"3px",
    "&:disabled":{
      cursor: "not-allowed"
    }
  },
});

const InputTextMultiple = observer(({className, fieldStore, readMode}) => {

  const classes = useStyles();

  const {
    value: list,
    label,
    labelTooltip,
    alternatives,
    returnAsNull
  } = fieldStore;

  const dropValue = droppedValue => {
    fieldStore.moveValueAfter(this.draggedValue, droppedValue);
    this.draggedValue = null;
  };

  const alternativeValueRenderer = ({value: values}) => {
    return values.map(value => (value && value[fieldStore.mappingValue])?value[fieldStore.mappingValue]:"Unknown resource").join("; ");
  };

  const handleOnAddValue = value => fieldStore.addValue(value);

  const handleSelectAlternative = values => fieldStore.setValues([...values]);

  const handleRemoveMySuggestion = () => fieldStore.removeAllValues();

  const handleDeleteLastValue = () => fieldStore.removeLastValue();

  const handleDelete = index => {
    const value = list[index];
    fieldStore.removeValue(value);
  };

  const handleDragEnd = () => this.draggedValue = null;

  const handleDragStart = value => this.draggedValue = value;

  const handleDrop = value => dropValue(value);

  const handleBlur = e => {
    const value = e.target.value.trim();
    if (value) {
      handleOnAddValue(value);
    }
    e.target.value = "";
  };

  const handleKeyDown = (value, e) => {
    if (e.keyCode === 8) { //User pressed "Backspace" while focus on a value
      e.preventDefault();
      fieldStore.removeValue(value);
    }
  };

  const handleNativePaste = e => {
    e.preventDefault();
    e.clipboardData.getData("text").split("\n").forEach(value => {
      const val = value.trim();
      if (val) {
        handleOnAddValue(val);
      }
    });
  };

  const handleKeyStrokes = e => {
    if(e.keyCode === 13){
      //User pressed "Enter" while focus on input and we have not reached the maximum number of values
      const value = e.target.value.trim();
      if (value) {
        handleOnAddValue(value);
      }
      e.target.value = "";
    } else if(!e.target.value && fieldStore.value.length > 0 && e.keyCode === 8){
      // User pressed "Backspace" while focus on input, and input is empty, and values have been entered
      e.preventDefault();
      e.target.value = fieldStore.value[fieldStore.value.length-1][fieldStore.mappingValue];
      handleDeleteLastValue();
    }
  };

  if(readMode){
    return (
      <div className={className}>
        <div className={`quickfire-field-dropdown-select ${!list.length? "quickfire-empty-field":""} quickfire-readmode ${classes.readMode} quickfire-field-readonly}`}>
          <Label label={label} labelTooltip={labelTooltip} />
          <List
            list={list}
            readOnly={true}
            disabled={false}
          />
        </div>
      </div>
    );
  }

  const isDisabled = returnAsNull;
  return (
    <div className={className}>
      <FormGroup className={`quickfire-field-dropdown-select ${!list.length? "quickfire-empty-field": ""}  ${isDisabled? "quickfire-field-disabled quickfire-field-readonly": ""}`}>
        <Label label={label} labelTooltip={labelTooltip} />
        <Alternatives
          className={classes.alternatives}
          list={alternatives}
          onSelect={handleSelectAlternative}
          onRemove={handleRemoveMySuggestion}
          parentContainerClassName="form-group"
          ValueRenderer={alternativeValueRenderer}
        />
        <div className={`form-control ${classes.values}`} disabled={isDisabled} >
          <List
            list={list}
            readOnly={false}
            disabled={isDisabled}
            onDelete={handleDelete}
            onDragEnd={handleDragEnd}
            onDragStart={handleDragStart}
            onDrop={handleDrop}
            onKeyDown={handleKeyDown}
          />
          <input type="text" className={`quickfire-user-input ${classes.userInput}`}
            disabled={isDisabled}
            onDrop={handleDrop}
            onDragOver={e => e.preventDefault()}
            onKeyDown={handleKeyStrokes}
            onBlur={handleBlur}
            onChange={e => e.stopPropagation()}
            onPaste={handleNativePaste}
          />
        </div>
      </FormGroup>
    </div>
  );
});

export default InputTextMultiple;