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
import { Form } from "react-bootstrap";
import Label from "../Label";

const useStyles = createUseStyles({
  readMode: {}
});

const CheckBox = observer(({ className, fieldStore, readMode }) => {

  const { value, label, labelTooltip } = fieldStore;
  const classes = useStyles();

  const handleChange = () => {
    if (!fieldStore.disabled && !fieldStore.readOnly) {
      fieldStore.toggleValue();
    }
  };

  if (readMode) {
    return (
      <Form.Group className={`quickfire-field-checkbox quickfire-readmode ${classes.readMode} quickfire-field-readonly ${className}`}>
        <Label className={classes.label} label={label} labelTooltip={labelTooltip} />
        <span>&nbsp;<input className={"quickfire-readmode-checkbox"} type="checkbox" readOnly={true} checked={value} /></span>
      </Form.Group>
    );
  }

  return (
    <Form.Group className="quickfire-field-checkbox" >
      <Label className={classes.label} label={label} labelTooltip={labelTooltip} />
      <Form.Check readOnly={false} onChange={handleChange} checked={value} />
    </Form.Group>
  );
});

export default CheckBox;