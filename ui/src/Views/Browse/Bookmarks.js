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
  folderName: {
    color: "var(--ft-color-quiet)",
    textTransform: "uppercase",
    fontWeight: "bold",
    fontSize: "0.9em",
    padding: "10px 10px 5px 10px",
    cursor: "pointer"
  },
  fetchErrorPanel: {
    textAlign: "center",
    fontSize: "0.9em",
    wordBreak: "break-all",
    padding: "40px 20px",
    "& .btn": {
      width: "100%",
      marginTop: "20px"
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
    return (
      !bookmarkStore.fetchError ?
        !bookmarkStore.isFetching ?
          !!list.length &&
            <div className={classes.folder}>
              <div className={classes.folderName} onClick={this.handleToggleBookmarks}>
                <FontAwesomeIcon fixedWidth icon={this.state.showBookmarks ? "caret-down" : "caret-right"} /> &nbsp; My Bookmarks
              </div>
              {this.state.showBookmarks && list.map(bookmark => <BookmarksItem key={bookmark.id} bookmark={bookmark}/>)}
            </div>
          :
          <FetchingLoader>
            Fetching bookmarks
          </FetchingLoader>
        :
        <div className={classes.fetchErrorPanel}>
          <div>{bookmarkStore.fetchError}</div>
          <Button bsStyle="primary" onClick={this.handleLoadRetry}>Retry</Button>
        </div>
    );
  }
}