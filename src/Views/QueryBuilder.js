import React from "react";
import injectStyles from "react-jss";
import {observer} from "mobx-react";

import { Scrollbars } from "react-custom-scrollbars";

import queryBuilderStore from "../Stores/QueryBuilderStore";
import Field from "./QueryBuilder/Field";
import SavedQueries from "./QueryBuilder/SavedQueries";

import RootSchemaChoice from "./QueryBuilder/RootSchemaChoice";
import Query from "./QueryBuilder/Query";
import Options from "./QueryBuilder/Options";
import Result from "./QueryBuilder/Result";
import ResultTable from "./QueryBuilder/ResultTable";
import Tab from "../Components/Tab";
import BGMessage from "../Components/BGMessage";

let styles = {
  container:{
    display:"grid",
    gridTemplateRows:"1fr 1fr 4fr",
    gridTemplateColumns:"1fr 1fr",
    gridGap:"10px",
    padding:"10px",
    height:"100%"
  },
  schemas:{
    gridRowStart: "span 5",
    position:"relative",
    background: "var(--bg-color-ui-contrast2)",
    border: "1px solid var(--border-color-ui-contrast1)",
    overflow:"auto",
    color:"var(--ft-color-normal)"
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
    gridTemplateRows:"auto 1fr",
    gridRowStart: "span 5",
    "&.hasMyQueries, &.hasOthersQueries": {
      gridRowStart: "span 4",
    },
    "&.hasMyQueries.hasOthersQueries": {
      gridRowStart: "span 3",
    }
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
  handleSelectQuery(query){
    queryBuilderStore.selectQuery(query);
  }
  handleDeleteQuery(query){
    queryBuilderStore.deleteQuery(query);
  }
  handleCancelDeleteQuery(query){
    queryBuilderStore.cancelDeleteQuery(query);
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
      queryBuilderStore.structure?
        <div className={classes.container}>
          <div className={classes.schemas}>
            {queryBuilderStore.rootField?
              <Field field={queryBuilderStore.rootField}/>
              :<BGMessage icon={"blender-phone"}>
                Please choose a root schema in the right panel
              </BGMessage>}
          </div>
          <div className={`${classes.myQueries} ${queryBuilderStore.myQueries.length?"show":""}`} >
            <SavedQueries title="My saved queries" list={queryBuilderStore.myQueries} onSelect={this.handleSelectQuery} onDelete={this.handleDeleteQuery} onCancelDelete={this.handleCancelDeleteQuery} />
          </div>
          <div className={`${classes.othersQueries} ${queryBuilderStore.othersQueries.length?"show":""}`} >
            <SavedQueries title="Other users' queries" list={queryBuilderStore.othersQueries} onSelect={this.handleSelectQuery} />
          </div>
          <div className={`${classes.tabbedPanel} ${queryBuilderStore.myQueries.length?"hasMyQueries":""} ${queryBuilderStore.othersQueries.length?"hasOthersQueries":""}`}>
            <div className={classes.tabs}>
              {queryBuilderStore.rootField?
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
                  {!queryBuilderStore.rootField?
                    <RootSchemaChoice/>
                    :queryBuilderStore.currentTab === "query"?
                      <Query/>
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
        :null
    );
  }
}