import React from "react";
import injectStyles from "react-jss";
import {observer} from "mobx-react";
import { Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import queryBuilderStore from "../../Stores/QueryBuilderStore";
import SavedQueries from "./SavedQueries";

let styles = {
  container:{
    "--container-width": "40%",
    position: "absolute",
    top: "15px",
    right: "calc(0px - var(--container-width))",
    width: "var(--container-width)",
    height: "calc(100% - 30px)",
    padding: "15px 15px",
    border: "1px solid var(--border-color-ui-contrast1)",
    borderRadius: "0 0 0 10px",
    background: "var(--bg-color-ui-contrast2)",
    color: "var(--ft-color-normal)",
    overflow: "visible",
    transition: "right 0.5s cubic-bezier(.34,1.06,.63,.93)",
    "&.show": {
      right: 0,
      zIndex: 10
    }
  },
  toggle: {
    position: "absolute",
    top: "-1px",
    left: "-40px",
    width: "40px",
    height: "40px",
    lineHeight: "40px",
    margin: 0,
    padding: 0,
    border: "1px solid var(--border-color-ui-contrast1)",
    borderRight: "none",
    borderRadius: "10px 0 0 10px",
    background: "var(--bg-color-ui-contrast2)",
    appearance: "none",
    outline: "none",
    fontSize: "20px",
    color: "var(--ft-color-normal)",
    textAlign: "center"
  },
  panel: {
    position: "relative",
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    "& > div": {
      transition: "height 0.3s ease",
      "&.show": {
        flex: 1
      },
      "& + div": {
        marginTop: "10px"
      }
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
  }
};

@injectStyles(styles)
@observer
export default class QueriesDrawer extends React.Component{

  handleToggleDrawer = () => {
    queryBuilderStore.showQueries = !queryBuilderStore.showQueries;
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

  render(){
    const { classes } = this.props;

    return (
      <div className={`${classes.container} ${queryBuilderStore.showQueries?"show":""}`}>
        <button className={classes.toggle} onClick={this.handleToggleDrawer}><FontAwesomeIcon icon="search"/></button>
        <div className={classes.panel} >
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
                    {queryBuilderStore.hasMyQueries && (
                      <div className={`${queryBuilderStore.showMyQueries?" show":""}`} >
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
                    )}
                    {queryBuilderStore.hasOthersQueries && (
                      <div className={`${queryBuilderStore.showOthersQueries?" show":""}`} >
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
                    )}
                  </React.Fragment>
            :
            null
          }
        </div>
      </div>
    );
  }
}