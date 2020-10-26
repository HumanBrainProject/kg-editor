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
import { createUseStyles } from "react-jss";
import { OverlayTrigger, Form, Tooltip } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { uniqueId } from "lodash";

const useStyles = createUseStyles({
  label: {
    fontWeight: "bold",
    marginBottom: "5px"
  }
});

const Label = ({ className, label, labelTooltip }) => {
  const classes = useStyles();
  return (
    <Form.Label className={`${classes.label} ${className?className:""}`}>{label}
      {labelTooltip && (
        <React.Fragment>
        &nbsp;
          <OverlayTrigger placement="top" overlay={<Tooltip id={uniqueId("label-tooltip")}>{labelTooltip}</Tooltip>}>
            <FontAwesomeIcon icon="question-circle"/>
          </OverlayTrigger>
        </React.Fragment>
      )}
    </Form.Label>
  );
};

export default Label;