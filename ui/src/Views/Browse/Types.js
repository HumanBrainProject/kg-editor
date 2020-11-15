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

import React, { useEffect, useState } from "react";
import { createUseStyles } from "react-jss";
import { observer } from "mobx-react-lite";
import Button from "react-bootstrap/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import FetchingLoader from "../../Components/FetchingLoader";

import { useStores } from "../../Hooks/UseStores";

import TypesItem from "./TypesItem";

const useStyles = createUseStyles({
  folder: {
    "& .fetchingPanel": {
      position: "unset !important",
      top: "unset",
      left: "unset",
      transform: "unset",
      width: "auto",
      margin: "0 33px",
      padding: "3px 6px",
      borderRadius: "3px",
      background: "rgba(255,255,255, 0.05)",
      color: "var(--ft-color-quiet)",
      fontSize: "1em",
      textAlign: "left"
    }
  },
  folderName: {
    color: "var(--ft-color-quiet)",
    textTransform: "uppercase",
    fontWeight: "bold",
    fontSize: "0.9em",
    padding: "10px 10px 5px 10px",
    cursor: "pointer"
  },
  fetchErrorPanel: {
    margin: "0 34px",
    padding: "3px",
    borderRadius: "4px",
    backgroundColor: "rgba(255,255,255,0.05)",
    textAlign: "center",
    fontSize: "0.9em",
    wordBreak: "break-all",
    "& .btn": {
      width: "100px",
      margin: "10px 6px 6px 6px"
    },
    color: "var(--ft-color-error)"
  }
});

const Types = observer(() => {

  const classes = useStyles();

  const { typesStore, browseStore } = useStores();

  const [showTypes, setShowTypes] = useState(true);

  useEffect(() => {
    typesStore.fetch();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLoadRetry = () => typesStore.fetch();

  const handleToggleType = () => setShowTypes(!showTypes);

  const list = typesStore.filteredList(browseStore.navigationFilter);

  if (!typesStore.fetchError && !typesStore.isFetching && !list.length) {
    return null;
  }

  return (
    <div className={classes.folder}>
      <div className={classes.folderName} onClick={handleToggleType}>
        <FontAwesomeIcon fixedWidth icon={showTypes ? "caret-down" : "caret-right"} /> &nbsp;Types
      </div>
      {!typesStore.fetchError ?
        !typesStore.isFetching ?
          showTypes && list.map(type =>
            <TypesItem key={type.name} type={type}/>
          )
          :
          <FetchingLoader>fetching...</FetchingLoader>
        :
        <div className={classes.fetchErrorPanel}>
          <div>{typesStore.fetchError}</div>
          <Button variant="primary" onClick={handleLoadRetry}>Retry</Button>
        </div>
      }
    </div>
  );
});

export default Types;