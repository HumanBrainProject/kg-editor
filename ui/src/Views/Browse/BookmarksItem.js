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
import injectStyles from "react-jss";
import { observer } from "mobx-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ButtonGroup, Button } from "react-bootstrap";
import PopOverButton from "../../Components/PopOverButton";

import browseStore from "../../Stores/BrowseStore";
import bookmarkStore from "../../Stores/BookmarkStore";


const styles = {
  container: {
    padding: "5px 5px 5px 30px",
    borderLeft: "2px solid transparent",
    color: "var(--ft-color-normal)",
    cursor: "pointer",
    position: "relative",
    "&:hover": {
      background: "var(--list-bg-hover)",
      borderColor: "var(--list-border-hover)",
      color: "var(--ft-color-loud)",
      "& $actions": {
        opacity: 0.75
      },
      "& $savingBookmark": {
        position: "absolute",
        top: "0",
        right: "0",
        height: "100%",
        padding: "5px 10px",
        display: "block",
        color: "var(--ft-color-normal)",
        "&:hover": {
          color: "var(--ft-color-loud)",
        }
      }
    },
    "&.selected": {
      background: "var(--list-bg-selected)",
      borderColor: "var(--list-border-selected)",
      color: "var(--ft-color-loud)"
    },
    "&.edited": {
      padding: "0 5px 0 30px"
    },
    "&.disabled": {
      pointerEvents: "none",
      opacity: "0.8"
    }
  },
  icon: {
    position: "absolute",
    top: "8px",
    "& + span": {
      display: "inline-block",
      marginLeft: "22px"
    }
  },
  bookmarkIcon: {
    color: "var(--bookmark-on-color)",
    "& + span": {
      maxWidth: "190px"
    }
  },
  editBookmark: {
    display: "flex",
    width: "calc(100% - 19px)",
    marginLeft: "19px",
    "& .btn-group": {
      marginLeft: "6px"
    }
  },
  editBookmarkName: {
    flex: "1",
    width: "calc(100% - 20px)",
    height: "30px",
    margin: 0,
    padding: "0 2px",
    border: "1px solid transparent",
    borderRadius: "2px",
    backgroundColor: "var(--bg-color-blend-contrast1)",
    color: "var(--ft-color-loud)",
    "&:focus": {
      borderColor: "rgba(64, 169, 243, 0.5)"
    }
  },
  cancelRenameButton: {
    marginLeft: "10px",
    padding: "2px 8px",
    backgroundColor: "#fff",
    borderRadius: "4px",
    color: "var(--bg-color-ui-contrast4)",
    "&:hover": {
      color: "var(--bg-color-ui-contrast1)"
    }
  },
  renameButton: {
    marginLeft: "10px",
    padding: "2px 8px",
    backgroundColor: "#337ab7",
    borderRadius: "4px",
    color: "var(--ft-color-loud)",
    "&:hover": {
      color: "var(--ft-color-louder)"
    }
  },
  savingBookmark: {
    display: "none",
    cursor: "pointer"
  },
  actions: {
    position: "absolute",
    top: "2px",
    right: "10px",
    display: "grid",
    opacity: 0,
    width: "50px",
    gridTemplateColumns: "repeat(2, 1fr)",
    "&:hover": {
      opacity: "1 !important"
    }
  },
  action: {
    fontSize: "0.9em",
    lineHeight: "27px",
    textAlign: "center",
    backgroundColor: "var(--bg-color-ui-contrast2)",
    color: "var(--ft-color-normal)",
    "&:hover": {
      color: "var(--ft-color-loud)"
    },
    "&:first-child": {
      borderRadius: "4px 0 0 4px"
    },
    "&:last-child": {
      borderRadius: "0 4px 4px 0"
    },
    "&:first-child:last-child": {
      borderRadius: "4px"
    }
  },
  deleteBookmarkDialog: {
    position: "absolute",
    top: 0,
    right: "-200px",
    transition: "right .2s ease",
    "&.show": {
      right: "5px"
    }
  },
  error: {
    position: "absolute",
    top: "5px",
    right: "10px",
  },
  errorButton: {
    color: "var(--ft-color-error)"
  },
  textError: {
    margin: 0,
    wordBreak: "keep-all"
  }
};

@injectStyles(styles)
@observer
class BookmarksItem extends React.Component {
  constructor(props) {
    super(props);
    this.editBookmarkNameRef = React.createRef();
    this.state = { showDeleteBookmarkDialog: false, showBookmarks: true };
  }

  handleSelect = () => {
    if (bookmarkStore.currentlyEditedBookmark !== this.props.bookmark && !this.state.showDeleteBookmarkDialog) {
      browseStore.selectItem(this.props.bookmark);
    }
  }

  handelCancelActions = ()  => {
    this.setState({ showDeleteBookmarkDialog: false });
  }

  handleEditBookmark = event =>  {
    event && event.stopPropagation();
    bookmarkStore.setCurrentlyEditedBookmark(this.props.bookmark);
  }

  handleCancelEditBookmark = event => {
    event && event.stopPropagation();
    bookmarkStore.revertBookmarkChanges(this.props.bookmark);
  }

  handleRevertEditBookmark = event => {
    event && event.stopPropagation();
    bookmarkStore.revertBookmarkChanges(this.props.bookmark);
  }

  handleRenameBookmark = event => {
    event && event.stopPropagation();
    const editName = this.editBookmarkNameRef.current.value.trim();
    if (this.props.bookmark.label !== editName) {
      bookmarkStore.updateBookmark(this.props.bookmark, { name: editName });
    }
    bookmarkStore.cancelCurrentlyEditedBookmark(this.props.bookmark);
  }

  handleBookmarkNameKeyUp = event =>{
    event && event.stopPropagation();
    if (event.keyCode === 27) {
      this.handleCancelEditBookmark();
    } else if (event.keyCode === 13) {
      this.handleRenameBookmark();
    }
  }

  handleConfirmDeleteBookmark = event => {
    event && event.stopPropagation();
    this.setState({ showDeleteBookmarkDialog: true });
  }

  handleDeleteBookmark = event => {
    event && event.stopPropagation();
    this.setState({ showDeleteBookmarkDialog: false });
    bookmarkStore.deleteBookmark(this.props.bookmark);
  }

  handleCancelDeleteBookmark = event => {
    event && event.stopPropagation();
    bookmarkStore.cancelBookmarkDeletion(this.props.bookmark);
  }

  render() {
    const { classes, bookmark } = this.props;
    const selected = browseStore.selectedItem === bookmark;
    const edited = bookmarkStore.currentlyEditedBookmark === bookmark;
    return (
      <div key={bookmark.id}
        className={`${classes.container} ${selected ? "selected" : ""} ${edited ? "edited" : ""} ${bookmarkStore.isFetching ? "disabled" : ""}`}
        onClick={this.handleSelect}
        onMouseLeave={this.handelCancelActions} >
        <React.Fragment>
          <FontAwesomeIcon icon={"star"} className={`${classes.icon} ${classes.bookmarkIcon}`} />
          {edited && !bookmark.updateError && !bookmark.deleteError ?
            <div className={classes.editBookmark}>
              <input type="text" className={`form-control ${classes.editBookmarkName}`}
                defaultValue={bookmark.editName} autoFocus={true}
                onKeyUp={this.handleBookmarkNameKeyUp}
                ref={this.editBookmarkNameRef} />
              <ButtonGroup>
                <Button bsStyle="primary" bsSize="small" onClick={this.handleRenameBookmark} title="confirm rename"><FontAwesomeIcon icon="check" /></Button>
                <Button bsSize="small" onClick={this.handleCancelEditBookmark} title="cancel rename"><FontAwesomeIcon icon="undo" /></Button>
              </ButtonGroup>
            </div>
            :
            <span>{bookmark.editName ? bookmark.editName : bookmark.label}</span>
          }
          {bookmark.updateError ?
            <PopOverButton
              className={classes.error}
              buttonClassName={classes.errorButton}
              buttonTitle="failed to rename bookmark, click for more information"
              iconComponent={FontAwesomeIcon}
              iconProps={{ icon: "exclamation-triangle" }}
              okComponent={() => (
                <React.Fragment>
                  <FontAwesomeIcon icon="redo-alt" />&nbsp;Retry
                </React.Fragment>
              )}
              onOk={this.handleEditBookmark}
              cancelComponent={() => (
                <React.Fragment>
                  <FontAwesomeIcon icon="undo-alt" />&nbsp;Cancel
                </React.Fragment>
              )}
              onCancel={this.handleRevertEditBookmark}
            >
              <h5 className={classes.textError}>{`Failed to rename bookmark "${bookmark.label}" into "${bookmark.editName}" (${bookmark.updateError})`}</h5>
            </PopOverButton>
            :
            bookmark.deleteError ?
              <PopOverButton
                className={classes.error}
                buttonClassName={classes.errorButton}
                buttonTitle="failed to delete bookmark, click for more information"
                iconComponent={FontAwesomeIcon}
                iconProps={{ icon: "exclamation-triangle" }}
                okComponent={() => (
                  <React.Fragment>
                    <FontAwesomeIcon icon="redo-alt" />&nbsp;Retry
                  </React.Fragment>
                )}
                onOk={this.handleDeleteBookmark}
                cancelComponent={() => (
                  <React.Fragment>
                    <FontAwesomeIcon icon="undo-alt" />&nbsp;Cancel
                  </React.Fragment>
                )}
                onCancel={this.handleCancelDeleteBookmark}
              >
                <h5 className={classes.textError}>{`Failed to delete bookmark "${bookmark.label}" (${bookmark.deleteError})`}</h5>
              </PopOverButton>
              :
              bookmark.isUpdating || bookmark.isDeleting ?
                <div className={classes.savingBookmark}>
                  <FontAwesomeIcon icon={"circle-notch"} spin />
                </div>
                :
                !edited && !bookmark.updateError && !bookmark.deleteError && (
                  <React.Fragment>
                    <div className={classes.actions}>
                      <div className={classes.action} onClick={this.handleEditBookmark} title="rename">
                        <FontAwesomeIcon icon="pencil-alt" />
                      </div>
                      <div className={classes.action} onClick={this.handleConfirmDeleteBookmark} title="delete">
                        <FontAwesomeIcon icon="trash-alt" />
                      </div>
                    </div>
                    <div className={`${classes.deleteBookmarkDialog} ${this.state.showDeleteBookmarkDialog ? "show" : ""}`}>
                      <Button bsStyle="danger" bsSize="small" onClick={this.handleDeleteBookmark}><FontAwesomeIcon icon="trash-alt" />&nbsp;Delete</Button>
                    </div>
                  </React.Fragment>
                )
          }
        </React.Fragment>
      </div>
    );

  }
}

export default BookmarksItem;