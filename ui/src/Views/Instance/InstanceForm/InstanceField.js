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
import { observer, inject } from "mobx-react";
import { Field } from "hbp-quickfire";

import appStore from "../../../Stores/AppStore";
import instanceStore from "../../../Stores/InstanceStore";
import instanceTabStore from "../../../Stores/InstanceTabStore";

import RenderMarkdownField from "../../../Components/Markdown";
import typesStore from "../../../Stores/TypesStore";

const styles = {
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
  nestedField: {
    "& > div > input + div": {
      border: "1px solid #ccc",
      padding: "10px"
    },
    "& .quickfire-nested-remove": {
      marginBottom: "5px"
    }
  },
  nestedFieldItem: {
    border: "1px solid #ccc",
    marginBottom: "10px",
    padding: "10px"
  },
  notFound:{
    fontStyle: "italic",
    backgroundColor: "lightgrey",
    "&:hover":{
      backgroundColor: "lightgrey"
    }
  }
};

@injectStyles(styles)
@inject("paneStore")
@observer
class InstanceField extends React.Component{

  componentDidMount() {
    const { instance, name } = this.props;
    const field = instance.fields[name];
    if(field && field.type === "KgTable") {
      const store = instance.form.structure.fields[name];
      store.isInteractive = true;
    }
  }

  handleFieldFocus = (field, value) => {
    const id = value && value["@id"];
    if (field && field.isLink && id) {
      this.handleToggleOffFieldHighlight(field, value);
      setTimeout(() => {
        instanceTabStore.setCurrentInstanceId(this.props.mainInstanceId, id, this.props.level + 1);
        const target = document.querySelector(`[data-provenence="${field.label}"] [data-id="${id}"]`);
        if (target && target.childNodes && target.childNodes[0] && target.childNodes[0].firstChild.firstChild.getElementsByClassName("fa-w-16")[0]) {
          target.childNodes[0].firstChild.firstChild.getElementsByClassName("fa-w-16")[0].scrollIntoView({behavior:"smooth", block:"center"});
        }
        this.props.paneStore.selectPane(`ChildrenOf${this.props.id}`);
      });
    }
  }

  handleToggleOnFieldHighlight = (field, value) => {
    const id = value && value["@id"];
    if (field && field.isLink && id) {
      instanceStore.setInstanceHighlight(id, field.label);
      const target = document.querySelector(`[data-provenence="${field.label}"] [data-id="${id}"]`);
      if (target && target.childNodes && target.childNodes[0] && target.childNodes[0].firstChild.firstChild.getElementsByClassName("fa-w-16")[0]) {
        target.childNodes[0].firstChild.firstChild.getElementsByClassName("fa-w-16")[0].scrollIntoView({behavior:"smooth", block:"center"});
      }
    }
  }

  handleToggleOffFieldHighlight = (field, value) => {
    const id = value && value["@id"];
    if (field && field.isLink && id) {
      instanceStore.setInstanceHighlight(id, null);
    }
  }

  renderReadModeField = field => {
    const { classes } = this.props;
    if (field) {
      if (typeof field.type === "string" && field.type.includes("TextArea")) {
        return (
          field.markdown === true ? <RenderMarkdownField value={field.value}/>:
            <p>{field.value}</p>
        );
      }
      if (typeof field.type === "string" && (field.type.includes("DropdownSelect") || field.type === "DynamicDropdown")) {
        const valueLabelRendering = (field, value) => {
          if (typeof field.valueLabelRendering === "function") {
            return field.valueLabelRendering(field, value);
          }
          return value[field.mappingLabel];
        };
        return (
          <span className="quickfire-readmode-list">
            {field.value.map(value =>
              <span key={field.store.getGeneratedKey(value, "dropdown-read-item")} className="quickfire-readmode-item">
                <button type="button" className={`btn btn-xs btn-default ${value.fetchError ? classes.notFound : ""}`}
                  onClick={(event) => {event.stopPropagation(); this.handleFieldFocus(field, value);}}
                  onFocus={(event) => {event.stopPropagation(); this.handleToggleOnFieldHighlight(field, value);}}
                  onMouseEnter={(event) => {event.stopPropagation(); this.handleToggleOnFieldHighlight(field, value);}}
                  onBlur={(event) => {event.stopPropagation(); this.handleToggleOffFieldHighlight(field, value);}}
                  onMouseLeave={(event) => {event.stopPropagation(); this.handleToggleOffFieldHighlight(field, value);}}>{valueLabelRendering(field, value)}</button>
              </span>
            )}
          </span>
        );
      }
      return field.value;
    }
    return field.value;
  }

  addCustomValueHandler = (value, name, field) => {
    const type = typesStore.typesMap.get(name);
    let newInstanceId =  instanceStore.createNewInstanceAsOption(appStore.currentWorkspace.id, type, field, value);
    if(newInstanceId){
      instanceStore.instanceHasChanged(this.props.id);
      this.handleFieldFocus(field, {id: newInstanceId});
    }
    return newInstanceId;
  }

  renderField = (name, field) => {
    const { classes, disableLinks } = this.props;
    if (field) {
      if (field.type === "Nested") {
        return (
          <Field name={name} className={classes.nestedField}>
            <div className="btn-group">
              <Field.Remove />
              <Field.MoveUp />
              <Field.MoveDown />
              <Field.Duplicate />
            </div>
            <div className={classes.nestedFieldItem} >
              {Object.entries(field.fields).map(([name, f]) =>
                <React.Fragment key={name}>
                  {this.renderField(name, f)}
                </React.Fragment>
              )}
            </div>
          </Field>
        );
      }
      if (typeof field.type === "string" && field.type.includes("TextArea")) {
        return <Field name={name} readModeRendering={this.renderReadModeField} className={classes.field} />;
      }
      if(field.type === "KgTable") {
        return <Field name={name} className={classes.field}
          onValueClick={this.handleFieldFocus}
          onValueMouseEnter={this.handleToggleOnFieldHighlight}
          onValueMouseLeave={this.handleToggleOffFieldHighlight}
          onAddCustomValue={field.allowCustomValues?this.addCustomValueHandler:undefined} />;
      }
      if (typeof field.type === "string" && (field.type.includes("DropdownSelect") || field.type === "DynamicDropdown") && field.isLink) {
        return <Field name={name} className={classes.field}
          onValueClick={this.handleFieldFocus}
          onValueFocus={this.handleToggleOnFieldHighlight}
          onValueMouseEnter={this.handleToggleOnFieldHighlight}
          onValueBlur={this.handleToggleOffFieldHighlight}
          onValueMouseLeave={this.handleToggleOffFieldHighlight}
          readModeRendering={disableLinks?undefined:this.renderReadModeField}
          onAddCustomValue={field.allowCustomValues?this.addCustomValueHandler:undefined} />;
      }
      return <Field name={name} className={classes.field} />;
    }
    return null;
  }

  render(){
    const { name, instance } = this.props;
    const field = instance.fields[name];
    return this.renderField(name, field);
  }
}


export default InstanceField;