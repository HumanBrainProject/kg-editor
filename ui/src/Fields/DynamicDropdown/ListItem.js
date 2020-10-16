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

import instancesStore from "../../Stores/InstancesStore";

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

  componentDidMount() {
    this.fetchInstance();
  }

  componentDidUpdate(previousProps) {
    if (previousProps.instanceId !== this.props.instanceId) {
      this.fetchInstance();
    }
  }

  fetchInstance = () => {
    const { instanceId } = this.props;
    instanceId && instancesStore.createInstanceOrGet(instanceId).fetchLabel();
  };

  handleClick = e => {
    e.stopPropagation();
    this.props.onClick && this.props.onClick(this.props.index);
  };

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

  handleFocus = e => {
    e.stopPropagation();
    this.props.onFocus && this.props.onFocus(this.props.index);
  };

  handleBlur = e => {
    e.stopPropagation();
    this.props.onBlur && this.props.onBlur(this.props.index);
  };

  handleMouseOver = e => {
    e.stopPropagation();
    this.props.onMouseOver && this.props.onMouseOver(this.props.index);
  };

  handleMouseOut = e => {
    e.stopPropagation();
    this.props.onMouseOut && this.props.onMouseOut(this.props.index);
  };

  render() {
    const {
      classes,
      instanceId,
      readOnly,
      disabled,
      enablePointerEvents
    } = this.props;

    const instance = instancesStore.instances.get(instanceId);

    const hasError = !instance || instance.fetchError || instance.fetchLabelError;
    const isFetching = instance && (instance.isFetching || instance.isfFetchingLabel);
    const label = instance ? (hasError ? "Not found" : (isFetching ? instance.id : instance.name)) : "Unknown instance";

    if (readOnly) {
      if (!enablePointerEvents) {
        return (
          <span className="quickfire-readmode-item">{label}</span>
        );
      }

      return (
        <span className="quickfire-readmode-item">
          <button type="button" className={`btn btn-xs btn-default ${hasError ? classes.notFound : ""}`}
            onClick={this.handleClick}
            onFocus={this.handleFocus}
            onBlur={this.handleBlur}
            onMouseOver={this.handleMouseOver}
            onMouseOut={this.handleMouseOut}
          >{label}</button>
        </span>
      );
    }

    return (
      <div
        tabIndex={"0"}
        className={`value-tag quickfire-value-tag btn btn-xs btn-default ${disabled ? "disabled" : ""} ${hasError ? classes.notFound : ""}`}
        disabled={disabled}
        draggable={!!disabled}
        onClick={this.handleClick}
        onDragEnd={this.handleDragEnd}
        onDragOver={this.handleDragOver}
        onDragStart={this.handleDragStart}
        onDrop={this.handleDrop}
        onKeyDown={this.handleKeyDown}
        onFocus={this.handleFocus}
        onBlur={this.handleBlur}
        onMouseOver={this.handleMouseOver}
        onMouseOut={this.handleMouseOut}
        title={label}
      >
        <span className={classes.valueDisplay}>{label}</span>
        <Glyphicon className={`quickfire-remove ${classes.remove}`} glyph="remove" onClick={this.handleDelete} />
      </div>
    );
  }
}

export default ListItem;