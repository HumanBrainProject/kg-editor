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
import InputText from "../InputText/InputText";
import RenderMarkdownField from "../../Components/Markdown";
import { createUseStyles } from "react-jss";
import Form from "react-bootstrap/Form";
import Label from "../Label";

const useStyles = createUseStyles({
  label: {},
  editMode: {
    "& textarea": {
      minHeight: "200px"
    }
  },
  readMode: {
    "& $label:after": {
      content: "':\\00a0'"
    }
  }
});

const TextArea = (props) => {
  const classes = useStyles();
  const { readMode, fieldStore, className, showIfNoValue } = props;
  const { label, labelTooltip, value, labelTooltipIcon } = fieldStore;
  if (readMode) {

    if(!value && !showIfNoValue) {
      return null;
    }

    if (fieldStore.markdown) {
      return (
        <Form.Group className={`${classes.container} ${className} ${classes.readMode}`} >
          {label && (
            <Label className={classes.label} label={label} labelTooltip={labelTooltip} labelTooltipIcon={labelTooltipIcon}/>
          )}
          <RenderMarkdownField value={value}/>
        </Form.Group>
      );
    }
    return (
      <Form.Group className={`${classes.container} ${className} ${classes.readMode}`} >
        {label && (
          <Label className={classes.label} label={label} labelTooltip={labelTooltip}  labelTooltipIcon={labelTooltipIcon}/>
        )}
        <p>{fieldStore.value}</p>
      </Form.Group>
    );
  }
  return (
    <InputText {...props} className={`${classes.editMode} ${className}`} as="textarea" autosize={true} />
  );
};

export default TextArea;