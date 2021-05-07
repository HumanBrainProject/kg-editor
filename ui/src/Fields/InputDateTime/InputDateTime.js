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
import { createUseStyles } from "react-jss";
import Form from "react-bootstrap/Form";
import DatePicker from "react-datepicker";

import Alternatives from "../Alternatives";
import Label from "../Label";
import "react-datepicker/dist/react-datepicker.css";

const useStyles = createUseStyles({
  containerDatepicker: {
    "& > .react-datepicker-wrapper": {
      display: "block"
    },
    "& .react-datepicker__triangle": {
      left: "50px !important"
    }
  },
  alternatives: {
    marginLeft: "3px"
  },
  label: {},
  readMode:{
    "& $label:after": {
      content: "':\\00a0'"
    }
  },
  datePicker: {
    display: "block",
    width: "100%",
    padding: ".375rem .75rem",
    fontSize: "1rem",
    fontWeight: "400",
    lineHeight: "1.5",
    color: "#495057",
    backgroundColor: "#fff",
    backgroundClip: "padding-box",
    border: "1px solid #ced4da",
    borderRadius: ".25rem",
    transition: "border-color .15s ease-in-out,box-shadow .15s ease-in-out",
    height: "auto",
    position: "relative",
    minHeight: "34px",
    paddingBottom: "3px"
  },
  warning: {
    borderColor: "var(--ft-color-warn)"
  }
});


const getDateTimeValue = value => {
  if (value && typeof value === "string") {
    const d = new Date(value);
    if (d instanceof Date && !isNaN(d)) {
      return d.toLocaleString();
    }
    return value
  }
  return JSON.stringify(value);
};

const AlternativeValue = observer(({alternative}) => getDateTimeValue(alternative.value));
AlternativeValue.displayName = "AlternativeValue";

const InputDateTime = observer(({ fieldStore, className, readMode, showIfNoValue }) => {

  const classes = useStyles();

  const formGroupRef = useRef();

  const {
    value,
    returnAsNull,
    alternatives,
    label,
    labelTooltip,
    labelTooltipIcon,
    globalLabelTooltip,
    globalLabelTooltipIcon,
    isRequired
  } = fieldStore;

  const handleChange = value => fieldStore.setValue(value);

  const handleSelectAlternative = value => fieldStore.setValue(value);

  const handleRemoveMySuggestion = () => fieldStore.setValue(null);

  if(readMode){
    if(!value && !showIfNoValue) {
      return null;
    }
    const val = getDateTimeValue(value);
    return (
      <Form.Group className={`${classes.readMode} ${className}`}>
        <Label className={classes.label} label={label} />
        <span>&nbsp;{val}</span>
      </Form.Group>
    );
  }
  const dateValue = value === "" ? null:new Date(value);
  const isDisabled = returnAsNull;
  const hasWarning = !isDisabled && fieldStore.requiredValidationWarning && fieldStore.hasChanged;
  return (
    <Form.Group className={`${className} ${classes.containerDatepicker}`} ref={formGroupRef} >
      <Label className={classes.label} label={label} labelTooltip={labelTooltip} labelTooltipIcon={labelTooltipIcon} isRequired={isRequired} globalLabelTooltip={globalLabelTooltip} globalLabelTooltipIcon={globalLabelTooltipIcon}/>
      <Alternatives
        className={classes.alternatives}
        list={alternatives}
        onSelect={handleSelectAlternative}
        onRemove={handleRemoveMySuggestion}
        parentContainerRef={formGroupRef}
        ValueRenderer={AlternativeValue}
      />
      <DatePicker
        className={`${classes.datePicker} ${hasWarning?classes.warning:""}`}
        selected={dateValue}
        disabled={isDisabled}
        onChange={handleChange}
        showTimeSelect
        timeFormat="p"
        timeIntervals={15}
        dateFormat="Pp"
      />
    </Form.Group>
  );
});
InputDateTime.displayName = "InputDateTime";

export default InputDateTime;