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
import { observer } from "mobx-react-lite";
import { createUseStyles } from "react-jss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const useStyles = createUseStyles({
  value: {
    "&:not(:last-child):after":{
      content: "';\\00a0'"
    }
  },
  valueTag: {
    marginBottom: "5px",
    padding: "1px 5px",
    border: "1px solid #ced4da",
    "&:hover": {
      backgroundColor: "#a5c7e9",
      borderColor: "#337ab7",
      color: "#143048"
    },
    "& + $valueTag": {
      marginLeft: "5px"
    }
  },
  valueLabel: {
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
  }
});

const ListItem = observer(({ index, value, readOnly, disabled, onDelete, onDragStart, onDragEnd, onDrop, onKeyDown }) => {

  const classes = useStyles();

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

  if (readOnly) {
    return (
      <span className={classes.value}>{value}</span>
    );
  }

  return (
    <div
      tabIndex={"0"}
      className={`btn btn-xs btn-default ${classes.valueTag} ${disabled ? "disabled" : ""}}`}
      disabled={disabled}
      draggable={!!disabled}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragStart={handleDragStart}
      onDrop={handleDrop}
      onKeyDown={handleKeyDown}
      title={value}
    >
      <span className={classes.valueLabel}>{value}</span>
      <FontAwesomeIcon className={classes.remove} icon="times" onClick={handleDelete} />
    </div>
  );
});

export default ListItem;