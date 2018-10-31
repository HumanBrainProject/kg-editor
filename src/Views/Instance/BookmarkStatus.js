import React from "react";
import { observer } from "mobx-react";
import { toJS } from "mobx";
import injectStyles from "react-jss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import searchStore from "../../Stores/SearchStore";
import bookmarkStatusStore from "../../Stores/BookmarkStatusStore";
import BookmarkButton from "../../Components/BookmarkButton";
import PopOverButton from "../../Components/PopOverButton";

let styles = {
  container:{
    display:"inline-block",
    fontSize:"0.75em"
  },
  loader: {
    borderRadius:"0.14em",
    width:"2.5em",
    background:"var(--bg-color-ui-contrast2)",
    textAlign:"center",
    color:"var(--ft-color-loud)",
    border:"1px solid var(--ft-color-loud)",
    "& .svg-inline--fa":{
      fontSize:"0.8em",
      verticalAlign:"baseline"
    }
  },
  fetchErrorButton: {
    color: "var(--bookmark-off-color)",  // #e67e22 #e74c3c
  },
  saveErrorButton: {
    color: "#e74c3c"
  },
  textError: {
    margin: 0,
    wordBreak: "keep-all"
  }
};

@injectStyles(styles)
@observer
export default class BookmarkStatus extends React.Component{
  constructor(props){
    super(props);
    bookmarkStatusStore.fetchStatus(this.props.id);
    this.handleBookmarksSave = this.handleBookmarksSave.bind(this);
    this.handleBookmarksChange = this.handleBookmarksChange.bind(this);
    this.handleNewBookmark = this.handleNewBookmark.bind(this);
    this.handleFetchRetry = this.handleFetchRetry.bind(this);
    this.handleSaveCancel = this.handleSaveCancel.bind(this);
    this.handleSaveRetry = this.handleSaveRetry.bind(this);
  }

  UNSAFE_componentWillReceiveProps(newProps){
    bookmarkStatusStore.fetchStatus(newProps.id);
  }

  handleBookmarksSave() {
    bookmarkStatusStore.saveStatus(this.props.id);
  }

  handleBookmarksChange(bookmarks) {
    bookmarkStatusStore.updateStatus(this.props.id, bookmarks);
  }

  async handleNewBookmark(name) { // , field, store) {
    await searchStore.createNewBookmarkList(name);
    /*
    const newBookmarkId = await searchStore.createNewBookmarkList(name);
    if(newBookmarkId){
      const bookmarks = field.value.map(bookmark => bookmark.value);
      bookmarks.push(newBookmarkId);
      bookmarkStatusStore.updateStatus(this.props.id, bookmarks);
    }
    */
  }

  handleFetchRetry() {
    bookmarkStatusStore.retryFetchStatus();
  }

  handleSaveCancel() {
    bookmarkStatusStore.revertSaveStatus(this.props.id);
  }

  handleSaveRetry() {
    bookmarkStatusStore.saveStatus(this.props.id);
  }

  render(){
    const instanceStatus = bookmarkStatusStore.getInstance(this.props.id);
    const { classes, className } = this.props;
    const values = (instanceStatus && instanceStatus.data && !!instanceStatus.data.bookmarks.length)?toJS(instanceStatus.data.bookmarks):[];
    const bookmarks = toJS(searchStore.bookmarkListFolder);
    return(
      <div className={`${classes.container} ${className?className:""}`}>
        {instanceStatus.isFetching || (!instanceStatus.isFetched && !instanceStatus.hasFetchError)?
          <div className={classes.loader} title="retrieving favrorite status">
            <FontAwesomeIcon icon="circle-notch" spin/>
          </div>
          :
          instanceStatus.hasFetchError?
            <PopOverButton
              buttonClassName={classes.fetchErrorButton}
              buttonTitle="favrorite status unknown, click for more information"
              iconComponent={FontAwesomeIcon}
              iconProps={{icon: "question-circle"}}
              okComponent={() => (
                <React.Fragment>
                  <FontAwesomeIcon icon="redo-alt"/>&nbsp;Retry
                </React.Fragment>
              )}
              onOk={this.handleFetchRetry}
            >
              <h5 className={classes.textError}>{instanceStatus.fetchError}</h5>
            </PopOverButton>
            :
            instanceStatus.hasSaveError?
              <PopOverButton
                buttonClassName={classes.saveErrorButton}
                buttonTitle="failed to save bookmark, click for more information"
                iconComponent={FontAwesomeIcon}
                iconProps={{icon: "exclamation-triangle"}}
                okComponent={() => (
                  <React.Fragment>
                    <FontAwesomeIcon icon="redo-alt"/>&nbsp;Retry
                  </React.Fragment>
                )}
                onOk={this.handleSaveRetry}
                cancelComponent={() => (
                  <React.Fragment>
                    <FontAwesomeIcon icon="undo-alt"/>&nbsp;Revert
                  </React.Fragment>
                )}
                onCancel={this.handleSaveCancel}
              >
                <h5 className={classes.textError}>{instanceStatus.saveError}</h5>
              </PopOverButton>
              :
              <BookmarkButton values={values} list={bookmarks} onSave={this.handleBookmarksSave} onChange={this.handleBookmarksChange} onNew={this.handleNewBookmark} />
        }
      </div>
    );
  }
}