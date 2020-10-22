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

import React, { useEffect } from "react";
import { observer } from "mobx-react";
import { createUseStyles } from "react-jss";

import instancesStore from "../../Stores/InstancesStore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const useStyles = createUseStyles({
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
});

const ListItem = observer(({ index, instanceId, readOnly, disabled, enablePointerEvents, onClick, onDelete, onDragEnd, onDragStart, onDrop, onKeyDown, onFocus, onBlur, onMouseOver, onMouseOut }) => {

  const classes = useStyles();

  useEffect(() => {
    instancesStore.createInstanceOrGet(instanceId).fetchLabel();
  }, [instanceId]);

  const handleClick = e => {
    e.stopPropagation();
    onClick && onClick(index);
  };

  const handleDelete = e => {
    e.stopPropagation();
    onDelete && onDelete(index);
  };

  const handleDragEnd = e => {
    e.stopPropagation();
    onDragEnd && onDragEnd();
  };

  const handleDragOver = e => e.preventDefault();

  const handleDragStart = e => {
    e.stopPropagation();
    onDragStart && onDragStart(index);
  };

  const handleDrop = e => {
    e.stopPropagation();
    onDrop && onDrop(index);
  };

  const handleKeyDown = e => {
    e.stopPropagation();
    onKeyDown && onKeyDown(index, e);
  };

  const handleFocus = e => {
    e.stopPropagation();
    onFocus && onFocus(index);
  };

  const handleBlur = e => {
    e.stopPropagation();
    onBlur && onBlur(index);
  };

  const handleMouseOver = e => {
    e.stopPropagation();
    onMouseOver && onMouseOver(index);
  };

  const handleMouseOut = e => {
    e.stopPropagation();
    onMouseOut && onMouseOut(index);
  };

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
          onClick={handleClick}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onMouseOver={handleMouseOver}
          onMouseOut={handleMouseOut}
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
      onClick={handleClick}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragStart={handleDragStart}
      onDrop={handleDrop}
      onKeyDown={handleKeyDown}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onMouseOver={handleMouseOver}
      onMouseOut={handleMouseOut}
      title={label}
    >
      <span className={classes.valueDisplay}>{label}</span>
      <FontAwesomeIcon className={`quickfire-remove ${classes.remove}`} icon="times" onClick={handleDelete} />
    </div>
  );
});

export default ListItem;