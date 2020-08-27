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
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const styles = {
  dropdownLink: {
    color: "var(--ft-color-normal)",
    fontSize: "0.9em",
    textDecoration: "none",
    "&:hover": {
      color: "var(--ft-color-loud)",
      textDecoration: "none"
    }
  }
};

@injectStyles(styles)
@observer
class CustomDropdownToggle extends React.Component {
  handleClick = e => {
    e.preventDefault();
    this.props.onClick(e);
  }

  render() {
    const { classes } = this.props;
    return (
      <a onClick={this.handleClick} className={classes.dropdownLink}>
        {this.props.children} <FontAwesomeIcon icon={"caret-down"} />
      </a>
    );
  }
}

export default CustomDropdownToggle;