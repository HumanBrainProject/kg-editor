import React from "react";
import ReactJson from "react-json-view";
import queryBuilderStore from "../../Stores/QueryBuilderStore";
import { observer } from "mobx-react";

@observer
export default class Query extends React.Component{
  render(){
    return(
      queryBuilderStore.rootField &&
      <ReactJson onEdit={()=>{return false;}} collapsed={false} name={false} theme="monokai" src={queryBuilderStore.JSONQuery} />
    );
  }
}