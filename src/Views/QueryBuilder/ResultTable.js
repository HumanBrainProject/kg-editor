import React from "react";
import queryBuilderStore from "../../Stores/QueryBuilderStore";
import { observer } from "mobx-react";
import { toJS } from "mobx";
import { Button, Table, OverlayTrigger, Tooltip } from "react-bootstrap";
import { get, isArray, isString } from "lodash";

import injectStyles from "react-jss";
import ResultOptions from "./ResultOptions";
import routerStore from "../../Stores/RouterStore";

let styles = {
  container:{
    color:"var(--ft-color-loud)",
    "& td":{

    },
    "& th:first-child":{
      width:"40px"
    },
    "& table":{
      tableLayout:"fixed"
    }
  },
  value:{
    width:"100%",
    overflow:"hidden",
    textOverflow:"ellipsis",
    whiteSpace:"nowrap"
  },
  "@global":{
    "[id^=result-tooltip-] .tooltip-inner":{
      maxWidth:"400px",
    },
    "[id^=result-tooltip-@id] .tooltip-inner":{
      wordBreak:"break-all"
    }
  }
};

@injectStyles(styles)
@observer
export default class ResultTable extends React.Component{
  handleBreadcrumbClick(index){
    queryBuilderStore.returnToTableViewRoot(index);
  }

  handleOpenCollection(index, key){
    queryBuilderStore.appendTableViewRoot(index,key);
  }

  handleClickValue(key, value){
    if(key === "relativeUrl"){
      routerStore.history.push("/instance/view/"+value);
    }
  }

  render(){
    const {classes} = this.props;
    let objectKeys = [];
    let subResult = {};
    if(queryBuilderStore.result){
      subResult = get(queryBuilderStore.result, toJS(queryBuilderStore.tableViewRoot));
      objectKeys = isString(subResult[0])?[""]:Object.keys(subResult[0]);
    }
    return(
      <div className={classes.container}>
        <ResultOptions/>
        <hr/>
        {queryBuilderStore.tableViewRoot.map((item, index) =>
          <div key={index} onClick={isString(item)?this.handleBreadcrumbClick.bind(this, index):undefined}>
            {item}
          </div>
        )}
        <hr/>
        {queryBuilderStore.result &&
          <Table>
            <thead>
              <tr>
                <th>#</th>
                {objectKeys.map( key =>
                  <th key={key}>{key}</th>
                )}
              </tr>
            </thead>
            <tbody>
              {subResult.map((row, index) =>
                <tr key={"row"+index}>
                  <th>{index}</th>
                  {isString(row)?
                    <td>{row}</td>:
                    objectKeys.map(key =>
                      <td key={key+index}>
                        {isArray(row[key])?
                          row[key].length?
                            <Button bsSize={"xsmall"} bsStyle={"primary"} onClick={this.handleOpenCollection.bind(this, index, key)}>
                              Collection ({row[key].length})
                            </Button>
                            :<em>empty collection</em>
                          :<OverlayTrigger placement="top" overlay={
                            <Tooltip id={`result-tooltip-${key}-${index}`}>
                              {row[key]}
                            </Tooltip>}>
                            <div className={classes.value} onClick={this.handleClickValue.bind(this, key, row[key])}>
                              {row[key]}
                              <Tooltip placement="top" id={`result-tooltip-${key}-${index}-2`}>
                                {row[key]}
                              </Tooltip>
                            </div>
                          </OverlayTrigger>
                        }
                      </td>)}
                </tr>
              )}
            </tbody>
          </Table>
        }
      </div>
    );
  }
}