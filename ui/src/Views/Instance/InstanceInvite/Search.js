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

import React, { useEffect, useRef } from "react";
import { toJS } from "mobx";
import { observer } from "mobx-react-lite";
import { createUseStyles } from "react-jss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import InfiniteScroll from "react-infinite-scroller";

import User from "./User";

import { userStore } from "../../../Hooks/UseStores";

const useStyles = createUseStyles({
  container: {
    position: "relative",
    width: "100%",
    color: "var(--ft-color-normal)",
    "& .errorPanel, & .fetchingPanel": {
      color: "var(--ft-color-loud)",
      "& svg path": {
        stroke: "var(--ft-color-loud)",
        fill: "var(--ft-color-quiet)"
      }
    }
  },
  search:{
    display: "grid",
    gridTemplateColumns: "1fr auto",
    padding: "0 22px 6px 0",
    position: "relative"
  },
  searchInput:{
    width: "calc(100% - 36px)",
    margin: "0 0 0 26px",
    padding: "10px 12px 14px 35px",
    border: "1px solid transparent",
    borderRadius: "2px",
    backgroundColor: "var(--bg-color-blend-contrast1)",
    color: "var(--ft-color-loud)",
    "&:focus": {
      borderColor: "rgba(64, 169, 243, 0.5)"
    },
    "&.disabled,&:disabled": {
      backgroundColor: "var(--bg-color-blend-contrast1)",
    }
  },
  searchDropdown: {
    "& .dropdown-menu": {
      display: "block",
      width: "calc(100% - 58px)",
      margin: "-6px 0 0 26px",
      padding: 0,
      borderTopLeftRadius: 0,
      borderTopRightRadius: 0,
      "& .dropdown-list": {
        maxHeight: "33vh",
        overflowY: "auto",
        "& ul": {
          position: "static",
          float: "none",
          listStyleType: "none",
          margin: 0,
          padding: 0
        }
      }
    },
    "&.open":{
      display:"block",
    },
    "&:not(.open)":{
      "& .dropdown-menu": {
        borderColor: "transparent",
        boxShadow: "none"
      }
    }
  },
  addIcon: {
    position: "absolute",
    top: "10px",
    left: "2px",
    color: "var(--ft-color-normal)",
  },
  searchIcon:{
    position: "absolute",
    top: "10px",
    left: "40px",
    color: "var(--ft-color-normal)",
  },
  footerPanel: {
    display: "flex",
    padding: "6px",
    fontSize: "0.9rem",
    color: "#555"
  },
  searchCount:{
    flex: 1,
    textAlign: "right"
  },
  errorPanel: {
    display: "flex",
    width: "100%",
    margin: 0,
    padding: "6px",
    border: 0,
    background: "#ffa18f",
    fontSize: "0.9rem",
    color: "black",
    outline: 0,
    "& .error": {
      width: "calc(100% - 20px)",
      color: "#ff0029",
      textAlign: "left",
      wordBreak: "keep-all",
      whiteSpace: "nowrap",
      textOverflow: "ellipsis",
      overflow: "hidden"
    },
    "& .retry": {
      flex: 1,
      textAlign: "right"
    }
  }
});

const Search = observer(({ org, excludedUsers, onSelect }) => {

  const wrapperRef = useRef();
  const usersRef = useRef();
  const inputRef = useRef();

  const classes = useStyles();

  const handleLoadMoreSearchResults = () => {
    userStore.searchUsers(true);
  };

  const handleSelect = (user, event) => {
    if(event && event.keyCode === 40){ // Down
      event && event.preventDefault();
      const users = usersRef.current.querySelectorAll(".option");
      if (users.length) {
        let index = Array.prototype.indexOf.call(users, event.target) + 1;
        if (index >= users.length) {
          index = 0;
        }
        users[index].focus();
      }
    } else if(event && event.keyCode === 38){ // Up
      event && event.preventDefault();
      const users = usersRef.current.querySelectorAll(".option");
      if (users.length) {
        let index = Array.prototype.indexOf.call(users, event.target) - 1;
        if (index < 0) {
          index = users.length - 1;
        }
        users[index].focus();
      }
    } else if(event && event.keyCode === 27) { //escape
      event && event.preventDefault();
      userStore.clearSearch();
    } else if (user && (!event || (event && (!event.keyCode || event.keyCode === 13)))) { // enter
      event && event.preventDefault();
      userStore.addUser(org, toJS(user), true);
      inputRef.current.focus();
      typeof onSelect === "function" && onSelect(user.id);
    }
  };

  const handleInputKeyStrokes = event => {
    if(event && event.keyCode === 40 ){ // Down
      event && event.preventDefault();
      const users = usersRef.current.querySelectorAll(".option");
      if (users.length) {
        let index = Array.prototype.indexOf.call(users, event.target) + 1;
        if (index >= users.length) {
          index = 0;
        }
        users[index].focus();
      }
    } else if(event && event.keyCode === 38){ // Up
      event && event.preventDefault();
      const users = usersRef.current.querySelectorAll(".option");
      if (users.length) {
        let index = Array.prototype.indexOf.call(users, event.target) - 1;
        if (index < 0) {
          index = users.length - 1;
        }
        users[index].focus();
      }
    } else if(event && event.keyCode === 27) { //escape
      event && event.preventDefault();
      userStore.clearSearch();
    }
  };

  const handleSearchFilterChange = event => {
    if (event
      && event.keyCode !== 40   // Down
      && event.keyCode !== 38   // Up
      && event.keyCode !== 27) { //escape
      userStore.setSearchFilter(event.target.value, excludedUsers);
    }
  };

  useEffect(() => {
    const clickOutHandler = e => {
      if(!wrapperRef.current.contains(e.target)){
        userStore.clearSearch();
      }
    };

    window.addEventListener("mouseup", clickOutHandler, false);
    window.addEventListener("touchend", clickOutHandler, false);
    window.addEventListener("keyup", clickOutHandler, false);

    return () => {
      window.removeEventListener("mouseup", clickOutHandler, false);
      window.removeEventListener("touchend", clickOutHandler, false);
      window.removeEventListener("keyup", clickOutHandler, false);
    };
  }, []);

  const showTotalSearchCount = userStore.isSearchFetched && userStore.totalSearchCount !== undefined && (!userStore.searchFetchError || userStore.totalSearchCount !== 0);

  return (
    <div className={classes.container} ref={wrapperRef} >
      <FontAwesomeIcon icon="user-plus" className={classes.addIcon} />
      <div className={classes.search}>
        <input ref={inputRef} className={`form-control ${classes.searchInput}`} placeholder="Add a user" type="text" value={userStore.searchFilter.queryString} onKeyDown={handleInputKeyStrokes} onChange={handleSearchFilterChange} />
        <FontAwesomeIcon icon="search" className={classes.searchIcon} />
        <div className={`${classes.searchDropdown} ${userStore.hasSearchFilter?"open":""}`} ref={usersRef}>
          <div className="dropdown-menu">
            <div className="dropdown-list">
              <InfiniteScroll
                element={"ul"}
                threshold={100}
                hasMore={userStore.canLoadMoreResults}
                loadMore={handleLoadMoreSearchResults}
                useWindow={false}>
                {userStore.searchResult.map(user => (
                  <User key={user.id} user={user} onSelect={handleSelect} />
                ))}
              </InfiniteScroll>
            </div>
            { (userStore.isFetchingSearch || showTotalSearchCount) && (
              <div className={classes.footerPanel} >
                <div>
                  { userStore.isFetchingSearch && (
                    <>
                      <FontAwesomeIcon icon="circle-notch" spin />&nbsp;&nbsp; fetching...
                    </>
                  )}
                </div>
                <div className={classes.searchCount}>
                  { showTotalSearchCount && (
                    <>
                      {userStore.totalSearchCount} user{`${userStore.totalSearchCount !== 0?"s":""} found`}
                    </>
                  )}
                </div>
              </div>
            )}
            {userStore.searchFetchError && (
              <button className={classes.errorPanel} title={userStore.searchFetchError} onClick={handleLoadMoreSearchResults}>
                <div className="error"><FontAwesomeIcon icon="exclamation-triangle" />&nbsp;&nbsp;<span>{userStore.searchFetchError}</span></div>
                <div className="retry"><FontAwesomeIcon icon={"redo-alt"}/></div>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});
Search.displayName = "Search";

export default Search;