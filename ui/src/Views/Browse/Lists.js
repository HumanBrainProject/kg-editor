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
import { Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import FetchingLoader from "../../Components/FetchingLoader";
import { Scrollbars } from "react-custom-scrollbars";

import browseStore from "../../Stores/BrowseStore";

import List from "./List";

const styles = {
  container:{
    background:"var(--bg-color-ui-contrast2)",
    borderRight:"1px solid var(--border-color-ui-contrast1)",
    color: "var(--ft-color-loud)",
    position:"relative",
    display:"grid",
    gridTemplateRows:"auto 1fr"
  },
  header:{
    position:"relative"
  },
  search:{
    borderRadius: "2px",
    backgroundColor: "var(--bg-color-blend-contrast1)",
    color: "var(--ft-color-loud)",
    margin:"10px",
    width:"calc(100% - 20px)",
    border:"1px solid transparent",
    paddingLeft:"30px",
    "&:focus":{
      borderColor: "rgba(64, 169, 243, 0.5)"
    }
  },
  searchIcon:{
    position:"absolute",
    top:"20px",
    left:"20px",
    color: "var(--ft-color-normal)",
  },
  folderName:{
    color:"var(--ft-color-quiet)",
    textTransform:"uppercase",
    fontWeight:"bold",
    fontSize:"0.9em",
    padding:"10px 10px 5px 10px",
    cursor:"pointer"
  },
  folderSearch:{
    textTransform:"none",
  },
  folderNoMatch:{
    display:"inline-block",
    marginLeft:"20px"
  },
  fetchErrorPanel:{
    textAlign:"center",
    fontSize:"0.9em",
    wordBreak:"break-all",
    padding:"40px 20px",
    "& .btn":{
      width:"100%",
      marginTop:"20px"
    },
    color: "var(--ft-color-error)"
  },
  noResultPanel:{
    extend:"fetchErrorPanel",
    color:"var(--ft-color-loud)"
  }
};

@injectStyles(styles)
@observer
export default class Lists extends React.Component{
  componentDidMount() {
    if(!browseStore.isFetched.lists && !browseStore.isFetching.lists){
      browseStore.fetchLists();
    }
  }

  handleFilterChange = event => {
    browseStore.setListsFilter(event.target.value);
  }

  handleToggleFolder (folder){
    browseStore.toggleFolder(folder);
  }

  handleLoadRetry = () => {
    browseStore.fetchLists();
  }

  render(){
    const {classes} = this.props;
    browseStore.cancelCurrentlyEditedBookmarkList();
    return(
      <div className={classes.container}>
        {!browseStore.fetchError.lists?
          !browseStore.isFetching.lists?
            browseStore.lists.length?
              <React.Fragment>
                <div className={classes.header}>
                  <input ref={ref => this.inputRef = ref} className={`form-control ${classes.search}`} placeholder="Filter lists" type="text" value={browseStore.listsFilter} onChange={this.handleFilterChange}/>
                  <FontAwesomeIcon icon="search" className={classes.searchIcon}/>
                </div>
                <Scrollbars autoHide>
                  {browseStore.listsFilter.trim()?
                    <div className="content">
                      <div className={classes.folder} key={"search-results"}>
                        <div className={classes.folderName}>
                          <FontAwesomeIcon fixedWidth icon={"search"}/> &nbsp;
                          Search results for <span className={classes.folderSearch}>{`"${browseStore.listsFilter.trim()}"`}</span>
                        </div>
                        <div className={classes.folderLists}>
                          {browseStore.filteredLists.map(list => <List key={list.id} list={list} />)}
                          {browseStore.filteredLists.length === 0 && <em className={classes.folderNoMatch}>No matches found</em>}
                        </div>
                      </div>
                    </div>
                    :

                    browseStore.lists.map(folder => {
                      return(
                        <div className={classes.folder} key={folder.folderName}>
                          <div className={classes.folderName} onClick={this.handleToggleFolder.bind(this,folder)}>
                            <FontAwesomeIcon fixedWidth icon={folder.expand?"caret-down":"caret-right"}/> &nbsp;
                            {folder.folderName}
                          </div>
                          {folder.expand && (
                            <div className={classes.folderLists}>
                              {folder.lists.map(list => <List key={list.id} list={list} />)}
                            </div>
                          )}
                        </div>
                      );
                    })}
                </Scrollbars>
              </React.Fragment>
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
            <div>{browseStore.fetchError.lists}</div>
            <Button bsStyle="primary" onClick={this.handleLoadRetry}>Retry</Button>
          </div>
        }
      </div>
    );
  }
}