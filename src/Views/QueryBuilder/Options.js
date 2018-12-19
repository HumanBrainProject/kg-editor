import React from "react";
import queryBuilderStore from "../../Stores/QueryBuilderStore";
import { observer } from "mobx-react";
import MultiToggle from "../../Components/MultiToggle";
import injectStyles from "react-jss";
import {Button} from "react-bootstrap";
import {sortBy} from "lodash";

const style = {
  container:{
    color:"var(--ft-color-normal)",
    "& input":{
      color:"black"
    },
    "& hr":{
      margin:"30px auto",
      maxWidth:"500px",
      borderTopColor:"var(--bg-color-ui-contrast4)"
    }
  },

  fields:{
    color:"var(--ft-color-loud)",
    "& h3":{
      fontSize:"1.7em",
      marginBottom:"10px",
      marginLeft:"10px",
      "& small":{
        color:"var(--ft-color-quiet)",
        fontStyle:"italic"
      },
    }
  },

  property:{
    color:"var(--ft-color-loud)",
    fontWeight:"normal",
    cursor: "pointer",
    padding: "10px",
    margin:"1px",
    background:"var(--bg-color-ui-contrast1)",
    "& small":{
      color:"var(--ft-color-quiet)",
      fontStyle:"italic"
    },
    "&:hover":{
      background:"var(--bg-color-ui-contrast4)",
    }
  },

  fieldOptions:{
    background:"var(--bg-color-ui-contrast3)",
    margin:"-10px -10px 30px -10px",
    padding:"10px",
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

  handleChangeFlatten= (value) => {
    queryBuilderStore.currentField.setOption("flatten", value);
  }

  handleChangeName = (e) => {
    queryBuilderStore.currentField.setOption("alias", e.target.value);
  }

  render(){
    const {classes} = this.props;

    return(
      <div className={classes.container}>
        <div className={classes.fieldOptions}>
          <Button className={"btn-block"} bsStyle={"danger"} onClick={this.handleRemoveField}>Remove</Button>
          <div className={classes.option}>
            <div className={classes.optionLabel}>
              Target name
            </div>
            <div className={classes.optionInput}>
              <input type="text"
                onChange={this.handleChangeName}
                value={queryBuilderStore.currentField.getOption("alias") || ""}
                placeholder={queryBuilderStore.currentField.schema.simpleAttributeName || queryBuilderStore.currentField.schema.simplePropertyName || queryBuilderStore.currentField.schema.label}/>
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
          <div className={classes.option}>
            <div className={classes.optionLabel}>
              Flatten
            </div>
            <div className={classes.optionInput}>
              <MultiToggle selectedValue={queryBuilderStore.currentField.getOption("flatten")} onChange={this.handleChangeFlatten}>
                <MultiToggle.Toggle color={"var(--ft-color-loud)"} icon={"check"} value={true}/>
                <MultiToggle.Toggle color={"var(--ft-color-loud)"} icon={"times"} value={null}/>
              </MultiToggle>
            </div>
          </div>
        </div>

        {queryBuilderStore.currentField.schema.canBe &&
          <div className={classes.fields}>
            {queryBuilderStore.currentField.schema.canBe && queryBuilderStore.currentField.schema.canBe.map((schemaId)=>{
              return(
                <div key={schemaId}>
                  <h3>Attributes valid for {queryBuilderStore.findSchemaById(schemaId).label} <small> - {queryBuilderStore.findSchemaById(schemaId).id}</small></h3>
                  {sortBy(queryBuilderStore.findSchemaById(schemaId).properties.filter(prop => !prop.canBe || !prop.canBe.length), ["label"]).map(propSchema => {
                    return (
                      <div className={classes.property} key={propSchema.attribute+(propSchema.reverse?"reverse":"")} onClick={this.handleAddField.bind(this, propSchema)}>
                        {propSchema.label} - <small>{propSchema.attribute}</small>
                      </div>
                    );
                  })}
                </div>
              );
            })}

            {queryBuilderStore.currentField.schema.canBe && queryBuilderStore.currentField.schema.canBe.map((schemaId)=>{
              return(
                <div key={schemaId}>
                  <h3>Links valid for {queryBuilderStore.findSchemaById(schemaId).label} <small> - {queryBuilderStore.findSchemaById(schemaId).id}</small></h3>
                  {sortBy(queryBuilderStore.findSchemaById(schemaId).properties.filter(prop => prop.canBe && prop.canBe.length), ["label"]).map(propSchema => {
                    return (
                      <div className={classes.property} key={propSchema.attribute+(propSchema.reverse?"reverse":"")} onClick={this.handleAddField.bind(this, propSchema)}>
                        {propSchema.label} - <small>{propSchema.attribute}</small>
                        &nbsp;&nbsp;( can be: {propSchema.canBe.map(schemaId => queryBuilderStore.findSchemaById(schemaId).label).join(", ")} )
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        }
      </div>
    );
  }
}