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

import React, { useState } from "react";
import { observer } from "mobx-react-lite";
import { Scrollbars } from "react-custom-scrollbars-2";
import { createUseStyles } from "react-jss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import API from "../../Services/API";
import { useStores } from "../../Hooks/UseStores";

import Filter from "../../Components/Filter";

const useStyles = createUseStyles({
  container: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    height: "100%",
    background: "var(--bg-color-ui-contrast2)",
    color: "var(--ft-color-normal)",
    border: "1px solid var(--border-color-ui-contrast1)",
    boxShadow: "0 2px 10px var(--pane-box-shadow)",
    "& button": {
      margin: "0 10px"
    }
  },
  body: {
    flex: 1,
    padding: "0 0 10px 0"
  },
  content: {
    display: "grid",
    gridTemplateColumns: "repeat(1, 1fr)",
    gridGap: "10px",
    padding: "0 10px",
    "@media screen and (min-width:1200px)": {
      gridTemplateColumns: "repeat(2, 1fr)"
    },
    "@media screen and (min-width:1600px)": {
      gridTemplateColumns: "repeat(3, 1fr)"
    }
  },
  type: {
    display: "grid",
    gridTemplateColumns: "auto 1fr",
    gridGap: "8px",
    position: "relative",
    padding: "15px",
    fontSize: "1.1em",
    fontWeight: "300",
    background: "var(--bg-color-ui-contrast3)",
    border: "1px solid var(--border-color-ui-contrast2)",
    borderRadius: "10px",
    cursor: "pointer",
    wordBreak: "break-word",
    "&:hover": {
      background: "var(--bg-color-blend-contrast1)",
      color: "var(--ft-color-loud)"
    }
  },
  icon: {
    alignSelf: "center"
  },
  infoCircle: {
    marginLeft: "5px",
    transform: "translateY(2px)"
  }
});

const Type = ({ type, onClick }) => {
  const classes = useStyles();

  const handleClick = () => onClick(type);

  return (
    <div
      className={classes.type}
      onClick={handleClick}
      title={type.description ? type.description : type.name}
    >
      <div
        className={classes.icon}
        style={type.color ? { color: type.color } : {}}
      >
        <FontAwesomeIcon fixedWidth icon="circle" />
      </div>
      <span>
        {type.label}
        {type.description && (
          <FontAwesomeIcon className={classes.infoCircle} icon="info-circle" />
        )}
      </span>
    </div>
  );
};

const TypeSelection = observer(({ onSelect }) => {
  const classes = useStyles();

  const { typeStore, appStore } = useStores();

  const [filter, setFilter] = useState();

  const handleChange = value => {
    API.trackEvent("Browser", "FilterType", value);
    setFilter(value);
  };

  const handleClick = type => onSelect(type);

  const types = typeStore
    .filteredList(filter)
    .filter(
      t =>
        appStore.currentSpacePermissions.canCreate &&
        t.canCreate !== false &&
        t.isSupported
    );

  return (
    <div className={classes.container}>
      <Filter
        value={filter}
        placeholder="Filter types"
        onChange={handleChange}
      />
      <div className={classes.body}>
        <Scrollbars autoHide>
          <div className={classes.content}>
            {types.map(type => (
              <Type key={type.name} type={type} onClick={handleClick} />
            ))}
          </div>
        </Scrollbars>
      </div>
    </div>
  );
});
TypeSelection.displayName = "TypeSelection";

export default TypeSelection;
