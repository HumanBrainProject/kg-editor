import React from "react";
import queryBuilderStore from "../../Stores/QueryBuilderStore";
import { observer } from "mobx-react";
import { toJS } from "mobx";
import { Button, Table, OverlayTrigger, Tooltip } from "react-bootstrap";
import { get, isArray, isString, isInteger } from "lodash";

import injectStyles from "react-jss";
import ResultOptions from "./ResultOptions";
import routerStore from "../../Stores/RouterStore";
import instanceStore from "../../Stores/InstanceStore";

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
  },

  breadcrumb:{
    overflow:"hidden",
    marginBottom:"20px"
  },
  breadcrumbItem:{
    float:"left",
    background:"var(--list-bg-hover)",
    height:"36px",
    lineHeight:"36px",
    padding:"0 20px 0 30px",
    position:"relative",
    border:"1px solid var(--border-color-ui-contrast2)",
    "&::before":{
      display:"block",
      content:"''",
      position:"absolute",
      top:"5px",
      left:"-13px",
      height:"24px",
      width:"24px",
      transform:"rotate(45deg)",
      background:"var(--list-bg-hover)",
      borderTop:"1px solid var(--border-color-ui-contrast2)",
      borderRight:"1px solid var(--border-color-ui-contrast2)",
    },
    "&:first-child::before":{
      display:"none",
    },
    "&:first-child":{
      padding:"0 20px 0 20px",
    },
    "&.clickable":{
      cursor:"pointer",
    },
    "&.clickable:hover":{
      background:"var(--list-bg-selected)",
      "& + ::before":{
        background:"var(--list-bg-selected)",
      }
    },
    "&:last-child":{
      background:"var(--list-bg-selected)",
      cursor:"default",
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

  handleClickValue(key, value, e){
    if(key === "relativeUrl"){
      if(e.metaKey || e.ctrlKey){
        instanceStore.openInstance(value);
      } else {
        routerStore.history.push("/instance/view/"+value);
      }
    }
  }

  render(){
    const {classes} = this.props;
    let objectKeys = [];
    let subResult = {};
    if(queryBuilderStore.result){
      subResult = get(queryBuilderStore.result, toJS(queryBuilderStore.tableViewRoot));
      objectKeys = !subResult.length || isString(subResult[0])?[""]:Object.keys(subResult[0]);
    }
    return(
      <div className={classes.container}>
        <ResultOptions/>
        {queryBuilderStore.result &&
          <div className={classes.breadcrumb}>
            {queryBuilderStore.tableViewRoot.map((item, index) =>
              <div className={`${classes.breadcrumbItem}${!isInteger(item)?" clickable":""}`} key={index} onClick={isString(item)?this.handleBreadcrumbClick.bind(this, index):undefined}>
                {isInteger(item)?"#"+item:item} {index === 0?`(${queryBuilderStore.result.total})`:""}
              </div>
            )}
          </div>
        }
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