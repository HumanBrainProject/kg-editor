import React from "react";
import injectStyles from "react-jss";
import { observer } from "mobx-react";
import { Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import FetchingLoader from "../../Components/FetchingLoader";

import bookmarkStore from "../../Stores/BookmarkStore";
import browseStore from "../../Stores/BrowseStore";
import BookmarksItem from "./BookmarksItem";

const styles = {
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
  },
  noResultPanel: {
    extend: "fetchErrorPanel",
    color: "var(--ft-color-loud)"
  }
};

@injectStyles(styles)
@observer
export default class Bookmarks extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showBookmarks: true
    };
  }

  componentDidMount() {
    bookmarkStore.fetch();
  }

  handleToggleBookmarks = () => this.setState((state) => ({ showBookmarks: !state.showBookmarks }));

  handleLoadRetry = () => bookmarkStore.fetch();

  render() {
    const { classes } = this.props;
    const list = bookmarkStore.filteredList(browseStore.navigationFilter);
    if (!bookmarkStore.fetchError && !bookmarkStore.isFetching && !list.length) {
      return null;
    }
    return (
      <div className={classes.folder}>
        <div className={classes.folderName} onClick={this.handleToggleBookmarks}>
          <FontAwesomeIcon fixedWidth icon={this.state.showBookmarks ? "caret-down" : "caret-right"} /> &nbsp; My Bookmarks
        </div>
        {!bookmarkStore.fetchError ?
          !bookmarkStore.isFetching ?
            this.state.showBookmarks && list.map(bookmark =>
              <BookmarksItem key={bookmark.id} bookmark={bookmark}/>
            )
            :
            <FetchingLoader>fetching...</FetchingLoader>
          :
          <div className={classes.fetchErrorPanel}>
            <div>{bookmarkStore.fetchError}</div>
            <Button bsStyle="primary" onClick={this.handleLoadRetry}>Retry</Button>
          </div>
        }
      </div>
    );
  }
}