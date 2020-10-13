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
import injectStyles from "react-jss";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

import { ViewContext } from "../../../Stores/ViewStore";
import Field from "../../../Fields/Field";

const styles = {
  container: {
    margin: "0",
    padding: "0",
    border: "0",
    borderRadius: "0",
    boxShadow: "none",
    backgroundColor: "transparent"
  },
  field: {
    "& textarea": {
      minHeight: "200px"
    },
    "& .quickfire-field-dropdown-select .quickfire-readmode-item button": {
      margin: "0 1px 3px 2px"
    },
    "& .quickfire-field-dropdown-select .btn.quickfire-value-tag:hover, & .btn.quickfire-value-tag:focus, & .quickfire-field-dropdown-select .quickfire-readmode-item button:hover, & .quickfire-field-dropdown-select .quickfire-readmode-item button:focus": {
      backgroundColor: "#a5c7e9",
      borderColor: "#337ab7",
      color: "#143048"
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
};

@injectStyles(styles)
class BodyPanel extends React.Component{

  renderNoPermissionForView = mode => {
    const { classes, className, instance} = this.props;
    const fieldStore = instance.fields[instance.labelField];
    return (
      <div className={`${classes.container} ${className}`} >
        <Field name={instance.labelField} fieldStore={fieldStore} readMode={true} className={classes.field} />
        <div className={classes.errorMessage}>
          <FontAwesomeIcon icon="ban" /> You do not have permission to {mode} the instance.
        </div>
      </div>
    );
  }

  render(){
    const { classes, className, instance } = this.props;

    if (instance.isReadMode) {
      if(!instance.permissions.canRead) {
        return this.renderNoPermissionForView("view");
      }
    } else { // edit
      if(!instance.permissions.canWrite) {
        return this.renderNoPermissionForView("edit");
      }
    }

    const fields = [...instance.promotedFields, ...instance.nonPromotedFields];

    return(
      <div className={`${classes.container} ${className}`} >
        <ViewContext.Consumer>
          {view => fields.map(name => {
            const fieldStore = instance.fields[name];
            return (
              <Field key={name} name={name} className={classes.field} fieldStore={fieldStore} readMode={view.mode === "view"} />
            );
          })}
        </ViewContext.Consumer>
      </div>
    );
  }
}

export default BodyPanel;