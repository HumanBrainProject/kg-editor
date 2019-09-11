import React from "react";
import injectStyles from "react-jss";
import { observer } from "mobx-react";
import browseStore from "../../Stores/BrowseStore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Bookmarks from "./Bookmarks";
import { Scrollbars } from "react-custom-scrollbars";
import bookmarkStore from "../../Stores/BookmarkStore";

const styles = {
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
      borderColor: "rgba(64, 169, 243, 0.5)"
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
};

@injectStyles(styles)
@observer
export default class NavigationPanel extends React.Component {
  handleFilterChange = event => {
    browseStore.setNavigationFilterTerm(event.target.value);
  }

  render() {
    const { classes } = this.props;
    const bookmarkList = bookmarkStore.filteredList(browseStore.navigationFilter);
    const typeList = [];
    return (
      <div className={classes.container}>
        <div className={classes.header}>
          <input
            ref={ref => this.inputRef = ref}
            className={`form-control ${classes.search}`}
            placeholder="Filter lists"
            type="text"
            value={browseStore.navigationFilter}
            onChange={this.handleFilterChange} />
          <FontAwesomeIcon icon="search" className={classes.searchIcon} />
        </div>
        <Scrollbars autoHide>
          {browseStore.navigationFilter.trim() &&
              bookmarkList.length === 0 && typeList.length === 0 && <em className={classes.noMatch}>No matches found</em>
          }
          <Bookmarks />
        </Scrollbars>
      </div>
    );
  }
}