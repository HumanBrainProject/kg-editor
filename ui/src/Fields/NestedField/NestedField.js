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

import React, { useRef } from "react";
import { observer } from "mobx-react-lite";
import Button from "react-bootstrap/Button";
import { createUseStyles } from "react-jss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import Label from "../Label";
import Field from "../Field";
import { ViewContext, PaneContext } from "../../Stores/ViewStore";

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
    backgroundColor: "var(--button-primary-bg-color)",
    color: "var(--ft-color-loud)",
    cursor: "pointer",
    width: "25px",
    "&:hover": {
      backgroundColor: "var(--button-primary-active-bg-color)",
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
    fontSize: "x-small",
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

  return (
    <div className={classes.item}>
      {Object.values(itemFieldStores).map(store => (
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

const NestedField = observer(({className, fieldStore, readMode}) => {

  const classes = useStyles();

  const formGroupRef = useRef();

  const view = React.useContext(ViewContext);

  const {
    instance,
    label,
    labelTooltip,
    labelTooltipIcon,
    globalLabelTooltip,
    globalLabelTooltipIcon,
    nestedFieldsStores
  } = fieldStore;

  const addValue = () => fieldStore.addValue();

  const handleDeleteItem = index => fieldStore.deleteItemByIndex(index);
  const handleMoveItemUp = index => fieldStore.moveItemUpByIndex(index);
  const handleMoveItemDown = index => fieldStore.moveItemDownByIndex(index);

  const active = view && view.currentInstanceId === instance.id;

  return (
    <div className={`${className} ${readMode?classes.readMode:""}`} ref={formGroupRef}>
      {readMode ?
        <Label className={classes.label} label={label} />:
        <Label className={classes.label} label={label} labelTooltip={labelTooltip} labelTooltipIcon={labelTooltipIcon} globalLabelTooltip={globalLabelTooltip} globalLabelTooltipIcon={globalLabelTooltipIcon}/>
      }
      <div className={classes.form} >
        {nestedFieldsStores.map((row, idx) => (
          <Item key={idx} itemFieldStores={row.stores} readMode={readMode} active={active} index={idx} total={nestedFieldsStores.length} onDelete={handleDeleteItem} onMoveUp={handleMoveItemUp} onMoveDown={handleMoveItemDown} />
        ))}
        {!readMode && active && (
          <Button className={`${classes.actionBtn} ${nestedFieldsStores.length === 0?classes.noItems:""}`} size="small" variant={"primary"} onClick={addValue} title="Add" >
            <FontAwesomeIcon icon="plus"/>
          </Button>
        )}
      </div>
    </div>
  );
});
NestedField.displayName = "NestedField";

export default NestedField;