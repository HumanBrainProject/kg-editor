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
import Tab from "../Components/Tab";

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
    background:"var(--bg-color-ui-contrast1)",
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
    background:"rgb(39, 40, 34)"
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

  render(){
    const {classes} = this.props;
    return(
      queryBuilderStore.structure?
        <div className={classes.container}>
          <div className={classes.schemas}>
            {queryBuilderStore.rootField?
              <React.Fragment>
                <Field field={queryBuilderStore.rootField}/>
              </React.Fragment>
              :null}
          </div>

          <div className={classes.tabbedPanel}>
            <div className={classes.tabs}>
              {queryBuilderStore.rootField?
                <React.Fragment>
                  {queryBuilderStore.currentField && <Tab icon={"cog"} current={queryBuilderStore.currentTab === "fieldOptions"} label={"Field options"} onClose={this.handleCloseField} onClick={this.handleSelectTab.bind(this, "fieldOptions")}/>}
                  <Tab icon={"shopping-cart"} current={queryBuilderStore.currentTab === "query"} label={"Query specification"} onClick={this.handleSelectTab.bind(this, "query")}/>
                  <Tab icon={"poll-h"} current={queryBuilderStore.currentTab === "result"} label={"Result"} onClick={this.handleSelectTab.bind(this, "result")}/>
                </React.Fragment>
                :
                <Tab icon={"shopping-cart"} current={true} label={"Choose a root schema"}/>
              }
            </div>
            <div className={classes.tabBody}>
              <Scrollbars autoHide>
                <div className={classes.tabBodyInner}>
                  {!queryBuilderStore.rootField?
                    <RootSchemaChoice/>
                    :queryBuilderStore.currentTab === "query"?
                      <Query/>
                      :queryBuilderStore.currentTab === "result"?
                        <Result/>
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