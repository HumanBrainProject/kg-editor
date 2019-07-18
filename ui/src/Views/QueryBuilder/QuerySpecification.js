import React from "react";
import ReactJson from "react-json-view";
import { observer } from "mobx-react";
import ThemeRJV from "./ThemeRJV";

import queryBuilderStore from "../../Stores/QueryBuilderStore";

@observer
export default class QuerySpecification extends React.Component{
  render(){
    return(
      queryBuilderStore.rootField &&
      <ReactJson collapsed={false} name={false} theme={ThemeRJV} src={queryBuilderStore.JSONQuery} />
    );
  }
}