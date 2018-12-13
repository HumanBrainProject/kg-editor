import React from "react";
import ReactJson from "react-json-view";
import queryBuilderStore from "../../Stores/QueryBuilderStore";
import { observer } from "mobx-react";
import { Button } from "react-bootstrap";

@observer
export default class Query extends React.Component{
  handleToggleRunStripVocab = () => {
    queryBuilderStore.toggleRunStripVocab();
  }

  render(){
    return(
      <div>
        <Button onClick={()=>queryBuilderStore.executeQuery()}>
          Try it
        </Button>
        Strip vocab : <input type="checkbox" onChange={this.handleToggleRunStripVocab} checked={queryBuilderStore.runStripVocab}/>
        {queryBuilderStore.result && <ReactJson collapsed={1} name={false} theme="monokai" src={queryBuilderStore.result} />}
      </div>
    );
  }
}