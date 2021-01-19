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
  }
});


const AlternativeValue = observer(({alternative}) => new Date(alternative.value).toLocaleDateString());
AlternativeValue.displayName = "AlternativeValue";

const InputDate = observer(({ fieldStore, className, readMode, showIfNoValue }) => {

  const classes = useStyles();

  const formGroupRef = useRef();

  const {
    value,
    returnAsNull,
    alternatives,
    label,
    labelTooltip,
    labelTooltipIcon
  } = fieldStore;

  const handleChange = value => fieldStore.setValue(value);

  const handleSelectAlternative = value => fieldStore.setValue(value);

  const handleRemoveMySuggestion = () => fieldStore.setValue(null);

  if(readMode){
    if(!value && !showIfNoValue) {
      return null;
    }
    const val = !value || typeof value === "string"? value:value.toString();
    const dateValue = new Date(val).toLocaleDateString();
    return (
      <Form.Group className={`${classes.readMode} ${className}`}>
        <Label className={classes.label} label={label} labelTooltip={labelTooltip}labelTooltipIcon={labelTooltipIcon} />
        <span>&nbsp;{dateValue}</span>
      </Form.Group>
    );
  }
  const dateValue = value === "" ? null:new Date(value);
  return (
    <Form.Group className={`${className} ${classes.containerDatepicker}`} ref={formGroupRef} >
      <Label className={classes.label} label={label} labelTooltip={labelTooltip} labelTooltipIcon={labelTooltipIcon} />
      <Alternatives
        className={classes.alternatives}
        list={alternatives}
        onSelect={handleSelectAlternative}
        onRemove={handleRemoveMySuggestion}
        parentContainerRef={formGroupRef}
        ValueRenderer={AlternativeValue}
      />
      <DatePicker
        className={classes.datePicker}
        dateFormat="dd/MM/yyyy"
        selected={dateValue}
        disabled={returnAsNull}
        onChange={handleChange}
      />
    </Form.Group>
  );
});
InputDate.displayName = "InputDate";

export default InputDate;