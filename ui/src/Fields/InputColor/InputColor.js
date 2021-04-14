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
import Color from "color";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import Label from "../Label";
import Invalid from "../Invalid";

const useStyles = createUseStyles({
  label: {},
  inputColor: {
    display: "inline-block",
    width: "revert",
    padding: "0",
    minWidth: "70px",
    paddingRight: "25px"
  },
  blockColor: {
    display: "inline-block",
    padding: "3px 8px",
    border: "1px solid #ced4da"
  },
  readMode:{
    "& $label:after": {
      content: "':\\00a0'"
    }
  },
  warning: {
    borderColor: "var(--ft-color-warn)"
  },
  addColorBtn: {
    fontSize: "x-small",
    marginLeft: "4px"
  },
  removeColorBtn: {
    display: "inline-block",
    borderRadius: "50px",
    padding: "2px 5px",
    fontSize: "xx-small",
    marginTop: "-15px",
    marginLeft: "-23px"
  }
});


const InputColor = observer(({ fieldStore, className, readMode, showIfNoValue }) => {

  const classes = useStyles();

  const formGroupRef = useRef();

  const {
    value,
    rows,
    returnAsNull,
    label,
    labelTooltip,
    labelTooltipIcon,
    globalLabelTooltip,
    globalLabelTooltipIcon,
    isRequired
  } = fieldStore;

  const handleChange = e => fieldStore.setValue(e.target.value);

  const handleAddColor = () => fieldStore.setValue("#000");

  const handleRemoveColor = () => fieldStore.setValue(null);

  if(readMode){
    if(!value) {
      if (showIfNoValue) {
        return (
          <Form.Group className={`${classes.readMode} ${className}`}>
            <Label className={classes.label} label={label} />
          </Form.Group>
        );
      }
      return null;
    }

    const color = new Color(value);
    const textColor = color.isLight()?"black":"white";

    return (
      <Form.Group className={`${classes.readMode} ${className}`}>
        <Label className={classes.label} label={label} />
        <div className={classes.blockColor} style={{backgroundColor: value, color: textColor}} title={value}>{value}</div>
      </Form.Group>
    );
  }

  if (!value) {
    return (
      <Form.Group className={className}>
        <Label className={classes.label} label={label} />
        <Button className={classes.addColorBtn} size="small" variant="primary" onClick={handleAddColor} title="Set color" >
          <FontAwesomeIcon icon="plus"/>
        </Button>
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
      <div>
        <Form.Control
          value={value}
          type="color"
          as="input"
          onChange={handleChange}
          disabled={isDisabled}
          rows={rows}
          className={`${classes.inputColor} ${hasWarning && hasWarningMessages?classes.warning:""}`}
        />
        <Button className={classes.removeColorBtn} size="small" variant="secondary" onClick={handleRemoveColor} title="Remove color" >
          <FontAwesomeIcon icon="times"/>
        </Button>
      </div>
      {hasWarning && hasWarningMessages &&
        <Invalid  messages={warningMessages}/>
      }
    </Form.Group>
  );
});
InputColor.displayName = "InputColor";

export default InputColor;