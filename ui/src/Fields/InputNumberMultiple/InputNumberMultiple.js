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

import React, { useRef } from "react";
import { observer } from "mobx-react-lite";
import Form from "react-bootstrap/Form";
import { createUseStyles } from "react-jss";

import List from "../InputTextMultiple/List";
import Label from "../Label";

import Alternatives from "../Alternatives";
import Invalid from "../Invalid";
import Warning from "../Warning";

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
    "&[disabled]": {
      pointerEvents:"none",
      display: "none !important"
    }
  },
  label: {},
  readMode:{
    "& $label:after": {
      content: "':\\00a0'"
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
  warning: {
    borderColor: "var(--ft-color-warn)"
  }
});

const getAlternativeValue = () => {
  const AlternativeValue = observer(({alternative}) => Array.isArray(alternative.value) ? alternative.value.map(v => JSON.stringify(v)).join("; "):JSON.stringify(alternative.value));
  AlternativeValue.displayName = "AlternativeValue";
  return AlternativeValue;
};

const InputNumberMultiple = observer(({className, fieldStore, readMode, showIfNoValue}) => {

  const classes = useStyles();

  const draggedIndex = useRef();
  const formGroupRef = useRef();

  const {
    value: list,
    label,
    labelTooltip,
    labelTooltipIcon,
    isPublic,
    alternatives,
    returnAsNull,
    isRequired,
    isReadOnly
  } = fieldStore;

  const handleOnAddValue = value => {
    if(value !== undefined && value !== null) {
      const val = parseFloat(value);
      if(!isNaN(val)) {
        fieldStore.addValue(value);
      }
    }
  };

  const handleSelectAlternative = values => fieldStore.setValues([...values]);

  const handleRemoveMySuggestion = () => fieldStore.removeAllValues();

  const handleDeleteLastValue = () => fieldStore.removeLastValue();

  const handleDelete = index => {
    const value = list[index];
    fieldStore.removeValue(value);
  };

  const handleDragEnd = () => draggedIndex.current = null;

  const handleDragStart = index => draggedIndex.current = index;

  const handleDrop = droppedIndex => {
    if (Array.isArray(list) && draggedIndex.current >= 0 && draggedIndex.current < list.length && droppedIndex >= 0 && droppedIndex < list.length) {
      const value = list[draggedIndex.current];
      const afterValue = list[droppedIndex];
      fieldStore.moveValueAfter(value, afterValue);
    }
    draggedIndex.current = null;
  };

  const handleBlur = e => {
    const value = e.target.value.trim();
    if (value) {
      handleOnAddValue(value);
    }
    e.target.value = "";
  };

  const handleKeyDown = (value, e) => {
    if (e.key === "Backspace") { //User pressed "Backspace" while focus on a value
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
    if(e.key === "Enter"){
      //User pressed "Enter" while focus on input and we have not reached the maximum number of values
      const value = e.target.value.trim();
      if (value) {
        handleOnAddValue(value);
      }
      e.target.value = "";
    } else if(!e.target.value && fieldStore.value.length > 0 && e.key === "Backspace"){
      // User pressed "Backspace" while focus on input, and input is empty, and values have been entered
      e.preventDefault();
      e.target.value = list[list.length-1];
      handleDeleteLastValue();
    }
  };

  if(readMode && !list.length && !showIfNoValue) {
    return null;
  }

  if(readMode || isReadOnly){
    return (
      <Form.Group className={`${classes.readMode} ${className}`}>
        <Label className={classes.label} label={label} isRequired={isRequired} isReadOnly={readMode?false:isReadOnly} />
        <List
          list={list}
          readOnly={true}
          disabled={false}
        />
      </Form.Group>
    );
  }

  const isDisabled = returnAsNull;
  const hasValidationWarnings = !isDisabled && fieldStore.hasValidationWarnings;
  const hasWarning = !isDisabled && fieldStore.hasChanged && fieldStore.hasWarning;
  return (
    <Form.Group className={className} ref={formGroupRef}>
      <Label className={classes.label} label={label} labelTooltip={labelTooltip} labelTooltipIcon={labelTooltipIcon} isPublic={isPublic} />
      <Alternatives
        className={classes.alternatives}
        list={alternatives}
        onSelect={handleSelectAlternative}
        onRemove={handleRemoveMySuggestion}
        parentContainerRef={formGroupRef}
        ValueRenderer={getAlternativeValue()}
      />
      <div className={`form-control ${classes.values} ${hasValidationWarnings?classes.warning:""}`} disabled={isDisabled} >
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
        <input type="number" className={classes.userInput}
          disabled={isDisabled}
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
          onKeyDown={handleKeyStrokes}
          onBlur={handleBlur}
          onChange={e => e.stopPropagation()}
          onPaste={handleNativePaste}
        />
      </div>
      <Invalid show={hasValidationWarnings} messages={fieldStore.validationWarnings} />
      <Warning show={hasWarning} message={fieldStore.warning} />
    </Form.Group>
  );
});
InputNumberMultiple.displayName = "InputNumberMultiple";

export default InputNumberMultiple;