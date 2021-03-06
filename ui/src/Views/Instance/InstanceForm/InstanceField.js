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
import instanceStore from "../../../Stores/InstanceStore";
import RenderMarkdownField from "../../../Components/Markdown";

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
export default class InstanceField extends React.Component{

  componentDidMount() {
    const { instance, name } = this.props;
    const field = instance.data.fields[name];
    if(field && field.type === "KgTable") {
      const store = instance.form.structure.fields[name];
      store.isInteractive = true;
    }
  }

  handleFieldFocus = (field, value) => {
    if (field && field.isLink && value && value.id) {
      this.handleToggleOffFieldHighlight(field, value);
      setTimeout(() => {
        instanceStore.setCurrentInstanceId(this.props.mainInstanceId, value.id, this.props.level + 1);
        const target = document.querySelector(`[data-provenence="${field.label}"] [data-id="${value.id}"]`);
        if (target && target.childNodes && target.childNodes[0] && target.childNodes[0].firstChild.firstChild.getElementsByClassName("fa-w-16")[0]) {
          target.childNodes[0].firstChild.firstChild.getElementsByClassName("fa-w-16")[0].scrollIntoView({behavior:"smooth", block:"center"});
        }
        this.props.paneStore.selectPane(`ChildrenOf${this.props.id}`);
      });
    }
  }

  handleToggleOnFieldHighlight = (field, value) => {
    if (field && field.isLink && value && value.id) {
      instanceStore.setInstanceHighlight(value.id, field.label);
      const target = document.querySelector(`[data-provenence="${field.label}"] [data-id="${value.id}"]`);
      if (target && target.childNodes && target.childNodes[0] && target.childNodes[0].firstChild.firstChild.getElementsByClassName("fa-w-16")[0]) {
        target.childNodes[0].firstChild.firstChild.getElementsByClassName("fa-w-16")[0].scrollIntoView({behavior:"smooth", block:"center"});
      }
    }
  }

  handleToggleOffFieldHighlight = (field, value) => {
    if (field && field.isLink && value && value.id) {
      instanceStore.setInstanceHighlight(value.id, null);
    }
  }

  renderReadModeField = field => {
    const { classes } = this.props;
    if (field) {
      if (typeof field.type === "string" && field.type.includes("TextArea")) {
        /*
        if (this.props.id !== this.props.mainInstanceId && this.props.id !== instanceStore.getCurrentInstanceId(this.props.mainInstanceId) && this.props.level !== 0) {
          if (field.value && field.value.length && field.value.length >= 200) {
            return field.value.substr(0,197) + "...";
          }
          return field.value;
        }
        */
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

  addCustomValueHandler = async (value, field) => {
    let newInstanceId = await instanceStore.createNewInstanceAsOption(field, value);
    if(newInstanceId){
      instanceStore.instanceHasChanged(this.props.id);
      this.handleFieldFocus(field, {id: newInstanceId});
    }
    return newInstanceId;
  }

  render(){
    const { classes, name, instance, disableLinks } = this.props;
    const field = instance.data.fields[name];
    if (field) {
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
}
