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
import { observer } from "mobx-react-lite";
import { createUseStyles } from "react-jss";
import Form from "react-bootstrap/Form";

import Alternatives from "../Alternatives";
import Label from "../Label";
import Invalid from "../Invalid";

const useStyles = createUseStyles({
  alternatives: {
    marginLeft: "3px"
  },
  label: {},
  readMode:{
    "& $label:after": {
      content: "':\\00a0'"
    }
  },
  warning: {
    borderColor: "var(--ft-color-warn)"
  }
});

const Lines = ({lines}) => {
  return (
    <div>
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
    <span>&nbsp;{val}</span>
  );
};

const AlternativeValue = observer(({alternative}) => alternative.value);
AlternativeValue.displayName = "AlternativeValue";

const InputText = observer(({ fieldStore, className, as, readMode, showIfNoValue }) => {

  const classes = useStyles();

  const formGroupRef = useRef();

  const {
    value,
    inputType,
    rows,
    returnAsNull,
    alternatives,
    label,
    labelTooltip,
    labelTooltipIcon,
    globalLabelTooltip,
    globalLabelTooltipIcon,
    isRequired
  } = fieldStore;

  const handleChange = e => fieldStore.setValue(e.target.value);

  const handleSelectAlternative = value => fieldStore.setValue(value);

  const handleRemoveMySuggestion = () => fieldStore.setValue(null);

  if(readMode){
    if(!value && !showIfNoValue) {
      return null;
    }
    return (
      <Form.Group className={`${classes.readMode} ${className}`}>
        <Label className={classes.label} label={label} />
        <FieldValue field={fieldStore} splitLines={as === "textarea"} />
      </Form.Group>
    );
  }

  const isDisabled = returnAsNull;
  const hasWarning = !isDisabled && fieldStore.hasChanged && (fieldStore.requiredValidationWarning || fieldStore.maxLengthWarning || fieldStore.regexWarning);
  const warningMessages = fieldStore.warningMessages;
  const hasWarningMessages = fieldStore.hasWarningMessages;
  return (
    <Form.Group className={className} ref={formGroupRef} >
      <Label className={classes.label} label={label} labelTooltip={labelTooltip} labelTooltipIcon={labelTooltipIcon} isRequired={isRequired} globalLabelTooltip={globalLabelTooltip} globalLabelTooltipIcon={globalLabelTooltipIcon}/>
      <Alternatives
        className={classes.alternatives}
        list={alternatives}
        onSelect={handleSelectAlternative}
        onRemove={handleRemoveMySuggestion}
        parentContainerRef={formGroupRef}
        ValueRenderer={AlternativeValue}
      />
      <Form.Control
        value={value}
        type={inputType}
        as={as}
        onChange={handleChange}
        disabled={isDisabled}
        rows={rows}
        className={hasWarning && hasWarningMessages?classes.warning:""}
      />
      {hasWarning && hasWarningMessages &&
        <Invalid  messages={warningMessages}/>
      }
    </Form.Group>
  );
});
InputText.displayName = "InputText";

export default InputText;