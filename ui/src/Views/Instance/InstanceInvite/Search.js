import React from "react";
import { toJS } from "mobx";
import { observer } from "mobx-react";
import injectStyles from "react-jss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import InfiniteScroll from "react-infinite-scroller";

import User from "./User";

import usersStore from "../../../Stores/UsersStore";

const styles = {
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
};

@injectStyles(styles)
@observer
class Search extends React.Component{

  handleLoadMoreSearchResults = () => {
    usersStore.searchUsers(true);
  }

  handleRetrySearchUsers = () => {
    usersStore.searchUsers();
  }

  handleSelect = (user, event) => {
    const { org, onSelect } = this.props;
    if(event && event.keyCode === 40){ // Down
      event && event.preventDefault();
      const users = this.usersRef.querySelectorAll(".option");
      if (users.length) {
        let index = Array.prototype.indexOf.call(users, event.target) + 1;
        if (index >= users.length) {
          index = 0;
        }
        users[index].focus();
      }
    } else if(event && event.keyCode === 38){ // Up
      event && event.preventDefault();
      const users = this.usersRef.querySelectorAll(".option");
      if (users.length) {
        let index = Array.prototype.indexOf.call(users, event.target) - 1;
        if (index < 0) {
          index = users.length - 1;
        }
        users[index].focus();
      }
    } else if(event && event.keyCode === 27) { //escape
      event && event.preventDefault();
      usersStore.clearSearch();
    } else if (user && (!event || (event && (!event.keyCode || event.keyCode === 13)))) { // enter
      event && event.preventDefault();
      usersStore.addUser(org, toJS(user), true);
      this.inputRef && this.inputRef.focus();
      typeof onSelect === "function" && onSelect(user.id);
    }
  }

  handleInputKeyStrokes = event => {
    if(event && event.keyCode === 40 ){ // Down
      event && event.preventDefault();
      const users = this.usersRef.querySelectorAll(".option");
      if (users.length) {
        let index = Array.prototype.indexOf.call(users, event.target) + 1;
        if (index >= users.length) {
          index = 0;
        }
        users[index].focus();
      }
    } else if(event && event.keyCode === 38){ // Up
      event && event.preventDefault();
      const users = this.usersRef.querySelectorAll(".option");
      if (users.length) {
        let index = Array.prototype.indexOf.call(users, event.target) - 1;
        if (index < 0) {
          index = users.length - 1;
        }
        users[index].focus();
      }
    } else if(event && event.keyCode === 27) { //escape
      event && event.preventDefault();
      usersStore.clearSearch();
    }
  }

  handleSearchFilterChange = event => {
    const { excludedUsers } = this.props;
    if (event
      && event.keyCode !== 40   // Down
      && event.keyCode !== 38   // Up
      && event.keyCode !== 27) { //escape
      window.console.log("searching user...", event.target.value);
      usersStore.setSearchFilter(event.target.value, excludedUsers);
    }
  }

  clickOutHandler = e => {
    if(!this.wrapperRef || !this.wrapperRef.contains(e.target)){
      usersStore.clearSearch();
    }
  };

  listenClickOutHandler(){
    window.addEventListener("mouseup", this.clickOutHandler, false);
    window.addEventListener("touchend", this.clickOutHandler, false);
    window.addEventListener("keyup", this.clickOutHandler, false);
  }

  unlistenClickOutHandler(){
    window.removeEventListener("mouseup", this.clickOutHandler, false);
    window.removeEventListener("touchend", this.clickOutHandler, false);
    window.removeEventListener("keyup", this.clickOutHandler, false);
  }

  componentDidMount() {
    this.listenClickOutHandler();
  }

  componentWillUnmount(){
    this.unlistenClickOutHandler();
  }

  render() {
    const { classes } = this.props;

    const showTotalSearchCount = usersStore.isSearchFetched && usersStore.totalSearchCount !== undefined && (!usersStore.searchFetchError || usersStore.totalSearchCount !== 0);

    return (
      <div className={classes.container} ref={ref=>{this.wrapperRef = ref;}} >
        <FontAwesomeIcon icon="user-plus" className={classes.addIcon} />
        <div className={classes.search}>
          <input ref={ref=>{this.inputRef = ref;}} className={`form-control ${classes.searchInput}`} placeholder="Add a user" type="text" value={usersStore.searchFilter.queryString} onKeyDown={this.handleInputKeyStrokes} onChange={this.handleSearchFilterChange} />
          <FontAwesomeIcon icon="search" className={classes.searchIcon} />
          <div className={`quickfire-dropdown ${classes.searchDropdown} ${usersStore.hasSearchFilter?"open":""}`} ref={ref=>{this.usersRef = ref;}}>
            <div className="dropdown-menu">
              <div className="dropdown-list">
                <InfiniteScroll
                  element={"ul"}
                  threshold={100}
                  hasMore={usersStore.canLoadMoreResults}
                  loadMore={this.handleLoadMoreSearchResults}
                  useWindow={false}>
                  {usersStore.searchResult.map(user => (
                    <User key={user.id} user={user} onSelect={this.handleSelect} />
                  ))}
                </InfiniteScroll>
              </div>
              { (usersStore.isFetchingSearch || showTotalSearchCount) && (
                <div className={classes.footerPanel} >
                  <div>
                    { usersStore.isFetchingSearch && (
                      <React.Fragment>
                        <FontAwesomeIcon icon="circle-notch" spin />&nbsp;&nbsp; fetching...
                      </React.Fragment>
                    )}
                  </div>
                  <div className={classes.searchCount}>
                    { showTotalSearchCount && (
                      <React.Fragment>
                        {usersStore.totalSearchCount} user{`${usersStore.totalSearchCount !== 0?"s":""} found`}
                      </React.Fragment>
                    )}
                  </div>
                </div>
              )}
              {usersStore.searchFetchError && (
                <button className={classes.errorPanel} title={usersStore.searchFetchError} onClick={this.handleLoadMoreSearchResults}>
                  <div className="error"><FontAwesomeIcon icon="exclamation-triangle" />&nbsp;&nbsp;<span>{usersStore.searchFetchError}</span></div>
                  <div className="retry"><FontAwesomeIcon icon={"redo-alt"}/></div>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Search;