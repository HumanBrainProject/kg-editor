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
import { Scrollbars } from "react-custom-scrollbars";

import { useStores } from "../../Hooks/UseStores";

// import Bookmarks from "./Bookmarks";
import Types from "./Types";
import Filter from "../../Components/Filter";

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
  noMatch: {
    padding: "0 15px"
  }
});

const NavigationPanel = observer(() => {

  const classes = useStyles();

  //const { typeStore, browseStore, bookmarkStore } = useStores();
  const { typeStore, browseStore } = useStores();

  const handleFilterChange = value => browseStore.setNavigationFilterTerm(value);

  // const bookmarkList = bookmarkStore.filteredList(browseStore.navigationFilter);
  const typeList = typeStore.filteredList(browseStore.navigationFilter);

  return (
    <div className={classes.container}>
      <div className={classes.header}>
        <Filter value={browseStore.navigationFilter} placeholder="Filter types" onChange={handleFilterChange} />
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