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
import { Glyphicon } from "react-bootstrap";
import injectStyles from "react-jss";

const styles = {
  valueDisplay: {
    display: "inline-block",
    maxWidth: "200px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    verticalAlign: "bottom"
  },
  remove: {
    fontSize: "0.8em",
    opacity: 0.5,
    marginLeft: "3px",
    "&:hover": {
      opacity: 1
    }
  },
  notFound: {
    fontStyle: "italic",
    backgroundColor: "lightgrey",
    "&:hover": {
      backgroundColor: "lightgrey"
    }
  }
};

@injectStyles(styles)
@observer
class ListItem extends React.Component {

  handleDelete = e => {
    e.stopPropagation();
    this.props.onDelete && this.props.onDelete(this.props.index);
  };

  handleDragEnd = e => {
    e.stopPropagation();
    this.props.onDragEnd && this.props.onDragEnd();
  };

  handleDragOver = e => e.preventDefault();

  handleDragStart = e => {
    e.stopPropagation();
    this.props.onDragStart && this.props.onDragStart(this.props.index);
  };

  handleDrop = e => {
    e.stopPropagation();
    this.props.onDrop && this.props.onDrop(this.props.index);
  };

  handleKeyDown = e => {
    e.stopPropagation();
    this.props.onKeyDown && this.props.onKeyDown(this.props.index, e);
  };

  render() {
    const {
      classes,
      value,
      readOnly,
      disabled,
    } = this.props;

    if (readOnly) {
      return (
        <span className="quickfire-readmode-item">{value}</span>
      );
    }

    return (
      <div
        tabIndex={"0"}
        className={`value-tag quickfire-value-tag btn btn-xs btn-default ${disabled ? "disabled" : ""}`}
        disabled={disabled}
        draggable={!!disabled}
        onDragEnd={this.handleDragEnd}
        onDragOver={this.handleDragOver}
        onDragStart={this.handleDragStart}
        onDrop={this.handleDrop}
        onKeyDown={this.handleKeyDown}
        title={value}
      >
        <span className={classes.valueDisplay}>{value}</span>
        <Glyphicon className={`quickfire-remove ${classes.remove}`} glyph="remove" onClick={this.handleDelete} />
      </div>
    );
  }
}

export default ListItem;