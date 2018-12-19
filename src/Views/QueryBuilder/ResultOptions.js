import React from "react";
import queryBuilderStore from "../../Stores/QueryBuilderStore";
import { observer } from "mobx-react";
import { Button } from "react-bootstrap";
import { SingleField } from "hbp-quickfire";
import injectStyles from "react-jss";

const styles = {
  container:{
    color:"var(--ft-color-loud)"
  }
};

@injectStyles(styles)
@observer
export default class ResultOptions extends React.Component{
  handleToggleRunStripVocab = () => {
    queryBuilderStore.toggleRunStripVocab();
  }

  handleChangeSize = (event, field) => {
    queryBuilderStore.setResultSize(field.getValue());
  }

  handleChangeStart = (event, field) => {
    queryBuilderStore.setResultStart(field.getValue());
  }

  render(){
    const { classes } = this.props;
    return(
      <div className={classes.container}>
        <Button onClick={()=>queryBuilderStore.executeQuery()}>
          Try it
        </Button>
        Strip vocab : <input type="checkbox" onChange={this.handleToggleRunStripVocab} checked={queryBuilderStore.runStripVocab}/>
        <SingleField value={queryBuilderStore.resultSize} defaultValue={20} label="size" type="InputText" inputType="number" onChange={this.handleChangeSize}/>
        <SingleField value={queryBuilderStore.resultStart} defaultValue={0} label="start" type="InputText" inputType="number" onChange={this.handleChangeStart}/>
      </div>
    );
  }
}