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

import React, { useState } from "react";
import { observer } from "mobx-react-lite";
import { Scrollbars } from "react-custom-scrollbars";
import { createUseStyles } from "react-jss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Button from "react-bootstrap/Button";

import { useStores } from "../../Hooks/UseStores";

import FetchingLoader from "../../Components/FetchingLoader";
import BGMessage from "../../Components/BGMessage";
import Filter from "../../Components/Filter";

const useStyles = createUseStyles({
  container: {
    position: "absolute",
    display: "flex",
    flexDirection: "column",
    width:"50%",
    height:"calc(100% - 160px)",
    top:"80px",
    left:"25%",
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
      color: "var(--ft-color-loud)",
    }
  },
  icon: {
    alignSelf: "center"
  }
});

const Type = ({ type, onClick }) => {

  const classes = useStyles();

  const handleClick = () => onClick(type);

  return (
    <div className={classes.type} onClick={handleClick}>
      <div className={classes.icon} style={type.color ? { color: type.color } : {}}>
        <FontAwesomeIcon fixedWidth icon="circle" />
      </div>{type.label}
    </div>
  );
};

const TypeSelection = observer(({ onSelect }) => {

  const classes = useStyles();

  const { typeStore } = useStores();

  const [ filter, setFilter ] = useState();

  const handleChange = value => setFilter(value);

  const handleRetry = () => typeStore.fetch();

  const handleClick = type => onSelect(type);

  const types = typeStore.filteredList(filter);

  if (typeStore.isFetching) {
    return (
      <div className={classes.container}>
        <FetchingLoader>Fetching data types...</FetchingLoader>
      </div>
    );
  }

  if (typeStore.fetchError) {
    return (
      <div className={classes.container}>
        <BGMessage icon={"ban"}>
              There was a network problem fetching data types.<br />
              If the problem persists, please contact the support.<br />
          <small>{typeStore.fetchError}</small><br /><br />
          <div>
            <Button variant={"primary"} onClick={handleRetry}>
              <FontAwesomeIcon icon={"redo-alt"} />&nbsp;&nbsp; Retry
            </Button>
          </div>
        </BGMessage>
      </div>
    );
  }

  return (
    <div className={classes.container}>
      <Filter value={filter} placeholder="Filter types" onChange={handleChange} />
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

export default TypeSelection;