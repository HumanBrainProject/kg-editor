import React from "react";
import injectStyles from "react-jss";
import {observer} from "mobx-react";
import { Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Scrollbars } from "react-custom-scrollbars";

import queryBuilderStore from "../Stores/QueryBuilderStore";
import Query from "./QueryBuilder/Query";
import SavedQueries from "./QueryBuilder/SavedQueries";

import RootSchemaChoice from "./QueryBuilder/RootSchemaChoice";
import QuerySpecification from "./QueryBuilder/QuerySpecification";
import Options from "./QueryBuilder/Options";
import Result from "./QueryBuilder/Result";
import ResultTable from "./QueryBuilder/ResultTable";
import Tab from "../Components/Tab";
import BGMessage from "../Components/BGMessage";
import FetchingLoader from "../Components/FetchingLoader";

let styles = {
  container:{
    width:"100%",
    height:"100%",
    color: "var(--ft-color-normal)",
  },
  structureLoader: {
    width: "100%",
    height: "100%",
    zIndex: 10000,
    "& .fetchingPanel": {
      width: "auto",
      padding: "30px",
      border: "1px solid var(--border-color-ui-contrast1)",
      borderRadius: "4px",
      color: "var(--ft-color-loud)",
      background: "var(--list-bg-hover)"
    }
  },
  layout:{
    display:"grid",
    gridTemplateColumns:"1fr 1fr",
    gridGap:"10px",
    padding: "10px",
    height:"100%"
  },
  leftPanel:{
    position:"relative"
  },
  rightPanel:{
    position:"relative",
    display:"grid",
    gridTemplateRows:"1fr",
    gridGap:"10px",
    width:"100%",
    "&.loading, &.error, &.noQueries": {
      gridTemplateRows:"auto 1fr",
    },
    "&.withMyQueriesOn, &.withOthersQueriesOn": {
      gridTemplateRows:"1fr 4fr",
    },
    "&.withMyQueriesOff, &.withOthersQueriesOff": {
      gridTemplateRows:"auto 1fr",
    },
    "&.withMyQueriesOn.withOthersQueriesOn": {
      gridTemplateRows:"1fr 1fr 3fr",
    },
    "&.withMyQueriesOff.withOthersQueriesOff": {
      gridTemplateRows:"auto auto 1fr",
    },
    "&.withMyQueriesOn.withOthersQueriesOff": {
      gridTemplateRows:"1fr auto 4fr",
    },
    "&.withMyQueriesOff.withOthersQueriesOn": {
      gridTemplateRows:"auto 1fr 4fr",
    }
  },
  fetchingQueries: {
    position: "relative",
    padding: "10px",
    borderRadius: "4px",
    background:"var(--bg-color-blend-contrast1)",
    color: "var(--ft-color-normal)",
    "& > span": {
      paddingLeft: "6px",
      display:"inline-block"
    }
  },
  fetchQueriesError: {
    display: "flex",
    position: "relative",
    padding: "10px",
    border:"1px solid var(--border-color-ui-contrast2)",
    background:"var(--bg-color-ui-contrast2)",
    color: "var(--ft-color-error)",
    "& > svg": {
      marginTop: "8px",
    },
    "& > span": {
      marginTop: "6px",
      paddingLeft: "6px",
      overflow:"hidden",
      textOverflow:"ellipsis",
    },
    "& > div": {
      flex: 1,
      textAlign: "right",
      "& button": {
        marginLeft: "10px"
      }
    }
  },
  noQueries: {
    display: "flex",
    position: "relative",
    padding: "10px",
    borderRadius: "4px",
    background:"var(--bg-color-blend-contrast1)",
    color: "var(--ft-color-normal)",
    "& > span": {
      flex: 1
    },
    "& > button": {
      display: "inline-block",
      margin: 0,
      padding: 0,
      border: 0,
      background: "transparent",
      outline: 0,
      "&:hover": {
        outline: 0
      }
    }
  },
  myQueries: {
    display: "none",
    "&.show": {
      display: "block"
    }
  },
  othersQueries: {
    display: "none",
    "&.show": {
      display: "block"
    }
  },
  tabbedPanel:{
    display:"grid",
    gridTemplateRows:"auto 1fr"
  },
  tabs:{
    display:"grid",
    gridTemplateColumns:"repeat(auto-fit, minmax(120px, 1fr))",
    borderLeft:"1px solid var(--border-color-ui-contrast2)"
  },
  tabBody:{
    border:"1px solid var(--border-color-ui-contrast2)",
    borderTop:"none",
    background:"var(--bg-color-ui-contrast2)"
  },
  tabBodyInner:{
    padding:"10px"
  }
};

@injectStyles(styles)
@observer
export default class QueryBuilder extends React.Component{
  constructor(props) {
    super(props);
  }
  handleSelectTab(tab){
    queryBuilderStore.selectTab(tab);
  }
  handleCloseField = () => {
    queryBuilderStore.closeFieldOptions();
  }
  handleFetchStructure = () => {
    queryBuilderStore.fetchStructure();
  }
  handleFetchSavedQueries = () => {
    queryBuilderStore.fetchQueries();
  }
  handleCancelFetchSavedQueries = () => {
    queryBuilderStore.fetchQueriesError = null;
  }
  handleMyQueriesExpandToggle = () => {
    queryBuilderStore.showMyQueries = !queryBuilderStore.showMyQueries;
  }
  handleOthersQueriesExpandToggle = () => {
    queryBuilderStore.showOthersQueries = !queryBuilderStore.showOthersQueries;
  }

  UNSAFE_componentWillUpdate(){
    if(this.currentTab !== queryBuilderStore.currentTab && this.scrolledPanel){
      //console.log(this.scrolledPanel,this.scrolledPanel.scrollTop);
      this.scrolledPanel.scrollToTop();
    }
  }

  render(){
    const {classes} = this.props;
    this.currentTab = queryBuilderStore.currentTab;

    return(
      <div className={classes.container}>
        {queryBuilderStore.isFetchingStructure?
          <div className={classes.structureLoader}>
            <FetchingLoader>
            Fetching api structure
            </FetchingLoader>
          </div>
          :
          queryBuilderStore.fetchStuctureError?
            <BGMessage icon={"ban"}>
              There was a network problem fetching the api structure.<br/>
              If the problem persists, please contact the support.<br/>
              <small>{queryBuilderStore.fetchStuctureError}</small><br/><br/>
              <Button bsStyle={"primary"} onClick={this.handleFetchStructure}>
                <FontAwesomeIcon icon={"redo-alt"}/>&nbsp;&nbsp; Retry
              </Button>
            </BGMessage>
            :
            !queryBuilderStore.hasSchemas?
              <BGMessage icon={"blender-phone"}>
                No schemas available.<br/>
                If the problem persists, please contact the support.<br/><br/>
                <Button bsStyle={"primary"} onClick={this.handleFetchStructure}>
                  <FontAwesomeIcon icon={"redo-alt"}/>&nbsp;&nbsp; Retry
                </Button>
              </BGMessage>
              :
              <div className={classes.layout}>
                <div className={classes.leftPanel}>
                  {queryBuilderStore.hasRootSchema?
                    <Query />
                    :
                    <BGMessage icon={"blender-phone"}>
                      Please choose a root schema in the right panel
                    </BGMessage>}
                </div>
                <div className={`${classes.rightPanel} ${queryBuilderStore.isFetchingQueries?"loading":""} ${queryBuilderStore.fetchQueriesError?"error":""} ${!queryBuilderStore.hasRootSchema || queryBuilderStore.hasQueries?"":"noQueries"} ${queryBuilderStore.hasMyQueries?(queryBuilderStore.showMyQueries?"withMyQueriesOn":"withMyQueriesOff"):""} ${queryBuilderStore.hasOthersQueries?(queryBuilderStore.showOthersQueries?"withOthersQueriesOn":"withOthersQueriesOff"):""}`}>
                  {queryBuilderStore.hasRootSchema?
                    queryBuilderStore.isFetchingQueries?
                      <div className={classes.fetchingQueries} >
                        <FontAwesomeIcon icon="circle-notch" spin/><span>{`Fetching saved queries for ${queryBuilderStore.rootSchema.id}...`}</span>
                      </div>
                      :
                      queryBuilderStore.fetchQueriesError?
                        <div className={classes.fetchQueriesError} >
                          <FontAwesomeIcon icon="exclamation-triangle"/><span>{queryBuilderStore.fetchQueriesError}</span>
                          <div>
                            <Button onClick={this.handleCancelFetchSavedQueries}><FontAwesomeIcon icon="times"/>&nbsp;Cancel</Button>
                            <Button bsStyle="primary" onClick={this.handleFetchSavedQueries}><FontAwesomeIcon icon="redo-alt"/>&nbsp;Retry</Button>
                          </div>
                        </div>
                        :
                        !queryBuilderStore.hasQueries?
                          <div className={classes.noQueries} >
                            <span>No saved queries available for {queryBuilderStore.rootSchema.label}<small> - {queryBuilderStore.rootSchema.id}</small></span>
                            <button onClick={this.handleFetchSavedQueries} title="Refresh"><FontAwesomeIcon icon="redo-alt"/></button>
                          </div>
                          :
                          <React.Fragment>
                            <div className={`${classes.myQueries} ${queryBuilderStore.hasMyQueries?"show":""}`} >
                              <SavedQueries
                                title={`My saved queries for ${queryBuilderStore.rootSchema.label}`}
                                subTitle={queryBuilderStore.rootSchema.id}
                                list={queryBuilderStore.myQueries}
                                onSelect={this.handleSelectQuery}
                                expanded={queryBuilderStore.showMyQueries}
                                onExpandToggle={this.handleMyQueriesExpandToggle}
                                onRefresh={this.handleFetchSavedQueries}
                                enableDelete={true} />
                            </div>
                            <div className={`${classes.othersQueries} ${queryBuilderStore.hasOthersQueries?"show":""}`} >
                              <SavedQueries
                                title={`Other users' queries for ${queryBuilderStore.rootSchema.label}`}
                                subTitle={queryBuilderStore.rootSchema.id}
                                list={queryBuilderStore.othersQueries}
                                onSelect={this.handleSelectQuery}
                                expanded={queryBuilderStore.showOthersQueries}
                                onExpandToggle={this.handleOthersQueriesExpandToggle}
                                onRefresh={this.handleFetchSavedQueries}
                                showUser={true} />
                            </div>
                          </React.Fragment>
                    :
                    null
                  }
                  <div className={classes.tabbedPanel}>
                    <div className={classes.tabs}>
                      {queryBuilderStore.hasRootSchema?
                        <React.Fragment>
                          {queryBuilderStore.currentField && <Tab icon={"cog"} current={queryBuilderStore.currentTab === "fieldOptions"} label={"Field options"} onClose={this.handleCloseField} onClick={this.handleSelectTab.bind(this, "fieldOptions")}/>}
                          <Tab icon={"shopping-cart"} current={queryBuilderStore.currentTab === "query"} label={"Query specification"} onClick={this.handleSelectTab.bind(this, "query")}/>
                          <Tab icon={"poll-h"} current={queryBuilderStore.currentTab === "result"} label={"Results: JSON View"} onClick={this.handleSelectTab.bind(this, "result")}/>
                          <Tab icon={"table"} current={queryBuilderStore.currentTab === "resultTable"} label={"Results: Table View"} onClick={this.handleSelectTab.bind(this, "resultTable")}/>
                        </React.Fragment>
                        :
                        <Tab icon={"shopping-cart"} current={true} label={"Choose a root schema"}/>
                      }
                    </div>
                    <div className={classes.tabBody}>
                      <Scrollbars autoHide ref={ref => this.scrolledPanel = ref}>
                        <div className={classes.tabBodyInner}>
                          {!queryBuilderStore.hasRootSchema?
                            <RootSchemaChoice/>
                            :queryBuilderStore.currentTab === "query"?
                              <QuerySpecification/>
                              :queryBuilderStore.currentTab === "result"?
                                <Result/>
                                :queryBuilderStore.currentTab === "resultTable"?
                                  <ResultTable/>
                                  :queryBuilderStore.currentTab === "fieldOptions"?
                                    <Options/>
                                    :null}
                        </div>
                      </Scrollbars>
                    </div>
                  </div>
                </div>
              </div>
        }
      </div>
    );
  }
}