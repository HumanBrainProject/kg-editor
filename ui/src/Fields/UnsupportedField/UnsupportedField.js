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
    labelTooltipIcon,
    globalLabelTooltip,
    globalLabelTooltipIcon
  } = fieldStore;


  if(readMode && !value && !showIfNoValue) {
    return null;
  }
  return (
    <Form.Group className={`${classes.readMode} ${className}`}>
      {readMode ?
        <Label className={classes.label} label={label} />:
        <Label className={classes.label} label={label} labelTooltip={labelTooltip} labelTooltipIcon={labelTooltipIcon} globalLabelTooltip={globalLabelTooltip} globalLabelTooltipIcon={globalLabelTooltipIcon} />
      }
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