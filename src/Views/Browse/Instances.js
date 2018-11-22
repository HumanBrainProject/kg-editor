import React from "react";
import injectStyles from "react-jss";

import { observer } from "mobx-react";
import InfiniteScroll from "react-infinite-scroller";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "react-bootstrap";
import { Scrollbars } from "react-custom-scrollbars";

import browseStore from "../../Stores/BrowseStore";
import routerStore from "../../Stores/RouterStore";
import FetchingLoader from "../../Components/FetchingLoader";
import instanceStore from "../../Stores/InstanceStore";
import Preview from "./Preview";
import BGMessage from "../../Components/BGMessage";
import Status from "../Instance/Status";
import BookmarkStatus from "../Instance/BookmarkStatus";

const styles = {
  container:{
    color: "var(--ft-color-loud)",
    overflow:"hidden",
    position:"relative",
    display:"grid",
    gridTemplateColumns:"1fr 33%",
    gridTemplateRows:"auto 1fr"
  },

  search:{
    borderRadius: "2px",
    backgroundColor: "var(--bg-color-blend-contrast1)",
    color: "var(--ft-color-loud)",
    width:"100%",
    border:"1px solid transparent",
    paddingLeft:"30px",
    "&:focus":{
      borderColor: "rgba(64, 169, 243, 0.5)"
    },
    "&.disabled,&:disabled":{
      backgroundColor: "var(--bg-color-blend-contrast1)",
    }
  },

  preview:{
    position:"relative",
    gridRow:"1 / span 2",
    gridColumn:"2",
    background:"var(--bg-color-ui-contrast2)",
    borderLeft:"1px solid var(--border-color-ui-contrast1)",
    overflow:"auto",
    color:"var(--ft-color-loud)"
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
    background:"var(--bg-color-ui-contrast2)",
    borderLeft:"4px solid transparent",
    color:"var(--ft-color-normal)",
    outline:"1px solid var(--border-color-ui-contrast1)",
    marginBottom:"11px",
    "& .popover-popup": {
      display: "none !important"
    },
    "&:hover":{
      background:"var(--list-bg-hover)",
      borderColor:"var(--list-border-hover)",
      color:"var(--ft-color-loud)",
      outline:"1px solid transparent",
      "& .popover-popup": {
        display: "block !important"
      },
      "& $actions":{
        opacity:0.75
      },
      "& .status":{
        opacity:"1"
      },
      "& .bookmarkStatus":{
        opacity:"1"
      }
    },
    "&.selected":{
      background:"var(--list-bg-selected)",
      borderColor:"var(--list-border-selected)",
      color:"var(--ft-color-loud)",
      outline:"1px solid transparent",
      "& .status":{
        opacity:"1"
      },
      "& .bookmarkStatus":{
        opacity:"1"
      }
    }
  },

  listTitle:{
    fontSize:"1.4em",
    fontWeight:"300",
    color:"var(--ft-color-louder)",
    "& .status":{
      marginRight:"10px",
      opacity:"0.5"
    },
    "& .bookmarkStatus":{
      marginRight:"5px",
      opacity:"0.5"
    }
  },

  listDescription:{
    overflow:"hidden",
    whiteSpace:"nowrap",
    textOverflow:"ellipsis",
    marginTop:"10px"
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
    backgroundColor: "var(--bg-color-ui-contrast2)",
    color:"var(--ft-color-normal)",
    "&:hover":{
      color:"var(--ft-color-loud)"
    },
    "&:first-child":{
      borderRadius:"4px 0 0 4px"
    },
    "&:last-child":{
      borderRadius:"0 4px 4px 0"
    }
  },

  header:{
    display:"grid",
    gridTemplateColumns:"1fr auto",
    gridGap:"10px",
    padding:"10px",
    position:"relative"
  },
  searchIcon:{
    position:"absolute",
    top:"20px",
    left:"20px",
    color: "var(--ft-color-normal)",
  },

  instanceCount:{
    color: "var(--ft-color-normal)",
    lineHeight:"34px",
    background:"var(--bg-color-ui-contrast2)",
    padding:"0 10px"
  }
};

@injectStyles(styles)
@observer
export default class Instances extends React.Component{
  handleFilterChange = event => {
    browseStore.setInstancesFilter(event.target.value);
  }

  handleStatusClick(instance){
    routerStore.history.push("/instance/release/"+instance.id);
  }

  handleInstanceClick(instance, event){
    if(event.metaKey || event.ctrlKey){
      instanceStore.openInstance(instance.id);
    } else {
      browseStore.selectInstance(instance);
    }
  }

  handleInstanceDoubleClick(instance, event){
    if(event.metaKey || event.ctrlKey){
      instanceStore.openInstance(instance.id);
    } else {
      routerStore.history.push(`/instance/view/${instance.id}`);
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
    browseStore.fetchInstances(true);
  }

  handleRetry = () => {
    browseStore.fetchInstances();
  }

  render = () => {
    const { classes } = this.props;

    return (
      <div className={classes.container}>
        <div className={classes.header}>
          {browseStore.selectedList !== null &&
            <input ref={ref => this.inputRef = ref}
              disabled={browseStore.selectedList === null}
              className={`form-control ${classes.search}`}
              placeholder={`Filter instances of ${browseStore.selectedList.name}`}
              type="text"
              value={browseStore.instancesFilter}
              onChange={this.handleFilterChange} />}
          {browseStore.selectedList !== null &&
            <div className={classes.instanceCount}>
              {browseStore.totalInstances} Result{`${browseStore.totalInstances !== 0?"s":""}`}
            </div>}
          {browseStore.selectedList !== null && <FontAwesomeIcon icon="search" className={classes.searchIcon}/>}
        </div>
        <Scrollbars autoHide>
          {browseStore.selectedList ?
            !browseStore.fetchError.instances ?
              !browseStore.isFetching.instances ?
                browseStore.instances.length ?
                  <InfiniteScroll
                    threshold={400}
                    pageStart={0}
                    loadMore={this.handleLoadMore}
                    hasMore={browseStore.canLoadMoreInstances}
                    loader={<div className={classes.loader} key={0}><FontAwesomeIcon icon={"circle-notch"} spin/>&nbsp;&nbsp;<span>Loading more instances...</span></div>}
                    useWindow={false}>
                    <div className={classes.list}>
                      {browseStore.instances.map(instance => {
                        return (
                          <div key={instance.id}
                            className={`${classes.listInstance} ${instance === browseStore.selectedInstance?"selected":""}`}
                            onClick={this.handleInstanceClick.bind(this, instance)}
                            onDoubleClick={this.handleInstanceDoubleClick.bind(this, instance)}>
                            <div className={classes.listType}>{browseStore.nodeTypeLabel}</div>
                            <div className={classes.listTitle}>
                              <Status id={instance.id} darkmode={true}/>
                              <BookmarkStatus id={instance.id} className="bookmarkStatus" />
                              {instance.name}
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
                    {browseStore.instancesFilter && <div>with the search term {`"${browseStore.instancesFilter}"`}</div>}
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
          {browseStore.selectedInstance?
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
