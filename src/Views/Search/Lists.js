import React from "react";
import injectStyles from "react-jss";
import { observer } from "mobx-react";
import { Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import FetchingLoader from "../../Components/FetchingLoader";

import searchStore from "../../Stores/SearchStore";

const styles = {
  container:{
    overflow:"auto",
    background:"#24282a",
    borderRight:"1px solid #111314",
    color: "rgb(224, 224, 224)",
    position:"relative"
  },
  search:{
    borderRadius: "2px",
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    color: "rgb(224, 224, 224)",
    margin:"10px",
    width:"calc(100% - 20px)",
    border:"1px solid transparent",
    "&:focus":{
      borderColor: "rgba(64, 169, 243, 0.5)"
    }
  },
  folderName:{
    color:"rgba(255, 255, 255, 0.4)",
    textTransform:"uppercase",
    fontWeight:"bold",
    fontSize:"0.9em",
    padding:"10px 10px 0 10px",
    cursor:"pointer"
  },
  list:{
    padding:"5px 5px 5px 30px",
    borderLeft:"2px solid transparent",
    color:"rgba(255, 255, 255, 0.5)",
    cursor:"pointer",
    "&:hover":{
      background:"#2b353c",
      borderColor:"#266ea1",
      color:"rgb(224, 224, 224)"
    },
    "&.selected":{
      background:"#39464f",
      borderColor:"#6caddc",
      color:"rgb(224, 224, 224)"
    }
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
    color:"rgb(224, 224, 224)"
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
                <div className={classes.body}>
                  <div className="content">
                    {searchStore.lists.map(folder => {
                      return(
                        <div className={classes.folder} key={folder.folderName}>
                          <div className={classes.folderName} onClick={this.handleToggleFolder.bind(this,folder)}>
                            <FontAwesomeIcon icon={folder.expand?"caret-down":"caret-right"}/> &nbsp;&nbsp;
                            {folder.folderName}
                          </div>
                          {folder.expand && <div className={classes.folderLists}>
                            {folder.lists.map((list, index) => {
                              const [,, schema,] = list.path.split("/");
                              return (
                                <div className={`${classes.list} ${searchStore.selectedList === list?"selected":""}`} key={list.path+index} onClick={this.handleSelectList.bind(this, list)}>
                                  {list.label?list.label:schema}
                                </div>
                              );
                            })}
                          </div>}
                        </div>
                      );
                    })}
                  </div>
                </div>
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