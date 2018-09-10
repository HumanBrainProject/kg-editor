import React from "react";
import injectStyles from "react-jss";
import { observer, inject } from "mobx-react";
import { uniqueId } from "lodash";
import { Field } from "hbp-quickfire";

const styles = {
  field: {
    "& textarea": {
      minHeight: "200px"
    },
    "& .quickfire-field-dropdown-select .quickfire-readmode-item button": {
      margin: "0 1px 3px 2px"
    },
    "& .btn.quickfire-value-tag:hover, & .btn.quickfire-value-tag:focus, & .quickfire-field-dropdown-select .quickfire-readmode-item button:hover, & .quickfire-field-dropdown-select .quickfire-readmode-item button:focus": {
      backgroundColor: "#a5c7e9",
      borderColor: "#337ab7",
      color: "#143048"
    },
    "& .quickfire-field-input-text.quickfire-readmode, & .quickfire-field-dropdown-select.quickfire-readmode": {
      marginBottom: "5px"
    },
    "& .quickfire-field-input-text.quickfire-readmode label.quickfire-label, & .quickfire-field-dropdown-select.quickfire-readmode label.quickfire-label": {
      marginBottom: "0"
    },
    "& .quickfire-field-disabled.quickfire-empty-field, .quickfire-field-readonly.quickfire-empty-field": {
      display: "none"
    }
  }
};

@injectStyles(styles)
@inject("instanceStore")
@inject("paneStore")
@observer
export default class InstanceField extends React.Component{

  handleFieldFocus = (field, value) => {
    if (field && field.isLink && value && value.id) {
      this.handleToggleOffFieldHighlight(field, value);
      setTimeout(() => {
        this.props.instanceStore.setCurrentInstanceId(value.id, this.props.level + 1);
        const target = document.querySelector(`[data-provenence="${field.label}"] [data-id="${value.id}"]`);
        if (target) {
          target.scrollIntoViewIfNeeded();
        }
        this.props.paneStore.selectNextPane();
      });
    }
  }

  handleToggleOnFieldHighlight = (field, value) => {
    if (field && field.isLink && value && value.id) {
      this.props.instanceStore.setInstanceHighlight(value.id, field.label);
      const target = document.querySelector(`[data-provenence="${field.label}"] [data-id="${value.id}"]`);
      if (target) {
        target.scrollIntoViewIfNeeded();
      }
    }
  }

  handleToggleOffFieldHighlight = (field, value) => {
    if (field && field.isLink && value && value.id) {
      this.props.instanceStore.setInstanceHighlight(value.id, null);
    }
  }

  renderReadModeField = (field) => {
    if (field) {
      if (field.type === "TextArea") {
        if (this.props.id !== this.props.instanceStore.mainInstanceId && this.props.id !== this.props.instanceStore.currentInstanceId && this.props.level !== 0) {
          if (field.value && field.value.length && field.value.length >= 200) {
            return field.value.substr(0,197) + "...";
          }
          return field.value;
        }
        return field.value;

      } else if (field.type === "DropdownSelect") {
        return (
          <span className="quickfire-readmode-list">
            {field.value.map(value =>
              <span key={value.id} className="quickfire-readmode-item">
                <button type="button" className="btn btn-xs btn-default"
                  onClick={(event) => {event.stopPropagation(); this.handleFieldFocus(field, value);}}
                  onFocus={(event) => {event.stopPropagation(); this.handleToggleOnFieldHighlight(field, value);}}
                  onMouseEnter={(event) => {event.stopPropagation(); this.handleToggleOnFieldHighlight(field, value);}}
                  onBlur={(event) => {event.stopPropagation(); this.handleToggleOffFieldHighlight(field, value);}}
                  onMouseLeave={(event) => {event.stopPropagation(); this.handleToggleOffFieldHighlight(field, value);}}>{value.label}</button>
              </span>
            )}
          </span>
        );
      }
      return field.value;
    }
    return field.value;
  }

  addCustomValueHandler = (value, field) => {
    const id = `${field.instancesPath}/${uniqueId("___NEW___")}`;
    field.options.push({
      [field.mappingValue]: id,
      [field.mappingLabel]: value
    });
    field.addValue(field.options[field.options.length-1]);
    this.props.instanceStore.instanceHasChanged(this.props.id);
    this.handleFieldFocus(field, {id: id});
  }

  render(){
    const { classes, name, instance } = this.props;
    const field = instance.data.fields[name];
    const readOnlyMode = this.props.instanceStore.readOnlyMode;
    if (field) {
      if (field.type === "TextArea")  {
        return <Field key={name} name={name} readModeRendering={this.renderReadModeField} className={classes.field} />;
      }
      if (field.type === "DropdownSelect" && field.isLink) {
        return <Field key={name} name={name} className={classes.field}
          onValueClick={this.handleFieldFocus}
          onValueFocus={this.handleToggleOnFieldHighlight}
          onValueMouseEnter={this.handleToggleOnFieldHighlight}
          onValueBlur={this.handleToggleOffFieldHighlight}
          onValueMouseLeave={this.handleToggleOffFieldHighlight}
          readModeRendering={readOnlyMode?undefined:this.renderReadModeField}
          onAddCustomValue={field.allowCustomValues?this.addCustomValueHandler:undefined} />;
      }
      return <Field key={name} name={name} className={classes.field} />;
    }
    return null;
  }
}