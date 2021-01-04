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
import { createUseStyles } from "react-jss";
import Form from "react-bootstrap/Form";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import Label from "../Label";

const useStyles = createUseStyles({
  label: {},
  readMode:{
    "& $label:after": {
      content: "':\\00a0'"
    }
  },
  value: {
    marginBttom: "10px",
    fontStyle: "italic"
  },
  warning: {
    marginBttom: "15px",
    color: "var(--ft-color-error)"
  }
});


const UnsupportedField = observer(({ fieldStore, className, readMode, showIfNoValue }) => {

  const classes = useStyles();

  const {
    value,
    warning,
    label,
    labelTooltip,
    labelTooltipIcon
  } = fieldStore;


  if(readMode && !value && !showIfNoValue) {
    return null;
  }
  return (
    <Form.Group className={`${classes.readMode} ${className}`}>
      <Label className={classes.label} label={label} labelTooltip={labelTooltip} labelTooltipIcon={labelTooltipIcon} />
      {value && (
        <div className={classes.value}>{JSON.stringify(value)}</div>
      )}
      {warning && (
        <div className={classes.warning}><FontAwesomeIcon icon="exclamation-triangle" title="Error"/> {warning}</div>
      )}
    </Form.Group>
  );

});
UnsupportedField.displayName = "UnsupportedField";

export default UnsupportedField;