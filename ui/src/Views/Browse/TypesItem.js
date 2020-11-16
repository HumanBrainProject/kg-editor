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
import { createUseStyles } from "react-jss";
import { observer } from "mobx-react-lite";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { useStores } from "../../Hooks/UseStores";

const useStyles = createUseStyles({
  container: {
    padding: "5px 5px 5px 30px",
    borderLeft: "2px solid transparent",
    color: "var(--ft-color-normal)",
    cursor: "pointer",
    position: "relative",
    "&:hover": {
      background: "var(--list-bg-hover)",
      borderColor: "var(--list-border-hover)",
      color: "var(--ft-color-loud)",
      "& $actions": {
        opacity: 0.75
      },
      "& $createInstance": {
        position: "absolute",
        top: "0",
        right: "0",
        height: "100%",
        padding: "5px 10px",
        display: "block",
        color: "var(--ft-color-normal)",
        "&:hover": {
          color: "var(--ft-color-loud)",
        }
      }
    },
    "&.selected": {
      background: "var(--list-bg-selected)",
      borderColor: "var(--list-border-selected)",
      color: "var(--ft-color-loud)"
    },
    "&.edited": {
      padding: "0 5px 0 30px"
    },
    "&.disabled": {
      pointerEvents: "none",
      opacity: "0.8"
    }
  },
  icon: {
    position: "absolute",
    top: "8px",
    "& + span": {
      display: "inline-block",
      marginLeft: "22px"
    }
  },
  actions: {
    position: "absolute",
    top: "2px",
    right: "10px",
    display: "grid",
    opacity: 0,
    width: "25px",
    gridTemplateColumns: "repeat(1, 1fr)",
    "&:hover": {
      opacity: "1 !important"
    }
  },
  action: {
    fontSize: "0.9em",
    lineHeight: "27px",
    textAlign: "center",
    backgroundColor: "var(--bg-color-ui-contrast2)",
    color: "var(--ft-color-normal)",
    "&:hover": {
      color: "var(--ft-color-loud)"
    },
    "&:first-child": {
      borderRadius: "4px 0 0 4px"
    },
    "&:last-child": {
      borderRadius: "0 4px 4px 0"
    },
    "&:first-child:last-child": {
      borderRadius: "4px"
    }
  },
  deleteBookmarkDialog: {
    position: "absolute",
    top: 0,
    right: "-200px",
    transition: "right .2s ease",
    "&.show": {
      right: "5px"
    }
  },
  error: {
    position: "absolute",
    top: "5px",
    right: "10px",
  },
  errorButton: {
    color: "var(--ft-color-error)"
  },
  textError: {
    margin: 0,
    wordBreak: "keep-all"
  },
  createInstance: {
    display: "none",
    cursor: "pointer"
  }
});


const TypesItem = observer(({ type }) => {

  const classes = useStyles();

  const { appStore, browseStore, instanceStore } = useStores();

  const handleSelect = e => {
    e && e.stopPropagation();
    browseStore.selectItem(type);
  };

  const handleCreateInstance = () => instanceStore.createNewInstanceOfType(type);

  const selected = browseStore.selectedItem === type;
  const color = type.color;

  return (
    <div
      key={type.id}
      className={`${classes.container} ${selected ? "selected" : ""} ${browseStore.isFetching.instances?"disabled":""}`}
      onClick={handleSelect} title={type.label}>
      {color ?
        <FontAwesomeIcon fixedWidth icon="circle" className={`${classes.icon} ${classes.typeIcon}`} style={{ color: color }} />
        :
        <FontAwesomeIcon icon={"code-branch"} className={`${classes.icon} ${classes.typeIcon}`} />
      }
      <span>{type.label}</span>
      {appStore.currentWorkspacePermissions.canCreate && (
        appStore.isCreatingNewInstance ?
          <div className={classes.createInstance}>
            <FontAwesomeIcon icon={"circle-notch"} spin />
          </div>
          :
          <div className={classes.actions}>
            <div className={classes.action} onClick={handleCreateInstance} title={`create a new ${type.label}`}>
              <FontAwesomeIcon icon={"plus"} />
            </div>
          </div>
      )}
    </div>
  );
});
TypesItem.displayName = "TypesItem";

export default TypesItem;