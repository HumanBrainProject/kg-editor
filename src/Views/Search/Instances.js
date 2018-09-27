import React from "react";
import injectStyles from "react-jss";

import { observer } from "mobx-react";
import InfiniteScroll from "react-infinite-scroller";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "react-bootstrap";
import { Scrollbars } from "react-custom-scrollbars";

import searchStore from "../../Stores/SearchStore";
import routerStore from "../../Stores/RouterStore";
import FetchingLoader from "../../Components/FetchingLoader";
import instanceStore from "../../Stores/InstanceStore";
import Preview from "./Preview";
import BGMessage from "../../Components/BGMessage";
import Status from "../Instance/Status";

const styles = {
  container:{
    color: "rgb(224, 224, 224)",
    overflow:"hidden",
    position:"relative",
    display:"grid",
    gridTemplateColumns:"1fr 33%",
    gridTemplateRows:"auto 1fr"
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
    },
    "&.disabled,&:disabled":{
      backgroundColor: "rgba(0, 0, 0, 0.2)",
    }
  },

  body: {
    position:"relative"
  },

  preview:{
    position:"relative",
    gridRow:"1 / span 2",
    gridColumn:"2",
    background:"#24282a",
    borderLeft:"1px solid #111314",
    overflow:"auto",
    color:"rgb(224, 224, 224)"
  },

  loader:{
    textAlign:"center",
    margin:"20px 0 30px",
    fontSize:"1.25em",
    fontWeight:"300"
  },

  list:{
    padding:"1px 11px 1px 11px"
  },

  listInstance:{
    position:"relative",
    minHeight:"47px",
    cursor:"pointer",
    padding:"10px",
    background:"#24282a",
    borderLeft:"4px solid transparent",
    color:"rgba(255, 255, 255, 0.5)",
    outline:"1px solid #111314",
    marginBottom:"11px",
    "&:hover":{
      background:"#2b353c",
      borderColor:"#266ea1",
      color:"rgb(224, 224, 224)",
      outline:"1px solid transparent",
      "& $actions":{
        opacity:0.75
      },
      "& .status":{
        opacity:"1"
      }
    },
    "&.selected":{
      background:"#39464f",
      borderColor:"#6caddc",
      color:"rgb(224, 224, 224)",
      outline:"1px solid transparent",
      "& .status":{
        opacity:"1"
      }
    }
  },

  listLabel:{
    fontSize:"1.4em",
    fontWeight:"300",
    color:"rgb(244, 244, 244)",
    "& .status":{
      marginRight:"10px",
      opacity:"0.5"
    }
  },

  listDescription:{
    overflow:"hidden",
    whiteSpace:"nowrap",
    textOverflow:"ellipsis",
    marginTop:"10px"
  },

  listStatus:{
    paddingRight:"10px"
  },

  actions:{
    position:"absolute",
    top:"10px",
    right:"10px",
    width:"100px",
    display:"grid",
    gridTemplateColumns:"repeat(4, 1fr)",
    opacity:0,
    "&:hover":{
      opacity:"1 !important"
    }
  },

  action:{
    fontSize:"0.9em",
    lineHeight:"27px",
    textAlign:"center",
    backgroundColor: "#24282a",
    color:"rgba(255,255,255,0.5)",
    "&:hover":{
      color:"rgba(224,224,224,1)"
    },
    "&:first-child":{
      borderRadius:"4px 0 0 4px"
    },
    "&:last-child":{
      borderRadius:"0 4px 4px 0"
    }
  }
};

@injectStyles(styles)
@observer
export default class Instances extends React.Component{
  handleFilterChange = event => {
    searchStore.setInstancesFilter(event.target.value);
  }

  handleStatusClick(instance){
    routerStore.history.push("/instance/release/"+instance.id);
  }

  handleInstanceClick(instance, event){
    if(event.metaKey || event.ctrlKey){
      instanceStore.openInstance(instance.id);
    } else {
      searchStore.selectInstance(instance);
    }
  }

  handleOpenInstance(mode, instanceId, event){
    event.stopPropagation();
    if(event.metaKey || event.ctrlKey){
      instanceStore.openInstance(instanceId, mode);
    } else {
      routerStore.history.push(`/instance/${mode}/${instanceId}`);
    }
  }

  handleLoadMore = () => {
    searchStore.fetchInstances(true);
  }

  render = () => {
    const { classes } = this.props;

    return (
      <div className={classes.container}>
        <div className={classes.header}>
          {searchStore.selectedList !== null && <input ref={ref => this.inputRef = ref} disabled={searchStore.selectedList === null} className={`form-control ${classes.search}`} placeholder="Search" type="text" value={searchStore.instancesFilter} onChange={this.handleFilterChange} />}
        </div>
        <Scrollbars className={classes.body}>
          {searchStore.selectedList ?
            !searchStore.fetchError.instances ?
              !searchStore.isFetching.instances ?
                searchStore.instances.length ?
                  <InfiniteScroll
                    threshold={400}
                    pageStart={0}
                    loadMore={this.handleLoadMore}
                    hasMore={searchStore.canLoadMoreInstances}
                    loader={<div className={classes.loader} key={0}><FontAwesomeIcon icon={"circle-notch"} spin/>&nbsp;&nbsp;<span>Loading more instances...</span></div>}
                    useWindow={false}>
                    <div className={classes.list}>
                      {/*<li key="new">
                        <Link to={`/instance/${searchStore.selectedList.path}/${uniqueId("___NEW___")}`} className="create">
                          <Glyphicon glyph="plus" />
                          <div className="createLabel">{`Create a new ${searchStore.nodeTypeLabel} instance`}</div>
                        </Link>
                      </li>*/}
                      {searchStore.instances.map(instance => {
                        return (
                          <div key={instance.id} className={`${classes.listInstance} ${instance === searchStore.selectedInstance?"selected":""}`} onClick={this.handleInstanceClick.bind(this, instance)}>
                            <div className={classes.listType}>{searchStore.nodeTypeLabel}</div>
                            <div className={classes.listLabel}>
                              <Status id={instance.id} darkmode={true}/>
                              {instance.label}
                            </div>
                            {!!instance.description && <div className={classes.listDescription}>{instance.description}</div>}

                            <div className={classes.actions}>
                              <div className={classes.action} onClick={this.handleOpenInstance.bind(this, "view", instance.id)}>
                                <FontAwesomeIcon icon="eye"/>
                              </div>
                              <div className={classes.action} onClick={this.handleOpenInstance.bind(this, "edit", instance.id)}>
                                <FontAwesomeIcon icon="pencil-alt"/>
                              </div>
                              <div className={classes.action} onClick={this.handleOpenInstance.bind(this, "graph", instance.id)}>
                                <FontAwesomeIcon icon="project-diagram"/>
                              </div>
                              <div className={classes.action} onClick={this.handleOpenInstance.bind(this, "release", instance.id)}>
                                <FontAwesomeIcon icon="cloud-upload-alt"/>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </InfiniteScroll>
                  :
                  <BGMessage icon={"unlink"}>
                    No instances could be found in this list
                    {searchStore.instancesFilter && <div>with the search term {`"${searchStore.instancesFilter}"`}</div>}
                  </BGMessage>
                :
                <FetchingLoader>
                  <span>Fetching instances...</span>
                </FetchingLoader>
              :
              <BGMessage icon={"ban"}>
                There was a network problem retrieving the list of instances.<br/>
                If the problem persists, please contact the support.<br/><br/>
                <Button bsStyle={"primary"} onClick={this.handleRetry}>
                  <FontAwesomeIcon icon={"redo-alt"}/> &nbsp; Retry
                </Button>
              </BGMessage>
            :
            <BGMessage icon={"code-branch"} transform={"flip-h rotate--90"}>
              Select a list of instances in the left panel
            </BGMessage>
          }
        </Scrollbars>
        <div className={classes.preview}>
          {searchStore.selectedInstance?
            <Preview/>
            :
            <BGMessage icon={"money-check"}>
              Select an instance to display its preview here.
            </BGMessage>
          }
        </div>
      </div>
    );
  }
}
