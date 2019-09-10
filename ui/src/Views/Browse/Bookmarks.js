import React from "react";
import injectStyles from "react-jss";
import { observer } from "mobx-react";
import { Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import FetchingLoader from "../../Components/FetchingLoader";

import bookmarkStore from "../../Stores/BookmarkStore";
import navigationStore from "../../Stores/NavigationStore";

const styles = {
  folderName: {
    color: "var(--ft-color-quiet)",
    textTransform: "uppercase",
    fontWeight: "bold",
    fontSize: "0.9em",
    padding: "10px 10px 5px 10px",
    cursor: "pointer"
  },
  folderSearch: {
    textTransform: "none",
  },
  folderNoMatch: {
    display: "inline-block",
    marginLeft: "20px"
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

  handleSelectBookmark = bookmark => event => {
    event && event.stopPropagation();
    bookmarkStore.selectBookmark(bookmark);
  }

  render() {
    const { classes } = this.props;
    const list = bookmarkStore.filteredList(navigationStore.browseFilterTerm);
    return (
      !bookmarkStore.fetchError ?
        !bookmarkStore.isFetching ?
          bookmarkStore.list.length ?
            navigationStore.browseFilterTerm.trim() ?
              <div className="content">
                <div className={classes.folder} key={"search-results"}>
                  <div className={classes.folderName}>
                    <FontAwesomeIcon fixedWidth icon={"search"} /> &nbsp;
                          Search results for <span className={classes.folderSearch}>{`"${navigationStore.browseFilterTerm.trim()}"`}</span>
                  </div>
                  <div className={classes.folderLists}>
                    {list.map(bookmark => (
                      <div className={classes.folderLists} key={bookmark.id}>
                        <span onClick={this.handleSelectBookmark(bookmark)}>{bookmark.name}</span>
                      </div>
                    ))}
                    {list.length === 0 && <em className={classes.folderNoMatch}>No matches found</em>}
                  </div>
                </div>
              </div>
              :
              <div className={classes.folder}>
                <div className={classes.folderName} onClick={this.handleToggleBookmarks}>
                  <FontAwesomeIcon fixedWidth icon={this.state.showBookmarks ? "caret-down" : "caret-right"} /> &nbsp; My Bookmarks
                </div>
                {bookmarkStore.list.map(bookmark => {
                  return (
                    this.state.showBookmarks &&
                    <div className={classes.folderLists}>
                      <span onClick={this.handleSelectBookmark(bookmark)}>{bookmark.name}</span>
                    </div>
                  );
                })}
              </div>
            :
            <div className={classes.noResultPanel}>
              <div>No instances lists available. Please retry in a moment.</div>
              <Button bsStyle="primary" onClick={this.handleLoadRetry}>Retry</Button>
            </div>
          :
          <FetchingLoader>
            Fetching instances lists
          </FetchingLoader>
        :
        <div className={classes.fetchErrorPanel}>
          <div>{bookmarkStore.fetchError}</div>
          <Button bsStyle="primary" onClick={this.handleLoadRetry}>Retry</Button>
        </div>
    );
  }
}