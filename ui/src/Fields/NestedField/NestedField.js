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

import React, { useRef } from "react";
import { observer } from "mobx-react-lite";
import { createUseStyles } from "react-jss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import Label from "../Label";
import Field from "../Field";
import Add from "./Add";
import { ViewContext, PaneContext } from "../../Stores/ViewStore";
import { compareField } from "../../Stores/Instance";

const useStyles = createUseStyles({
  label: {},
  readMode:{
    "& $label:after": {
      content: "':\\00a0'"
    }
  },
  form: {
    position: "relative",
    border: "1px solid #ced4da",
    borderRadius: ".25rem",
    padding: "10px",
  },
  item: {
    position: "relative",
    border: "1px solid #ced4da",
    borderRadius: ".25rem",
    padding: "10px",
    minHeight: "40px",
    "&:hover": {
      "& $actions": {
        opacity: 1
      }
    },
    "& + $item": {
      marginTop: "10px"
    }
  },
  field: {
    marginBottom: 0,
    "& + $field": {
      marginTop: "1rem"
    }
  },
  actions: {
    position: "absolute",
    top: "5px",
    right: "10px",
    display: "flex",
    alignItems: "flex-end",
    opacity: 0,
    "&:hover": {
      opacity: 1
    }
  },
  action: {
    fontSize: "0.9em",
    lineHeight: "27px",
    textAlign: "center",
    backgroundColor: "var(--button-secondary-bg-color)",
    color: "var(--ft-color-loud)",
    cursor: "pointer",
    width: "25px",
    "&:hover": {
      backgroundColor: "var(--button-secondary-active-bg-color)",
    },
    "&:first-child": {
      borderRadius: "4px 0 0 4px"
    },
    "&:last-child": {
      borderRadius: "0 4px 4px 0"
    },
    "&$single": {
      borderRadius: "4px"
    }
  },
  single: {},
  actionBtn: {
    marginTop: "10px",
    "&$noItems": {
      marginTop: "0"
    }
  },
  noItems: {}
});

const Action = ({ icon, title, single, onClick }) => {

  const classes = useStyles();

  const handleClick = e => {
    e.stopPropagation();
    if (!e.currentTarget.contains(e.target)) {
      return;
    }
    typeof onClick === "function" && onClick();
  };

  return (
    <div className={`${classes.action} ${single?classes.single:""}`} onClick={handleClick} title={title}>
      <FontAwesomeIcon icon={icon} />
    </div>
  );
};

const Item = ({ itemFieldStores, readMode, active, index, total, onDelete, onMoveUp, onMoveDown }) => {

  const classes = useStyles();

  const view = React.useContext(ViewContext);
  const pane = React.useContext(PaneContext);

  const handleDelete = () => onDelete(index);
  const handleMoveUp = () => onMoveUp(index);
  const handleMoveDown = () => onMoveDown(index);

  const sortedStores = Object.values(itemFieldStores).sort((a, b) => compareField(a, b, true));

  return (
    <div className={classes.item}>
      {sortedStores.map(store => (
        <Field key={store.fullyQualifiedName} name={store.fullyQualifiedName} className={classes.field} fieldStore={store} view={view} pane={pane} readMode={readMode} enablePointerEvents={true} showIfNoValue={false} />
      ))}
      {!readMode && active && (
        <div className={classes.actions} >
          <Action icon="times" onClick={handleDelete} single={total === 1} title="Delete" />
          {index !== 0 && (
            <Action icon="arrow-up" onClick={handleMoveUp} title="Move up" />
          )}
          {index < total - 1 && (
            <Action icon="arrow-down" onClick={handleMoveDown} title="Move down" />
          )}
        </div>
      )}
    </div>
  );
};

const NestedField = observer(({className, fieldStore, readMode, showIfNoValue}) => {

  const classes = useStyles();

  const formGroupRef = useRef();

  const view = React.useContext(ViewContext);

  const {
    instance,
    initialValue,
    label,
    labelTooltip,
    labelTooltipIcon,
    isPublic,
    nestedFieldsStores
  } = fieldStore;

  const addValue = type => fieldStore.addValue(type);

  const handleDeleteItem = index => fieldStore.deleteItemByIndex(index);
  const handleMoveItemUp = index => fieldStore.moveItemUpByIndex(index);
  const handleMoveItemDown = index => fieldStore.moveItemDownByIndex(index);

  const active = view && view.currentInstanceId === instance.id;

  if(readMode && !showIfNoValue && (!initialValue || !initialValue.length )) {
    return null;
  }

  return (
    <div className={`${className} ${readMode?classes.readMode:""}`} ref={formGroupRef}>
      {readMode ?
        <Label className={classes.label} label={label} />:
        <Label className={classes.label} label={label} labelTooltip={labelTooltip} labelTooltipIcon={labelTooltipIcon} isPublic={isPublic}/>
      }
      <div className={classes.form} >
        {nestedFieldsStores.map((row, idx) => (
          <Item key={idx} itemFieldStores={row.stores} readMode={readMode} active={active} index={idx} total={nestedFieldsStores.length} onDelete={handleDeleteItem} onMoveUp={handleMoveItemUp} onMoveDown={handleMoveItemDown} />
        ))}
        {!readMode && active && (
          <Add className={`${classes.actionBtn} ${nestedFieldsStores.length === 0?classes.noItems:""}`} onClick={addValue} types={fieldStore.resolvedTargetTypes} />
        )}
      </div>
    </div>
  );
});
NestedField.displayName = "NestedField";

export default NestedField;