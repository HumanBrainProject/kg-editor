import React from "react";
import ReactJson from "react-json-view";
import queryBuilderStore from "../../Stores/QueryBuilderStore";
import { observer } from "mobx-react";

import ThemeRJV from "./ThemeRJV";

@observer
export default class Query extends React.Component{
  render(){
    return(
      queryBuilderStore.rootField &&
      <ReactJson collapsed={false} name={false} theme={ThemeRJV} src={queryBuilderStore.JSONQuery} />
    );
  }
}