/*
*   Copyright (c) 2020, EPFL/Human Brain Project PCO
*
*   Licensed under the Apache License, Version 2.0 (the "License");
*   you may not use this file except in compliance with the License.
*   You may obtain a copy of the License at
*
*       http://www.apache.org/licenses/LICENSE-2.0
*
*   Unless required by applicable law or agreed to in writing, software
*   distributed under the License is distributed on an "AS IS" BASIS,
*   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*   See the License for the specific language governing permissions and
*   limitations under the License.
*/

import React from "react";
import queryBuilderStore from "../../Stores/QueryBuilderStore";
import { observer } from "mobx-react";
import { Button, Row, Col } from "react-bootstrap";
import { SingleField } from "hbp-quickfire";
import injectStyles from "react-jss";

const styles = {
  container:{
    color:"var(--ft-color-loud)",
    background:"var(--bg-color-ui-contrast3)",
    margin:"-10px -10px 30px -10px",
    padding:"10px 10px 20px 10px",
    position:"relative",
    "&::after":{
      display:"block",
      content:"''",
      position:"absolute",
      bottom:"-10px",
      left:"50%",
      marginLeft:"-10px",
      width:"20px",
      height:"20px",
      background:"var(--bg-color-ui-contrast3)",
      transform:"rotate(45deg)"
    }
  }
};

const scopeOptions =  [{label: "Released", value: "RELEASED" }, {label: "Curated", value: "INFERRED"}];

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

  handlExecuteQuery = () => {
    queryBuilderStore.executeQuery();
  }

  handleChangeScope = (event, field) => {
    queryBuilderStore.setDatabaseScope(field.getValue());
  }

  render(){
    const { classes } = this.props;
    return(
      <div className={classes.container}>
        <Row>
          <Col xs={6}>
            <SingleField value={queryBuilderStore.resultSize} defaultValue={20} label="Size" type="InputText" inputType="number" onChange={this.handleChangeSize}/>
          </Col>
          <Col xs={6}>
            <SingleField value={queryBuilderStore.resultStart} defaultValue={0} label="Start" type="InputText" inputType="number" onChange={this.handleChangeStart}/>
          </Col>
        </Row>
        <Row>
          <Col xs={12}>
            <SingleField
              key={queryBuilderStore.databaseScope}
              value={queryBuilderStore.databaseScope}
              options={scopeOptions}
              label="Select space"
              type="Select"
              onChange={this.handleChangeScope} />
          </Col>
        </Row>
        <Row>
          <Col xs={12}>
            <p>Strip vocab : <input type="checkbox" onChange={this.handleToggleRunStripVocab} checked={queryBuilderStore.runStripVocab}/></p>
          </Col>
          <Col xs={12}>
            <Button bsStyle={"primary"} className={"btn-block"} disabled={queryBuilderStore.isQueryEmpty} onClick={this.handlExecuteQuery} title={!queryBuilderStore.isQueryEmpty?"Run it":"The current query specification is not valid/complete. Please select at least one field."}>
              Run it
            </Button>
          </Col>
        </Row>
      </div>
    );
  }
}