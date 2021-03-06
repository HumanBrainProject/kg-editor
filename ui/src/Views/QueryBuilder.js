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
import { Scrollbars } from "react-custom-scrollbars";

import queryBuilderStore from "../Stores/QueryBuilderStore";
import structureStore from "../Stores/StructureStore";
import Query from "./QueryBuilder/Query";
import QueriesDrawer from "./QueryBuilder/QueriesDrawer";

import RootSchemaChoice from "./QueryBuilder/RootSchemaChoice";
import QuerySpecification from "./QueryBuilder/QuerySpecification";
import Options from "./QueryBuilder/Options";
import Result from "./QueryBuilder/Result";
import ResultTable from "./QueryBuilder/ResultTable";
import Tab from "../Components/Tab";
import BGMessage from "../Components/BGMessage";
import FetchingLoader from "../Components/FetchingLoader";

let styles = {
  container: {
    width: "100%",
    height: "100%",
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
  layout: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gridGap: "10px",
    padding: "10px",
    height: "100%"
  },
  leftPanel: {
    position: "relative"
  },
  tabbedPanel: {
    display: "grid",
    gridTemplateRows: "auto 1fr"
  },
  tabs: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
    borderLeft: "1px solid var(--border-color-ui-contrast2)"
  },
  tabBody: {
    border: "1px solid var(--border-color-ui-contrast2)",
    borderTop: "none",
    background: "var(--bg-color-ui-contrast2)"
  },
  tabBodyInner: {
    padding: "10px"
  }
};

@injectStyles(styles)
@observer
export default class QueryBuilder extends React.Component {
  fetchStructure(forceFetch=false) {
    structureStore.fetchStructure(!!forceFetch);
  }
  handleSelectTab(tab) {
    queryBuilderStore.selectTab(tab);
    this.scrolledPanel.scrollToTop();
  }
  handleCloseField = () => {
    queryBuilderStore.closeFieldOptions();
  }
  handleRetryFetchStructure = () => {
    this.fetchStructure(true);
  }

  render() {
    const { classes } = this.props;

    return (
      <div className={classes.container}>
        {structureStore.isFetchingStructure ?
          <div className={classes.structureLoader}>
            <FetchingLoader>
              Fetching api structure
            </FetchingLoader>
          </div>
          :
          structureStore.fetchStuctureError ?
            <BGMessage icon={"ban"}>
              There was a network problem fetching the api structure.<br />
              If the problem persists, please contact the support.<br />
              <small>{structureStore.fetchStuctureError}</small><br /><br />
              <Button bsStyle={"primary"} onClick={this.handleRetryFetchStructure}>
                <FontAwesomeIcon icon={"redo-alt"} />&nbsp;&nbsp; Retry
              </Button>
            </BGMessage>
            :
            !structureStore.hasSchemas ?
              <BGMessage icon={"blender-phone"}>
                No schemas available.<br />
                If the problem persists, please contact the support.<br /><br />
                <Button bsStyle={"primary"} onClick={this.handleRetryFetchStructure}>
                  <FontAwesomeIcon icon={"redo-alt"} />&nbsp;&nbsp; Retry
                </Button>
              </BGMessage>
              :
              <div className={classes.layout}>
                <div className={classes.leftPanel}>
                  {queryBuilderStore.hasRootSchema ?
                    <Query />
                    :
                    <BGMessage icon={"blender-phone"}>
                      Please choose a root schema in the right panel
                    </BGMessage>}
                </div>
                <div className={classes.tabbedPanel}>
                  <div className={classes.tabs}>
                    {queryBuilderStore.hasRootSchema ?
                      <React.Fragment>
                        {queryBuilderStore.currentField && <Tab icon={"cog"} current={queryBuilderStore.currentTab === "fieldOptions"} label={"Field options"} onClose={this.handleCloseField} onClick={this.handleSelectTab.bind(this, "fieldOptions")} />}
                        <Tab icon={"shopping-cart"} current={queryBuilderStore.currentTab === "query"} label={"Query specification"} onClick={this.handleSelectTab.bind(this, "query")} />
                        <Tab icon={"poll-h"} current={queryBuilderStore.currentTab === "result"} label={"Results: JSON View"} onClick={this.handleSelectTab.bind(this, "result")} />
                        <Tab icon={"table"} current={queryBuilderStore.currentTab === "resultTable"} label={"Results: Table View"} onClick={this.handleSelectTab.bind(this, "resultTable")} />
                      </React.Fragment>
                      :
                      <Tab icon={"shopping-cart"} current={true} label={"Choose a root schema"} />
                    }
                  </div>
                  <div className={classes.tabBody}>
                    <Scrollbars autoHide ref={ref => this.scrolledPanel = ref}>
                      <div className={classes.tabBodyInner}>
                        {!queryBuilderStore.hasRootSchema ?
                          <RootSchemaChoice />
                          : queryBuilderStore.currentTab === "query" ?
                            <QuerySpecification />
                            : queryBuilderStore.currentTab === "result" ?
                              <Result />
                              : queryBuilderStore.currentTab === "resultTable" ?
                                <ResultTable />
                                : queryBuilderStore.currentTab === "fieldOptions" ?
                                  <Options />
                                  : null}
                      </div>
                    </Scrollbars>
                  </div>
                </div>
                {queryBuilderStore.hasRootSchema && (
                  <QueriesDrawer />
                )}
              </div>
        }
      </div>
    );
  }
}