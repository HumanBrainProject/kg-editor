import React from "react";
import injectStyles from "react-jss";
import {observer} from "mobx-react";

import { Scrollbars } from "react-custom-scrollbars";

import queryBuilderStore from "../Stores/QueryBuilderStore";
import Field from "./QueryBuilder/Field";

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
    gridTemplateRows:"100%",
    gridTemplateColumns:"1fr 1fr",
    gridGap:"10px",
    padding:"10px",
    height:"100%"
  },
  schemas:{
    position:"relative",
    background: "var(--bg-color-ui-contrast2)",
    border: "1px solid var(--border-color-ui-contrast1)",
    overflow:"auto",
    color:"var(--ft-color-normal)"
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
  handleSelectTab(tab){
    queryBuilderStore.selectTab(tab);
  }
  handleCloseField = () => {
    queryBuilderStore.closeFieldOptions();
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

          <div className={classes.tabbedPanel}>
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