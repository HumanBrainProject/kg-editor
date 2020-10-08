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
import { inject, observer } from "mobx-react";
import injectStyles from "react-jss";
import { FormGroup, FormControl, Alert } from "react-bootstrap";
import autosize from "autosize";
import getLineHeight from "line-height";
import { isFunction } from "lodash";

import FieldLabel from "hbp-quickfire/lib/Components/FieldLabel";
import clipboard from "hbp-quickfire/lib/Stores/ClipboardStore";

import Alternatives from "../Alternatives";
import FieldError from "../FieldError";

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

const renderLines = value => {
  const lines = typeof value === "string"?value.split("\n"):[];
  return (
    <div className="quickfire-readmode-value quickfire-readmode-textarea-value">
      {lines.map((line, index) => {
        return(
          <p key={line+(""+index)}>{line}</p>
        );
      })}
    </div>
  );
};

const FieldValue = ({field, readModeRendering, splitLines}) => {

  if (isFunction(readModeRendering)) {
    return readModeRendering(field);
  }

  const { value } = field;
  const val = !value || typeof value === "string"? value:value.toString();

  if (splitLines) {
    return renderLines(val);
  }

  return (
    <span className="quickfire-readmode-value">&nbsp;{val}</span>
  );
};

@inject("formStore")
@injectStyles(styles)
@observer
class InputText extends React.Component {
  static defaultProps = {
    componentClass: undefined
  };

  componentDidMount() {
    this.handleAutosize();
  }

  componentDidUpdate() {
    this.handleAutosize();
  }

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

  handleChange = e => {
    if(!this.props.field.disabled && !this.props.field.readOnly){
      this.props.field.setValue(e.target.value);
    }
  };

  handlePaste = () => this.props.field.setValue(clipboard.selection);

  handleSelectAlternative = value => this.props.field.setValue(value);

  handleRemoveMySuggestion = () => this.props.field.setValue(null);

  render() {
    const { classes, formStore } = this.props;

    if(this.props.formStore.readMode || this.props.field.readMode){
      return this.renderReadMode();
    }

    const {
      value,
      inputType,
      autoComplete,
      disabled,
      readOnly,
      validationErrors,
      validationState,
      placeholder,
      rows,
      path,
      returnAsNull
    } = this.props.field;

    const fieldPath = (typeof path === "string")?path.substr(1):null; // remove first | char
    const alternatives = ((fieldPath && formStore && formStore.structure && formStore.structure.alternatives && formStore.structure.alternatives[fieldPath])?formStore.structure.alternatives[fieldPath]:[])
      .sort((a, b) => a.selected === b.selected?0:(a.selected?-1:1))
      .map(alternative => ({
        value: alternative.value,
        users: alternative.users,
        selected: !!alternative.selected
      }));

    return (
      <FieldError id={this.props.formStore.structure.id} field={this.props.field}>
        <FormGroup className={`quickfire-field-input-text ${classes.container?classes.container:""} ${!value? "quickfire-empty-field": ""} ${disabled? "quickfire-field-disabled": ""} ${readOnly? "quickfire-field-readonly": ""}`} validationState={validationState}>
          <FieldLabel field={this.props.field}/>
          <Alternatives
            className={classes.alternatives}
            show={!disabled && !readOnly && !!alternatives.length}
            disabled={disabled || readOnly || returnAsNull}
            list={alternatives}
            onSelect={this.handleSelectAlternative}
            onRemove={this.handleRemoveMySuggestion}
            parentContainerClassName="form-group"
          />
          <FormControl
            value={value}
            type={inputType}
            className={"quickfire-user-input"}
            componentClass={this.props.componentClass}
            onChange={this.handleChange}
            inputRef={ref=>this.inputRef = ref}
            disabled={disabled || returnAsNull}
            readOnly={readOnly}
            placeholder={placeholder}
            rows={rows}
            autoComplete={autoComplete?"on":"off"}
          />
          {validationErrors && <Alert bsStyle="danger">
            {validationErrors.map(error => <p key={error}>{error}</p>)}
          </Alert>}
        </FormGroup>
      </FieldError>
    );
  }


  renderReadMode(){
    const { classes, field, formStore, readModeRendering, componentClass } = this.props;
    const { value, disabled, readOnly} = field;
    return (
      <FieldError id={formStore.structure.id} field={field}>
        <div className={`quickfire-field-input-text ${!value? "quickfire-empty-field": ""} quickfire-readmode ${classes.readMode} ${disabled? "quickfire-field-disabled": ""} ${readOnly? "quickfire-field-readonly": ""}`}>
          <FieldLabel field={field}/>
          <FieldValue field={field} readModeRendering={readModeRendering} splitLines={componentClass=== "textarea"} />
        </div>
      </FieldError>
    );
  }
}

export default InputText;