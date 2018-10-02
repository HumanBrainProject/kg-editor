import React from "react";
import injectStyles from "react-jss";
import { observer } from "mobx-react";
import { Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import FetchingLoader from "../../Components/FetchingLoader";
import { Scrollbars } from "react-custom-scrollbars";

import searchStore from "../../Stores/SearchStore";
import instanceStore from "../../Stores/InstanceStore";
import routerStore from "../../Stores/RouterStore";

const styles = {
  container:{
    background:"var(--bg-color-ui-contrast2)",
    borderRight:"1px solid var(--border-color-ui-contrast1)",
    color: "var(--ft-color-loud)",
    position:"relative",
    display:"grid",
    gridTemplateRows:"auto 1fr"
  },
  search:{
    borderRadius: "2px",
    backgroundColor: "var(--bg-color-blend-contrast1)",
    color: "var(--ft-color-loud)",
    margin:"10px",
    width:"calc(100% - 20px)",
    border:"1px solid transparent",
    "&:focus":{
      borderColor: "rgba(64, 169, 243, 0.5)"
    }
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
  list:{
    padding:"5px 5px 5px 30px",
    borderLeft:"2px solid transparent",
    color:"var(--ft-color-normal)",
    cursor:"pointer",
    "&:hover":{
      background:"var(--list-bg-hover)",
      borderColor:"var(--list-border-hover)",
      color:"var(--ft-color-loud)",
      "& $createInstance":{
        display:"block",
        color:"var(--ft-color-normal)",
        "&:hover":{
          color:"var(--ft-color-loud)",
        }
      }
    },
    "&.selected":{
      background:"var(--list-bg-selected)",
      borderColor:"var(--list-border-selected)",
      color:"var(--ft-color-loud)"
    }
  },
  createInstance:{
    display:"none",
    marginTop:"3px",
    marginRight:"3px",
    cursor:"pointer"
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
    color:"#e74c3c"
  },
  noResultPanel:{
    extend:"fetchErrorPanel",
    color:"var(--ft-color-loud)"
  }
};

@injectStyles(styles)
@observer
export default class Lists extends React.Component{
  handleFilterChange = event => {
    searchStore.setListsFilter(event.target.value);
  }

  handleToggleFolder (folder){
    searchStore.toggleFolder(folder);
  }

  handleLoadRetry = () => {
    searchStore.fetchLists();
  }

  handleSelectList (list){
    searchStore.selectList(list);
  }

  async handleCreateInstance(path, event){
    event.stopPropagation();
    let newInstanceId = await instanceStore.createNewInstance(path);
    routerStore.history.push(`/instance/edit/${newInstanceId}`);
  }

  render(){
    const {classes} = this.props;

    return(
      <div className={classes.container}>
        {!searchStore.fetchError.lists?
          !searchStore.isFetching.lists?
            searchStore.lists.length?
              <React.Fragment>
                <div className={classes.header}>
                  <input ref={ref => this.inputRef = ref} className={`form-control ${classes.search}`} placeholder="Search" type="text" value={searchStore.listsFilter} onChange={this.handleFilterChange}/>
                </div>
                <Scrollbars autoHide>
                  {searchStore.listsFilter.trim()?
                    <div className="content">
                      <div className={classes.folder} key={"search-results"}>
                        <div className={classes.folderName}>
                          <FontAwesomeIcon fixedWidth icon={"search"}/> &nbsp;
                          Search results for <span className={classes.folderSearch}>{`"${searchStore.listsFilter.trim()}"`}</span>
                        </div>
                        <div className={classes.folderLists}>
                          {searchStore.filteredLists.map((list, index) => {
                            const [,, schema,] = list.path.split("/");
                            return (
                              <div className={`${classes.list} ${searchStore.selectedList === list?"selected":""}`} key={list.path+index} onClick={this.handleSelectList.bind(this, list)}>
                                {list.label?list.label:schema}
                              </div>
                            );
                          })}
                          {searchStore.filteredLists.length === 0 && <em className={classes.folderNoMatch}>No matches found</em>}
                        </div>
                      </div>
                    </div>
                    :

                    searchStore.lists.map(folder => {
                      return(
                        <div className={classes.folder} key={folder.folderName}>
                          <div className={classes.folderName} onClick={this.handleToggleFolder.bind(this,folder)}>
                            <FontAwesomeIcon fixedWidth icon={folder.expand?"caret-down":"caret-right"}/> &nbsp;
                            {folder.folderName}
                          </div>
                          {folder.expand && <div className={classes.folderLists}>
                            {folder.lists.map((list, index) => {
                              const [,, schema,] = list.path.split("/");
                              return (
                                <div className={`${classes.list} ${searchStore.selectedList === list?"selected":""}`} key={list.path+index} onClick={this.handleSelectList.bind(this, list)}>
                                  {list.label?list.label:schema}
                                  {instanceStore.isCreatingNewInstance?
                                    <FontAwesomeIcon icon={"circle-notch"} spin pull={"right"} className={classes.createInstance}/>
                                    :<FontAwesomeIcon icon={"plus"} pull={"right"} className={classes.createInstance} onClick={this.handleCreateInstance.bind(this, list.path)}/>}
                                </div>
                              );
                            })}
                          </div>}
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
            <div>{searchStore.fetchError.lists}</div>
            <Button bsStyle="primary" onClick={this.handleLoadRetry}>Retry</Button>
          </div>
        }
      </div>
    );
  }
}