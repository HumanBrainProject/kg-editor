import React from "react";
import injectStyles from "react-jss";

import { observer } from "mobx-react";
import { Button, Glyphicon } from "react-bootstrap";
import { uniqueId } from "lodash";
import { Link } from "react-router-dom";
import searchStore from "../../Stores/SearchStore";
import routerStore from "../../Stores/RouterStore";
import ReleaseStatus from "../../Components/ReleaseStatus";
import FetchingLoader from "../../Components/FetchingLoader";
import instanceStore from "../../Stores/InstanceStore";
import NoSelectedList from "./NoSelectedList";

const styles = {
  container:{
    color: "rgb(224, 224, 224)",
    overflow:"auto",
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

  body: {
    width: "100%",
    height: "calc(100% - 92px)",
    border: "0",
    "@media screen and (min-width:576px)": {
      height: "calc(100% - 70px)"
    },
    "& ul": {
      listStyleType: "none",
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(430px, 1fr))",
      columnGap: "20px",
      rowGap: "20px",
      position: "relative",
      maxHeight: "100%",
      margin: 0,
      padding: "20px",
      overflowY: "auto",
    },
    "& li": {
      display: "inline-block",
      margin: "0",
      position:"relative"
    },
    "& li > a": {
      display: "inline-block",
      position: "relative",
      width: "100%",
      padding: "10px",
      border: "1px solid #ccc",
      backgroundColor: "#fff",
      color: "#333",
      textAlign: "left",
      transition: "backgroundColor .2s ease-in, borderColor .2s ease-in",
      "@media screen and (min-width:576px)": {
        padding: "10px 10px 40px 10px",
      },
      "@media screen and (min-width:1024px)": {
        padding: "20px 20px 40px 20px",
        minHeight: "350px"
      }
    },
    "& li > a:hover, & li > a:focus": {
      backgroundColor: "#eff5fb",
      borderColor: "#337ab7",
      color: "#337ab7",
      textDecoration: "none"
    },
    "& li > a.create": {
      borderStyle: "dashed",
      borderWidth: "9px",
      textAlign: "center"
    },
    "& li > a.create:hover, & li > a.create:focus": {
      backgroundColor: "transparent",
      borderColor: "#adcceb",
    },
    "& li > a.create .glyphicon": {
      fontSize: "xx-large",
      transform: "scale(2) translateY(8px)",
      color: "#ccc",
      transition: "color 0.25s ease-in-out",
      "@media screen and (min-width:1024px)": {
        transform: "scale(6) translateY(17px)"
      }
    },
    "& li > a.create:hover .glyphicon, & li > a.create:focus .glyphicon": {
      color: "#4089c9"
    },
    "& li > a.create .createLabel": {
      fontSize: "15px",
      transform: "translateY(30px)",
      color: "#999",
      "@media screen and (min-width:1024px)": {
        transform: "translateY(190px)"
      }
    },
    "& li > a.create:hover .createLabel, & li > a.create:focus .createLabel": {
      color: "#337ab7"
    },
    "& li > a h6": {
      marginTop: "0",
      textTransform: "capitalize",
      fontWeight: "bold"
    },
    "& li > a h4": {
      marginBottom: "30px",
      color: "#337ab7",
      fontSize: "20px"
    },
    "& li > a label": {
      display: "block",
      color: "#333",
      fontSize: "12px",
      fontWeight: "bold"
    },
    "& li > a span": {
      color: "#333",
      fontSize: "14px"
    },
    "& li > a small": {
      display: "inline-block",
      marginTop: "10px",
      bottom: "10px",
      left: "10px",
      color: "grey",
      fontSize: "0.7em",
      fontWeight: "300",
      "@media screen and (min-width:576px)": {
        position: "absolute"
      }
    }
  },

  status:{
    position:"absolute",
    top:"10px",
    right:"10px",
    zIndex:1,
    cursor:"pointer",
    width:"24px",
    height:"34px",
    "& .release-status":{
      position: "absolute"
    },
    "& .release-action":{
      position: "absolute",
      width:"100%",
      height:"100%",
      background:"#3498db",
      color:"white",
      borderRadius:"3px",
      opacity:0,
      textAlign:"center"
    },
    "&:hover .release-action":{
      opacity:1,
      transition:"opacity 0.25s ease",
      lineHeight:"34px"
    }
  }
};

@injectStyles(styles)
@observer
export default class Instances extends React.Component{
  handleFilterChange = event => {
    searchStore.setListsFilter(event.target.value);
  }

  handleStatusClick(instance){
    routerStore.history.push("/instance/release/"+instance.id);
  }

  handleGoToInstance(instance, event){
    if(event.metaKey || event.ctrlKey){
      instanceStore.openInstance(instance.id);
    } else {
      routerStore.history.push(`/instance/view/${instance.id}`);
    }
  }

  render = () => {
    const { classes } = this.props;
    return (
      <div className={classes.container}>
        {searchStore.selectedList ?
          !searchStore.fetchError.instances ?
            !searchStore.isFetching.instances ?
              searchStore.instances.length ?
                <React.Fragment>
                  <div className={classes.header}>
                    <input ref={ref => this.inputRef = ref} className={`form-control ${classes.search}`} placeholder="Search" type="text" value={searchStore.instancesFilter} onChange={this.handleFilterChange} />
                  </div>

                  <div className={classes.body}>
                    <ul>
                      <li key="new">
                        <Link to={`/instance/${searchStore.selectedList.path}/${uniqueId("___NEW___")}`} className="create">
                          <Glyphicon glyph="plus" />
                          <div className="createLabel">{`Create a new ${searchStore.nodeTypeLabel} instance`}</div>
                        </Link>
                      </li>
                      {searchStore.filteredInstances.length?
                        searchStore.filteredInstances.map(instance => {

                          return (
                            <li key={instance.id}>
                              <div className={`${classes.status}`} onClick={this.handleStatusClick.bind(this, instance)}>
                                <div className={"release-status"}>
                                  <ReleaseStatus instanceStatus={instance.status} childrenStatus={instance.childrenStatus}/>
                                </div>
                                <div className={"release-action"}>
                                  <Glyphicon glyph="cog"/>
                                </div>
                              </div>
                              <div onClick={this.handleGoToInstance.bind(this, instance)}>
                                <h6>{searchStore.nodeTypeLabel}</h6>
                                <h4>{instance.label}</h4>
                                {instance.description?
                                  <React.Fragment>
                                    <label>Description:</label>
                                    <span title={instance.description}>{instance.description.length > 400?instance.description.substring(0,397) + "...":instance.description}</span>
                                  </React.Fragment>
                                  :null
                                }
                                <small>Nexus ID: {instance.id}</small>
                              </div>
                            </li>
                          );
                        })
                        :
                        <li key="notFound">
                          <div className={classes.noFilterResult}>No instances matches your search. Please refine it.</div>
                        </li>
                      }
                    </ul>
                  </div>
                </React.Fragment>
                :
                <div className={classes.noResultPanel}>
                  <h4>No instance of type &quot;{searchStore.nodeTypeId}&quot; available.</h4>
                  <div>
                    <Link to={"/search"} className="btn btn-default">Cancel</Link>
                    <Button bsStyle="primary" onClick={this.fetchInstances}>Retry</Button>
                  </div>
                </div>
              :
              <FetchingLoader>
                <span>Fetching instances...</span>
              </FetchingLoader>
            :
            <div className={classes.fetchErrorPanel}>
              <h4>{searchStore.error}</h4>
              <div>
                <Link to={"/search"} className="btn btn-default">Cancel</Link>
                <Button bsStyle="primary" onClick={this.fetchInstances}>Retry</Button>
              </div>
            </div>
          :
          <NoSelectedList/>
        }
      </div>
    );
  }
}
