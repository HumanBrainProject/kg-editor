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
import { createUseStyles } from "react-jss";
import { FormGroup, FormControl } from "react-bootstrap";

import Alternatives from "../Alternatives";
import Label from "../Label";

const useStyles = createUseStyles({
  readMode: {
    "& .quickfire-label:after":{
      content: "':\\00a0'"
    }
  },
  alternatives: {
    marginLeft: "3px"
  }
});

const Lines = ({lines}) => {
  return (
    <div className="quickfire-readmode-value quickfire-readmode-textarea-value">
      {lines.map((line, index) => {
        return(
          <p key={line+(""+index)}>{line}</p>
        );
      })}
    </div>
  );
};

const FieldValue = ({field, splitLines}) => {
  const { value } = field;
  const val = !value || typeof value === "string"? value:value.toString();

  if (splitLines) {
    const lines = typeof value === "string"?value.split("\n"):[];
    return (
      <Lines lines={lines} />
    );
  }

  return (
    <span className="quickfire-readmode-value">&nbsp;{val}</span>
  );
};

const AlternativeValue = ({value}) => value;

const InputText = observer(({ fieldStore, className, componentClass, readMode }) => {

  const classes = useStyles();

  const {
    value,
    inputType,
    rows,
    returnAsNull,
    alternatives,
    label,
    labelTooltip
  } = fieldStore;

  const handleChange = e => fieldStore.setValue(e.target.value);

  const handleSelectAlternative = value => fieldStore.setValue(value);

  const handleRemoveMySuggestion = () => fieldStore.setValue(null);

  if(readMode){
    return (
      <div className={className}>
        <div className={`quickfire-field-input-text ${!value? "quickfire-empty-field": ""} quickfire-readmode ${classes.readMode} quickfire-field-readonly`}>
          <Label label={label} labelTooltip={labelTooltip} />
          <FieldValue field={fieldStore} splitLines={componentClass=== "textarea"} />
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <FormGroup className={`quickfire-field-input-text ${classes.container?classes.container:""} ${!value? "quickfire-empty-field": ""} ${returnAsNull? "quickfire-field-disabled": ""}`} >
        <Label label={label} labelTooltip={labelTooltip} />
        <Alternatives
          className={classes.alternatives}
          list={alternatives}
          onSelect={handleSelectAlternative}
          onRemove={handleRemoveMySuggestion}
          parentContainerClassName="form-group"
          ValueRenderer={AlternativeValue}
        />
        <FormControl
          value={value}
          type={inputType}
          className={"quickfire-user-input"}
          componentClass={componentClass}
          onChange={handleChange}
          disabled={returnAsNull}
          rows={rows}
        />
      </FormGroup>
    </div>
  );
});

export default InputText;