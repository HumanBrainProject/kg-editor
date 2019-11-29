/**
 * Copyright (c) Human Brain Project
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from "react";
import KgInputTextField from "./KgInputTextField";

/**
 * Textarea input field.
 * Field options are the same as for the InputTextField
 * @class KgTextAreaField
 * @memberof FormFields
 * @namespace KgTextAreaField
 */

class KgTextAreaField extends React.Component {
  render() {
    return (
      <KgInputTextField {...this.props} componentClass="textarea" />
    );
  }
}

export default KgTextAreaField;