import React from "react";
import ReactJson from "react-json-view";
import queryBuilderStore from "../../Stores/QueryBuilderStore";
import { observer } from "mobx-react";

import ThemeRJV from "./ThemeRJV";
import ResultOptions from "./ResultOptions";

@observer
export default class Result extends React.Component{
  render(){
    return(
      <div>
        <ResultOptions/>
        {queryBuilderStore.result && <ReactJson collapsed={1} name={false} theme={ThemeRJV} src={queryBuilderStore.result} />}
      </div>
    );
  }
}