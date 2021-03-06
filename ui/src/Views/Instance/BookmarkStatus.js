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
import { observer } from "mobx-react";
import { toJS } from "mobx";
import injectStyles from "react-jss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import browseStore from "../../Stores/BrowseStore";
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
    width: "20px",
    background:"var(--bg-color-ui-contrast2)",
    textAlign:"center",
    color:"var(--ft-color-loud)",
    //border:"1px solid var(--ft-color-loud)",
    minWidth: "1.4em",
    "& .svg-inline--fa":{
      fontSize:"0.8em",
      verticalAlign:"baseline"
    }
  },
  fetchErrorButton: {
    color: "var(--bookmark-off-color)",  // #e67e22 #e74c3c
  },
  saveErrorButton: {
    color: "var(--ft-color-error)"
  },
  textError: {
    margin: 0,
    wordBreak: "keep-all"
  }
};

@injectStyles(styles)
@observer
export default class BookmarkStatus extends React.Component{
  componentDidMount() {
    bookmarkStatusStore.fetchStatus(this.props.id);
  }

  componentDidUpdate(prevProps) {
    if(prevProps.id !== this.props.id) {
      bookmarkStatusStore.fetchStatus(this.props.id);
    }
  }

  handleBookmarksSave = () => bookmarkStatusStore.saveStatus(this.props.id);

  handleBookmarksChange = bookmarkLists => bookmarkStatusStore.updateStatus(this.props.id, bookmarkLists);

  handleNewBookmark = name => browseStore.createBookmarkList(name, this.props.id);

  handleFetchRetry = () => bookmarkStatusStore.retryFetchStatus();

  handleSaveCancel = () => bookmarkStatusStore.revertSaveStatus(this.props.id);

  handleSaveRetry = () => bookmarkStatusStore.saveStatus(this.props.id);

  render(){
    const instanceStatus = bookmarkStatusStore.getInstance(this.props.id);
    const { classes, className } = this.props;
    const values = (instanceStatus && instanceStatus.data && !!instanceStatus.data.bookmarkLists.length)?toJS(instanceStatus.data.bookmarkLists):[];
    const bookmarkLists = toJS(browseStore.bookmarkLists);
    return(
      instanceStatus?
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
                <BookmarkButton values={values} list={bookmarkLists} onSave={this.handleBookmarksSave} onChange={this.handleBookmarksChange} onNew={this.handleNewBookmark} />
          }
        </div>:null
    );
  }
}