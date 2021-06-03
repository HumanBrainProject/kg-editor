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

import React, { useEffect } from "react";
import { observer } from "mobx-react-lite";
import { createUseStyles } from "react-jss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { useStores } from "../../Hooks/UseStores";

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
  },
  notFound: {
    fontStyle: "italic",
    backgroundColor: "lightgrey",
    "&:hover": {
      backgroundColor: "lightgrey"
    }
  }
});

const ListItem = observer(({ index, instanceId, readOnly, disabled, enablePointerEvents, onClick, onDelete, onDragEnd, onDragStart, onDrop, onKeyDown, onFocus, onBlur, onMouseOver, onMouseOut, fetchLabel }) => {

  const classes = useStyles();

  const { instanceStore } = useStores();

  useEffect(() => {
    if (fetchLabel) {
      instanceStore.createInstanceOrGet(instanceId).fetchLabel();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instanceId, fetchLabel]);

  const handleClick = e => {
    if(enablePointerEvents) {
      e.stopPropagation();
      onClick && onClick(index);
    }
  };

  const handleDelete = e => {
    if(enablePointerEvents) {
      e.stopPropagation();
      onDelete && onDelete(index);
    }
  };

  const handleDragEnd = e => {
    if(enablePointerEvents) {
      e.stopPropagation();
      onDragEnd && onDragEnd();
    }
  };

  const handleDragOver = e => e.preventDefault();

  const handleDragStart = e => {
    if(enablePointerEvents) {
      e.stopPropagation();
      onDragStart && onDragStart(index);
    }
  };

  const handleDrop = e => {
    if(enablePointerEvents) {
      e.stopPropagation();
      onDrop && onDrop(index);
    }
  };

  const handleKeyDown = e => {
    if(enablePointerEvents) {
      e.stopPropagation();
      onKeyDown && onKeyDown(index, e);
    }
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

  const instance = instanceStore.instances.get(instanceId);

  const hasError = !instance || instance.fetchError || instance.fetchLabelError;
  const isFetching = instance && (instance.isFetching || instance.isfFetchingLabel);
  const label = instance ? (hasError ? "Not found" : (isFetching ? instance.id : instance.name)) : "Unknown instance";

  if (readOnly) {
    if (!enablePointerEvents) {
      return (
        <span className={classes.value}>{label}</span>
      );
    }

    return (
      <div className={`btn btn-xs btn-default ${classes.valueTag} ${hasError ? classes.notFound : ""}`}
        onClick={handleClick}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onMouseOver={handleMouseOver}
        onMouseOut={handleMouseOut}
      >{label}
      </div>
    );
  }

  return (
    <div
      tabIndex={"0"}
      className={`btn btn-xs btn-default ${classes.valueTag} ${disabled ? "disabled" : ""} ${hasError ? classes.notFound : ""}`}
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
      <span className={classes.valueLabel}>{label}</span>
      {!disabled && <FontAwesomeIcon className={classes.remove} icon="times" onClick={handleDelete} />}
    </div>
  );
});
ListItem.displayName = "ListItem";

export default ListItem;