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
import { observer } from "mobx-react";
import injectStyles from "react-jss";
import { ControlLabel, FormGroup, FormControl } from "react-bootstrap";
import autosize from "autosize";
import getLineHeight from "line-height";

import Alternatives from "../Alternatives";

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

const FieldValue = ({field, splitLines}) => {
  const { value } = field;
  const val = !value || typeof value === "string"? value:value.toString();

  if (splitLines) {
    return renderLines(val);
  }

  return (
    <span className="quickfire-readmode-value">&nbsp;{val}</span>
  );
};

const AlternativeValue = ({value}) => value;

@injectStyles(styles)
@observer
class InputText extends React.Component {
  componentDidMount() {
    this.handleAutosize();
  }

  componentDidUpdate() {
    this.handleAutosize();
  }

  handleAutosize() {
    if (!this.props.autosize) {
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

  handleChange = e => this.props.fieldStore.setValue(e.target.value);

  handleSelectAlternative = value => this.props.fieldStore.setValue(value);

  handleRemoveMySuggestion = () => this.props.fieldStore.setValue(null);

  render() {
    const { classes, className, readMode } = this.props;

    if(this.props.readMode){
      return this.renderReadMode();
    }

    const {
      value,
      inputType,
      rows,
      returnAsNull,
      alternatives,
      label
    } = this.props.fieldStore;

    return (
      <div className={className}>
        <FormGroup className={`quickfire-field-input-text ${classes.container?classes.container:""} ${!value? "quickfire-empty-field": ""} ${readMode? "quickfire-field-readonly": ""}`} >
          <ControlLabel className={"quickfire-label"}>{label}</ControlLabel>
          <Alternatives
            className={classes.alternatives}
            list={alternatives}
            onSelect={this.handleSelectAlternative}
            onRemove={this.handleRemoveMySuggestion}
            parentContainerClassName="form-group"
            ValueRenderer={AlternativeValue}
          />
          <FormControl
            value={value}
            type={inputType}
            className={"quickfire-user-input"}
            componentClass={this.props.componentClass}
            onChange={this.handleChange}
            inputRef={ref=>this.inputRef = ref}
            disabled={returnAsNull}
            rows={rows}
          />
        </FormGroup>
      </div>
    );
  }

  renderReadMode(){
    const { className, fieldStore } = this.props;
    const { value, label } = fieldStore;
    return (
      <div className={className}>
        <div className={`quickfire-field-input-text ${!value? "quickfire-empty-field": ""} quickfire-readmode ${this.props.classes.readMode} quickfire-field-readonly`}>
          <ControlLabel className={"quickfire-label"}>{label}</ControlLabel>
          <FieldValue field={this.props.fieldStore} splitLines={this.props.componentClass === "textarea"} />
        </div>
      </div>
    );
  }
}

export default InputText;