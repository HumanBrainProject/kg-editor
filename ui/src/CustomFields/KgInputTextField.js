/*
 * Copyright 2018 - 2021 Swiss Federal Institute of Technology Lausanne (EPFL)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * This open source software code was developed in part or in whole in the
 * Human Brain Project, funded from the European Union's Horizon 2020
 * Framework Programme for Research and Innovation under
 * Specific Grant Agreements No. 720270, No. 785907, and No. 945539
 * (Human Brain Project SGA1, SGA2 and SGA3).
 *
 */

import React from "react";
import { inject, observer } from "mobx-react";
import injectStyles from "react-jss";
import { FormGroup, FormControl, InputGroup, Button, Glyphicon, Alert } from "react-bootstrap";
import autosize from "autosize";
import getLineHeight from "line-height";
import { isFunction } from "lodash";

import FieldLabel from "hbp-quickfire/lib/Components/FieldLabel";
import clipboard from "hbp-quickfire/lib/Stores/ClipboardStore";

import Alternatives from "./Alternatives";

import instanceStore from "../Stores/InstanceStore";
import FieldError from "./FieldError";

const styles = {
  readMode: {
    "& .quickfire-label:after":{
      content: "':\\00a0'"
    }
  },
  alternatives: {
    marginLeft: "3px"
  }
};

@injectStyles(styles)
@inject("formStore")
@observer
/**
 * A simple text input
 * @class KgInputTextField
 * @memberof FormFields
 * @namespace KgInputTextField
 */
export default class KgInputTextField extends React.Component {
  static defaultProps = {
    componentClass: undefined
  };

  handleAutosize() {
    if (!this.props.field.autosize) {
      return;
    }
    if (this.inputRef) {
      if (this.inputRef != this.autosizedRef) { // the input ref may change over time. For instance when readmode is toggled. Therefore we might have to autosize the input multiple times over the component lifecycle.
        autosize(this.inputRef);
        this.autosizedRef = this.inputRef;
        this.lineHeight = getLineHeight(this.inputRef);
      } else {
        autosize.update(this.inputRef);
      }
    }
  }

  componentDidMount() {
    this.handleAutosize();
  }

  componentDidUpdate() {
    this.handleAutosize();
  }

  handleChange = e => {
    let field = this.props.field;
    //This shouldn't be necessary although some inputType don't behave well with readOnly => see inputType color
    if(!field.disabled && !field.readOnly){
      this.beforeSetValue(e.target.value);
    }
  };

  //The only way to trigger an onChange event in React is to do the following
  //Basically changing the field value, bypassing the react setter and dispatching an "input"
  // event on a proper html input node
  //See for example the discussion here : https://stackoverflow.com/a/46012210/9429503
  triggerOnChange = () => {
    const selectedInstance = instanceStore.instances.get(this.props.formStore.structure.fields.id.nexus_id);
    const prototype = this.props.componentClass === "textarea"?window.HTMLTextAreaElement.prototype:window.HTMLInputElement.prototype;
    if (selectedInstance && this.props.field.value === null) {
      Object.getOwnPropertyDescriptor(prototype, "disabled").set
        .call(this.inputRef, true);
      selectedInstance.setFieldAsNull(this.props.field.path.substr(1));
    } else {
      Object.getOwnPropertyDescriptor(prototype, "disabled").set
        .call(this.inputRef, false);
    }
    Object.getOwnPropertyDescriptor(prototype, "value").set
      .call(this.inputRef, this.props.field.value);
    var event = new Event("input", { bubbles: true });
    this.inputRef.dispatchEvent(event);
  }

  handlePaste = () => {
    this.beforeSetValue(clipboard.selection);
    this.triggerOnChange();
  }

  beforeSetValue(value){
    if(isFunction(this.props.onBeforeSetValue)){
      this.props.onBeforeSetValue(() => {this.props.field.setValue(value);}, this.props.field, value);
    } else {
      this.props.field.setValue(value);
    }
  }

  handleAlternativeSelect = value => {
    this.beforeSetValue(value);
    this.triggerOnChange();
  }

  handleRemoveSuggestion = () => {
    let _value = null;
    this.beforeSetValue(_value);
    this.triggerOnChange();
  }

  getStyle = () => {
    let { style = {} } = this.props;
    let { maxRows, resizable } = this.props.field;

    const maxHeight = maxRows && this.lineHeight ? this.lineHeight * (maxRows + 1) : null;
    const resize = resizable ? null : "none";

    style = {
      ...style,
      ...(maxHeight ? {maxHeight} : {}),
      ...(resize ? {resize} : {})
    };

    return style;
  }

  render() {

    const { classes, formStore } = this.props;

    if(this.props.formStore.readMode || this.props.field.readMode){
      return this.renderReadMode();
    }

    let {
      value,
      inputType,
      autoComplete,
      useVirtualClipboard,
      disabled,
      readOnly,
      validationErrors,
      validationState,
      placeholder,
      rows,
      path
    } = this.props.field;

    let selectedInstance = instanceStore.instances.get(this.props.formStore.structure.fields.id.nexus_id);
    let isAlternativeDisabled = !selectedInstance || selectedInstance.fieldsToSetAsNull.includes(path.substr(1));

    const style = this.getStyle();

    const formControl = () => (
      <FormControl
        value={value}
        type={inputType}
        className={"quickfire-user-input"}
        componentClass={this.props.componentClass}
        onChange={this.handleChange}
        inputRef={ref=>this.inputRef = ref}
        disabled={disabled || isAlternativeDisabled}
        readOnly={readOnly}
        placeholder={placeholder}
        style={style}
        rows={rows}
        autoComplete={autoComplete?"on":"off"}
      />
    );

    const fieldPath = (typeof path === "string")?path.substr(1):null; // remove first | char
    const alternatives = ((fieldPath && formStore && formStore.structure && formStore.structure.alternatives && formStore.structure.alternatives[fieldPath])?formStore.structure.alternatives[fieldPath]:[])
      .sort((a, b) => a.selected === b.selected?0:(a.selected?-1:1))
      .map(alternative => ({
        value: alternative.value,
        userIds: alternative.userIds,
        selected: !!alternative.selected
      }));

    return (
      <FieldError id={this.props.formStore.structure.fields.id.nexus_id} field={this.props.field}>
        <FormGroup className={`quickfire-field-input-text ${classes.container?classes.container:""} ${!value? "quickfire-empty-field": ""} ${disabled? "quickfire-field-disabled": ""} ${readOnly? "quickfire-field-readonly": ""}`} validationState={validationState}>
          <FieldLabel field={this.props.field}/>
          <Alternatives className={classes.alternatives}
            show={!disabled && !readOnly && !!alternatives.length}
            disabled={disabled || readOnly || isAlternativeDisabled}
            list={alternatives}
            onSelect={this.handleAlternativeSelect}
            onClick={this.handleRemoveSuggestion}
            parentContainerClassName="form-group" />
          {useVirtualClipboard?
            <InputGroup>
              {formControl()}
              <InputGroup.Button>
                <Button className={"quickfire-paste-button"} onClick={this.handlePaste}>
                  <Glyphicon glyph="paste"/>
                </Button>
              </InputGroup.Button>
            </InputGroup>
            :
            formControl()
          }
          {validationErrors && <Alert bsStyle="danger">
            {validationErrors.map(error => <p key={error}>{error}</p>)}
          </Alert>}
        </FormGroup>
      </FieldError>
    );
  }

  renderReadMode(){
    let {
      value,
      disabled,
      readOnly
    } = this.props.field;

    const { classes } = this.props;

    const lines = typeof value === "string"?value.split("\n"):[];

    return (
      <FieldError id={this.props.formStore.structure.fields.id.nexus_id} field={this.props.field}>
        <div className={`quickfire-field-input-text ${!value? "quickfire-empty-field": ""} quickfire-readmode ${classes.readMode} ${disabled? "quickfire-field-disabled": ""} ${readOnly? "quickfire-field-readonly": ""}`}>
          <FieldLabel field={this.props.field}/>
          {isFunction(this.props.readModeRendering)?
            this.props.readModeRendering(this.props.field)
            : this.props.componentClass === "textarea"?
              <div className="quickfire-readmode-value quickfire-readmode-textarea-value">
                {lines.map((line, index) => {
                  return(
                    <p key={line+(""+index)}>{line}</p>
                  );
                })}
              </div>
              :
              <span className="quickfire-readmode-value">&nbsp;{value}</span>
          }
        </div>
      </FieldError>
    );
  }
}