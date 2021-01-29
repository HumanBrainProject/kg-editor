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
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { createUseStyles } from "react-jss";

import Label from "../Label";
import Field from "../Field";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const useStyles = createUseStyles({
  label: {},
  readMode:{
    "& $label:after": {
      content: "':\\00a0'"
    }
  },
  container: {
    border: "1px solid #ced4da",
    borderRadius: ".25rem",
    padding: "10px"
  }
});

const NestedField = observer(({className, fieldStore, readMode}) => {

  const classes = useStyles();

  const formGroupRef = useRef();

  const {
    label,
    labelTooltip,
    labelTooltipIcon,
    nestedFieldsStores
  } = fieldStore;

  const addValue = () => fieldStore.addValue();

  return (
    <Form.Group className={`${className} ${readMode?classes.readMode:""}`} ref={formGroupRef}>
      <Label className={classes.label} label={label} labelTooltip={labelTooltip} labelTooltipIcon={labelTooltipIcon} />
      <Form>
        {nestedFieldsStores.map((rowFieldStore, idx) => (
          <div key={idx} className={classes.container}>
            {Object.values(rowFieldStore).map(store => (
              <Field key={store.fullyQualifiedName} name={store.fullyQualifiedName} className={classes.field} fieldStore={store} readMode={readMode} enablePointerEvents={true} showIfNoValue={false} />
            ))}
          </div>
        ))}
        <Button className={classes.actionBtn} size="small" variant={"primary"} onClick={addValue} >
          <FontAwesomeIcon icon="times"/>
        </Button>
      </Form>
    </Form.Group>
  );
});
NestedField.displayName = "NestedField";

export default NestedField;