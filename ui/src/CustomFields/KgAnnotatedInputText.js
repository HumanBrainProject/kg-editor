import React from "react";
import { inject, observer } from "mobx-react";
import { Components } from "hbp-quickfire";
import FieldError from "./FieldError";

const InputTextMultiple =  Components.InputTextMultiple;

@inject("formStore")
@observer
export default class KgAnnotatedInputText extends React.Component {

  render() {
    return (
      <FieldError id={this.props.formStore.structure.fields.id.nexus_id} field={this.props.field}>
        <InputTextMultiple {...this.props}  />
      </FieldError>
    );
  }
}