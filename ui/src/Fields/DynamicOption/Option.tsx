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

import React from "react";
import { createUseStyles } from "react-jss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import useStores from "../../Hooks/useStores";
import { Option } from "../Stores/LinkStore";
import { Suggestion } from "../../types";

const useStyles = createUseStyles({
  option: {
    position: "relative",
    display: "grid",
    gridTemplateColumns: "min-content min-content 1fr",
    "&:hover $preview": {
      display: "block"
    }
  },
  additionalInformation: {
    overflow: "hidden",
    padding: "0 6px",
    fontStyle: "italic",
    textOverflow: "ellipsis",
    color: "grey"
  },
  preview: {
    display: "none",
    position: "absolute",
    top: "50%",
    right: "4px",
    borderRadius: "2px",
    background: "var(--bg-color-ui-contrast2)",
    color: "var(--ft-color-louder)",
    padding: "3px 6px",
    cursor: "pointer",
    transform: "translateY(-50%)"
  },
  icon: {
    paddingRight: "8px"
  }
});

interface OptionProps {
  item: Suggestion;
}

const Option = ({ item }: OptionProps) => {
  const classes = useStyles();

  const { instanceStore } = useStores();

  const style = item.type.color ? { color: item.type.color } : {};

  const handlePreview = e => {
    e.stopPropagation();
    const options = { showEmptyFields:false, showAction:false, showType:true, showStatus:false };
    instanceStore.togglePreviewInstance(item.id, item.name, options);
  };

  return(
    <div title={item.type.name} tabIndex={-1} className={classes.option}>
      <span className={classes.icon} style={style}>
        <FontAwesomeIcon fixedWidth icon="circle" />
      </span>
      <span>{item.name}</span>
      {item.additionalInformation && (
        <span className={classes.additionalInformation}>{item.additionalInformation}</span>
      )}
      <div className={classes.preview} title="preview" onClick={handlePreview}>
        <FontAwesomeIcon icon="eye" />
      </div>
  </div>
  );
};

export default Option;