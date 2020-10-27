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
import { observer } from "mobx-react";
import browseStore from "../../Stores/BrowseStore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import Bookmarks from "./Bookmarks";
import { Scrollbars } from "react-custom-scrollbars";
// import bookmarkStore from "../../Stores/BookmarkStore";
import Types from "./Types";
import typesStore from "../../Stores/TypesStore";

const useStyles = createUseStyles({
  container: {
    background: "var(--bg-color-ui-contrast2)",
    borderRight: "1px solid var(--border-color-ui-contrast1)",
    color: "var(--ft-color-loud)",
    position: "relative",
    display: "grid",
    gridTemplateRows:"auto 1fr"
  },
  header: {
    position: "relative"
  },
  search: {
    borderRadius: "2px",
    backgroundColor: "var(--bg-color-blend-contrast1)",
    color: "var(--ft-color-loud)",
    margin: "10px",
    width: "calc(100% - 20px)",
    border: "1px solid transparent",
    paddingLeft: "30px",
    "&:focus": {
      borderColor: "rgba(64, 169, 243, 0.5)",
      backgroundColor: "transparent",
      color: "var(--ft-color-loud)",
    }
  },
  searchIcon: {
    position: "absolute",
    top: "20px",
    left: "20px",
    color: "var(--ft-color-normal)",
  },
  noMatch: {
    padding: "0 15px"
  }
});

const NavigationPanel = observer(() => {

  const classes = useStyles();

  const handleFilterChange = e => {
    browseStore.setNavigationFilterTerm(e.target.value);
  };

  // const bookmarkList = bookmarkStore.filteredList(browseStore.navigationFilter);
  const typeList = typesStore.filteredList(browseStore.navigationFilter);

  return (
    <div className={classes.container}>
      <div className={classes.header}>
        <input
          className={`form-control ${classes.search}`}
          placeholder="Filter lists"
          type="text"
          value={browseStore.navigationFilter}
          onChange={handleFilterChange} />
        <FontAwesomeIcon icon="search" className={classes.searchIcon} />
      </div>
      <Scrollbars autoHide>
        {browseStore.navigationFilter.trim() &&
              // bookmarkList.length === 0 && typeList.length === 0 && <em className={classes.noMatch}>No matches found</em>
              typeList.length === 0 && <em className={classes.noMatch}>No matches found</em>
        }
        {/* <Bookmarks /> */}
        <Types />
      </Scrollbars>
    </div>
  );
});

export default NavigationPanel;