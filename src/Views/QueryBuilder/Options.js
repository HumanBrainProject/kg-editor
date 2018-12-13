import React from "react";
import queryBuilderStore from "../../Stores/QueryBuilderStore";
import { observer } from "mobx-react";
import MultiToggle from "../../Components/MultiToggle";
import injectStyles from "react-jss";
import {Button} from "react-bootstrap";

const style = {
  container:{
    color:"var(--ft-color-normal)",
    "& input":{
      color:"black"
    }
  }
};

@injectStyles(style)
@observer
export default class Options extends React.Component{
  handleAddField(schema, e){
    //Don't got to newly chosen field options if ctrl is pressed (or cmd)
    queryBuilderStore.addField(schema, queryBuilderStore.currentField, !e.ctrlKey && !e.metaKey);
  }

  handleRemoveField = () => {
    queryBuilderStore.removeField(queryBuilderStore.currentField);
  }

  handleChangeRequired = (value) => {
    queryBuilderStore.currentField.setOption("required", value);
  }

  handleChangeName = (e) => {
    queryBuilderStore.currentField.setOption("alias", e.target.value);
  }

  render(){
    const {classes} = this.props;

    return(
      <div className={classes.container}>
        <Button className={"btn-block"} bsStyle={"danger"} onClick={this.handleRemoveField}>Remove</Button>
        <div className={classes.option}>
          <div className={classes.optionLabel}>
            Target name
          </div>
          <div className={classes.optionInput}>
            <input type="text"
              onChange={this.handleChangeName}
              value={queryBuilderStore.currentField.getOption("alias") || ""}
              placeholder={queryBuilderStore.currentField.schema.label}/>
          </div>
        </div>
        <hr/>
        <div className={classes.option}>
          <div className={classes.optionLabel}>
            Required
          </div>
          <div className={classes.optionInput}>
            <MultiToggle selectedValue={queryBuilderStore.currentField.getOption("required")} onChange={this.handleChangeRequired}>
              <MultiToggle.Toggle color={"var(--ft-color-loud)"} icon={"check"} value={true}/>
              <MultiToggle.Toggle color={"var(--ft-color-loud)"} icon={"times"} value={null}/>
            </MultiToggle>
          </div>
        </div>

        <hr/>

        <div>
          <strong>Properties: </strong>
          {queryBuilderStore.currentField.schema.canBe && queryBuilderStore.currentField.schema.canBe.map((schemaId)=>{
            return(
              queryBuilderStore.findSchemaById(schemaId).properties.filter(prop => !prop.canBe || !prop.canBe.length).map(propSchema => {
                return (
                  <div key={propSchema.attribute+(propSchema.reverse?"reverse":"")} onClick={this.handleAddField.bind(this, propSchema)}>
                    {propSchema.label}
                  </div>
                );
              })
            );
          })}

          <hr/>

          <strong>Links: </strong>
          {queryBuilderStore.currentField.schema.canBe && queryBuilderStore.currentField.schema.canBe.map((schemaId)=>{
            return(
              queryBuilderStore.findSchemaById(schemaId).properties.filter(prop => prop.canBe && prop.canBe.length).map(propSchema => {
                return (
                  <div key={propSchema.attribute+(propSchema.reverse?"reverse":"")} onClick={this.handleAddField.bind(this, propSchema)}>
                    {propSchema.label}
                                  ( {propSchema.canBe.map(schemaId => queryBuilderStore.findSchemaById(schemaId).label+" ")})
                  </div>
                );
              })
            );
          })}
        </div>
      </div>
    );
  }
}