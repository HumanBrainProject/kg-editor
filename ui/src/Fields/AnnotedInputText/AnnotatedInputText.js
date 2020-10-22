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

import React, { useRef } from "react";
import { observer } from "mobx-react";
import { Form } from "react-bootstrap";
import { createUseStyles } from "react-jss";

import List from "../InputTextMultiple/List";
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

const AnnotatedInputText = observer(({className, fieldStore, readMode}) => {

  const classes = useStyles();

  const draggedValue = useRef();

  const {
    value: values,
    resources,
    label,
    labelTooltip,
    alternatives,
    returnAsNull
  } = fieldStore;

  const dropValue = droppedValue => {
    fieldStore.moveValueAfter(draggedValue.current, droppedValue);
    draggedValue.current = null;
  };

  const alternativeValueRenderer = ({value: values}) => {
    return values.map(value => (value && value[fieldStore.mappingValue])?value[fieldStore.mappingValue]:"Unknown resource").join("; ");
  };

  const handleOnAddValue = resource => {
    const value = {[fieldStore.mappingValue]: resource};
    fieldStore.addValue(value);
  };

  const handleSelectAlternative = values => fieldStore.setValues([...values]);

  const handleRemoveMySuggestion = () => fieldStore.removeAllValues();

  const handleDeleteLastValue = () => fieldStore.removeLastValue();

  const handleDelete = index => {
    const value = values[index];
    fieldStore.removeValue(value);
  };

  const handleDragEnd = () => draggedValue.current = null;

  const handleDragStart = value => draggedValue.current = value;

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
    } else if(!e.target.value && fieldStore.resources.length > 0 && e.keyCode === 8){
      // User pressed "Backspace" while focus on input, and input is empty, and values have been entered
      e.preventDefault();
      e.target.value = fieldStore.value[fieldStore.value.length-1][fieldStore.mappingValue];
      handleDeleteLastValue();
    }
  };

  if(readMode){
    return (
      <div className={className}>
        <div className={`quickfire-field-dropdown-select ${!resources.length? "quickfire-empty-field":""} quickfire-readmode ${classes.readMode} quickfire-field-readonly}`}>
          <Label label={label} labelTooltip={labelTooltip} />
          <List
            list={resources}
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
      <Form.Group className={`quickfire-field-dropdown-select ${!resources.length? "quickfire-empty-field": ""}  ${isDisabled? "quickfire-field-disabled quickfire-field-readonly": ""}`} >
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
            list={resources}
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
      </Form.Group>
    </div>
  );
});

export default AnnotatedInputText;