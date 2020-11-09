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
import Form from "react-bootstrap/Form";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import { observer } from "mobx-react";

import { ViewContext, PaneContext } from "../../../Stores/ViewStore";
import Field from "../../../Fields/Field";
import Label from "../../../Fields/Label";

const useStyles = createUseStyles({
  container: {
    margin: "0",
    padding: "0",
    border: "0",
    borderRadius: "0",
    boxShadow: "none",
    backgroundColor: "transparent"
  },
  field: {
    marginBottom: "10px",
    wordBreak: "break-word"
  },
  label: {
    "&:after": {
      content: "':\\00a0'"
    }
  },
  errorMessage: {
    marginBottom: "15px",
    fontWeight:"300",
    fontSize:"1em",
    color: "var(--ft-color-error)",
    "& path":{
      fill:"var(--ft-color-error)",
      stroke:"rgba(200,200,200,.1)",
      strokeWidth:"3px"
    }
  }
});

const NoPermissionForView = observer(({ instance, mode }) => {

  const classes = useStyles();

  return (
    <React.Fragment>
      <Label className={classes.label} label="Name" />{instance.name}
      <div className={classes.errorMessage}>
        <FontAwesomeIcon icon="ban" /> You do not have permission to {mode} the instance.
      </div>
    </React.Fragment>
  );
});

const BodyPanel = observer(({ className, instance, readMode}) => {

  const classes = useStyles();

  const view = React.useContext(ViewContext);
  const pane = React.useContext(PaneContext);

  if (readMode) {
    if(!instance.permissions.canRead) {
      return (
        <Form className={`${classes.container} ${className}`} >
          <NoPermissionForView instance={instance} mode="view" />
        </Form>
      );
    }
  } else { // edit
    if(!instance.permissions.canWrite) {
      return (
        <Form className={`${classes.container} ${className}`} >
          <NoPermissionForView instance={instance} mode="edit" />
        </Form>
      );
    }
  }

  const fields = [...instance.promotedFields, ...instance.nonPromotedFields];

  return (
    <Form className={`${classes.container} ${className}`} >
      {fields.map(name => {
        const fieldStore = instance.fields[name];
        return (
          <Field key={name} name={name} className={classes.field} fieldStore={fieldStore} view={view} pane={pane} readMode={readMode} enablePointerEvents={true} showIfNoValue={false} />
        );
      })}
    </Form>
  );
});

export default BodyPanel;