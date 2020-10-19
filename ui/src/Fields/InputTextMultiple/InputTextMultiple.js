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
import injectStyles from "react-jss";

import List from "./List";

import Alternatives from "../Alternatives";
import Label from "../Label";

const styles = {
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
};

@injectStyles(styles)
@observer
class InputTextMultiple extends React.Component {
  dropValue(droppedValue) {
    this.props.fieldStore.moveValueAfter(this.draggedValue, droppedValue);
    this.draggedValue = null;
  }

  alternativeValueRenderer = ({value: values}) => {
    const { fieldStore } = this.props;
    return values.map(value => (value && value[fieldStore.mappingValue])?value[fieldStore.mappingValue]:"Unknown ressource").join("; ");
  }

  handleOnAddValue = value => {
    const { fieldStore } = this.props;
    fieldStore.addValue(value);
  }

  handleSelectAlternative = values => {
    this.props.fieldStore.setValues([...values]);
  }

  handleRemoveMySuggestion = () => {
    this.props.fieldStore.removeAllValues();
  }

  handleDeleteLastValue = () => {
    this.props.fieldStore.removeLastValue();
  }

  handleDelete = index => {
    const { fieldStore } = this.props;
    const { value: values } = fieldStore;
    const value = values[index];
    fieldStore.removeValue(value);
  };

  handleDragEnd = () => this.draggedValue = null;

  handleDragStart = value => this.draggedValue = value;

  handleDrop = value => this.dropValue(value);

  handleBlur = e => {
    const value = e.target.value.trim();
    if (value) {
      this.handleOnAddValue(value);
    }
    e.target.value = "";
  };

  handleKeyDown = (value, e) => {
    if (e.keyCode === 8) { //User pressed "Backspace" while focus on a value
      e.preventDefault();
      this.props.fieldStore.removeValue(value);
    }
  }

  handleNativePaste = e => {
    e.preventDefault();
    e.clipboardData.getData("text").split("\n").forEach(value => {
      const val = value.trim();
      if (val) {
        this.handleOnAddValue(val);
      }
    });
  }

  handleKeyStrokes = e => {
    const { fieldStore } = this.props;
    if(e.keyCode === 13){
      //User pressed "Enter" while focus on input and we have not reached the maximum number of values
      const value = e.target.value.trim();
      if (value) {
        this.handleOnAddValue(value);
      }
      e.target.value = "";
    } else if(!e.target.value && fieldStore.value.length > 0 && e.keyCode === 8){
      // User pressed "Backspace" while focus on input, and input is empty, and values have been entered
      e.preventDefault();
      e.target.value = fieldStore.value[fieldStore.value.length-1][fieldStore.mappingValue];
      this.handleDeleteLastValue();
    }
  };

  renderReadMode(){
    const { classes, className, fieldStore } = this.props;
    const { label, labelTooltip, value } = fieldStore;
    return (
      <div className={className}>
        <div className={`quickfire-field-dropdown-select ${!value.length? "quickfire-empty-field":""} quickfire-readmode ${classes.readMode} quickfire-field-readonly}`}>
          <Label label={label} labelTooltip={labelTooltip} />
          <List
            list={value}
            readOnly={true}
            disabled={false}
          />
        </div>
      </div>
    );
  }

  render() {
    const { classes, className, fieldStore, readMode } = this.props;
    const {
      value,
      label,
      labelTooltip,
      alternatives,
      returnAsNull
    } = fieldStore;

    if(readMode){
      return this.renderReadMode();
    }

    const isDisabled = returnAsNull;
    return (
      <div className={className}>
        <FormGroup
          ref={ref=>this.formGroupRef = ref}
          className={`quickfire-field-dropdown-select ${!value.length? "quickfire-empty-field": ""}  ${isDisabled? "quickfire-field-disabled quickfire-field-readonly": ""}`}
        >
          <Label label={label} labelTooltip={labelTooltip} />
          <Alternatives
            className={classes.alternatives}
            list={alternatives}
            onSelect={this.handleSelectAlternative}
            onRemove={this.handleRemoveMySuggestion}
            parentContainerClassName="form-group"
            ValueRenderer={this.alternativeValueRenderer}
          />
          <div className={`form-control ${classes.values}`} disabled={isDisabled} >
            <List
              list={value}
              readOnly={false}
              disabled={isDisabled}
              onDelete={this.handleDelete}
              onDragEnd={this.handleDragEnd}
              onDragStart={this.handleDragStart}
              onDrop={this.handleDrop}
              onKeyDown={this.handleKeyDown}
            />
            <input type="text" className={`quickfire-user-input ${classes.userInput}`}
              disabled={isDisabled}
              onDrop={this.handleDrop}
              onDragOver={e => e.preventDefault()}
              onKeyDown={this.handleKeyStrokes}
              onBlur={this.handleBlur}
              onChange={e => e.stopPropagation()}
              onPaste={this.handleNativePaste}
            />
          </div>
        </FormGroup>
      </div>
    );
  }
}

export default InputTextMultiple;