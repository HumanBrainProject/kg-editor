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
import { Form } from "react-bootstrap";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

import { ViewContext, PaneContext } from "../../../Stores/ViewStore";
import Field from "../../../Fields/Field";

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
    wordBreak: "break-word",
    "& textarea": {
      minHeight: "200px"
    },
    "& .quickfire-field-input-text.quickfire-readmode, & .quickfire-field-dropdown-select.quickfire-readmode": {
      marginBottom: "5px",
      "& label.quickfire-label": {
        marginBottom: "0",
        "& + p": {
          whiteSpace: "pre-wrap"
        }
      }
    },
    "& .quickfire-field-disabled.quickfire-empty-field, .quickfire-field-readonly.quickfire-empty-field": {
      display: "none"
    },
    "& .quickfire-field-checkbox .quickfire-label": {
      "&:after": {
        display: "none"
      },
      "& + .checkbox": {
        display: "inline-block",
        margin: "0 0 0 4px",
        verticalAlign: "middle",
        "& label input[type=checkbox]": {
          fontSize: "16px"
        }
      },
      "& + span": {
        verticalAlign: "text-bottom",
        "& input[type=checkbox]": {
          fontSize: "16px",
          marginTop: "0"
        }
      }
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

const NoPermissionForView = ({ instance, mode }) => {

  const classes = useStyles();

  const fieldStore = instance.fields[instance.labelField];

  return (
    <React.Fragment>
      <Field name={instance.labelField} fieldStore={fieldStore} readMode={true} className={classes.field} />
      <div className={classes.errorMessage}>
        <FontAwesomeIcon icon="ban" /> You do not have permission to {mode} the instance.
      </div>
    </React.Fragment>
  );
};

const BodyPanel = ({ className, instance, readMode}) => {

  const classes = useStyles();

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
    <ViewContext.Consumer>
      {view => (
        <PaneContext.Consumer>
          {pane => (
            <Form className={`${classes.container} ${className}`} >
              {fields.map(name => {
                const fieldStore = instance.fields[name];
                return (
                  <Field key={name} name={name} className={classes.field} fieldStore={fieldStore} view={view} pane={pane} readMode={readMode} enablePointerEvents={true} showIfNoValue={false} />
                );
              })}
            </Form>
          )}
        </PaneContext.Consumer>
      )}
    </ViewContext.Consumer>

  );
};

export default BodyPanel;