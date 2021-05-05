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
import Label from "../Label";

const useStyles = createUseStyles({
  container: {
    "& .form-check": {
      verticalAlign: "middle",
      marginLeft: "4px",
      transform: "translateY(-2px)",
      display: "inline-block"
    }
  },
  label: {
    display: "inline"
  }
});

const CheckBox = observer(({ className, fieldStore, readMode, showIfNoValue }) => {

  const { value, label, labelTooltip, labelTooltipIcon, globalLabelTooltip, globalLabelTooltipIcon } = fieldStore;
  const classes = useStyles();

  const handleChange = () => {
    if (!fieldStore.disabled && !fieldStore.readOnly) {
      fieldStore.toggleValue();
    }
  };

  if(readMode) {
    if(value ===null && !showIfNoValue){
      return null;
    }

    <Form.Group className={`${classes.container} ${className}`} >
      <Label className={classes.label} label={label} />
      <Form.Check disabled={true} checked={value} />
    </Form.Group>;

  }

  return (
    <Form.Group className={`${classes.container} ${className}`} >
      <Label className={classes.label} label={label} labelTooltip={labelTooltip} labelTooltipIcon={labelTooltipIcon} globalLabelTooltip={globalLabelTooltip} globalLabelTooltipIcon={globalLabelTooltipIcon}/>
      <Form.Check onChange={handleChange} checked={value} />
    </Form.Group>
  );
});
CheckBox.displayName = "CheckBox";

export default CheckBox;