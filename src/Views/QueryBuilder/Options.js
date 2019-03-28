import React from "react";
import queryBuilderStore from "../../Stores/QueryBuilderStore";
import { observer } from "mobx-react";
import MultiToggle from "../../Components/MultiToggle";
import injectStyles from "react-jss";
import {sortBy} from "lodash";
import {FormControl} from "react-bootstrap";

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
      }
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
  },

  option:{
    marginBottom:"20px",
    "&:last-child":{
      marginBottom:0
    }
  },

  optionLabel:{
    fontWeight:"bold",
    marginBottom:"5px",
    "& small":{
      fontWeight:"normal",
      fontStyle:"italic"
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

  handleChangeRequired = value => {
    queryBuilderStore.currentField.setOption("required", value);
  }

  handleChangeSort = value => {
    queryBuilderStore.currentField.setOption("sort", value);
    if (value) {
      queryBuilderStore.currentField.parent.fields.forEach(field => {
        if (field !== queryBuilderStore.currentField) {
          field.setOption("sort", null);
        }
      });
    }
  }

  handleChangeEnsureOrder = value => {
    queryBuilderStore.currentField.setOption("ensure_order", value);
  }

  handleChangeFlatten= value => {
    queryBuilderStore.currentField.setOption("flatten", value);
  }

  handleChangeName = e => {
    queryBuilderStore.currentField.setOption("alias", e.target.value);
  }

  render(){
    const {classes} = this.props;

    return(
      <div className={classes.container}>
        {queryBuilderStore.currentField !== queryBuilderStore.rootField &&
          <div className={classes.fieldOptions}>
            { queryBuilderStore.currentField !== queryBuilderStore.rootField &&
              !queryBuilderStore.currentField.parent.getOption("flatten") &&
              <div className={classes.option}>
                <div className={classes.optionLabel}>
                  Target name <small>(only applicable if parent field is not flattened)</small>
                </div>
                <div className={classes.optionInput}>
                  <FormControl type="text"
                    onChange={this.handleChangeName}
                    value={queryBuilderStore.currentField.getOption("alias") || ""}
                    placeholder={queryBuilderStore.currentField.getDefaultAlias()}/>
                </div>
              </div>
            }

            { queryBuilderStore.currentField !== queryBuilderStore.rootField &&
              !queryBuilderStore.currentField.parent.getOption("flatten") &&
              <div className={classes.option}>
                <div className={classes.optionLabel}>
                  Required <small>(only applicable if parent field is not flattened)</small>
                </div>
                <div className={classes.optionInput}>
                  <MultiToggle selectedValue={queryBuilderStore.currentField.getOption("required")} onChange={this.handleChangeRequired}>
                    <MultiToggle.Toggle color={"var(--ft-color-loud)"} icon={"check"} value={true}/>
                    <MultiToggle.Toggle color={"var(--ft-color-loud)"} icon={"times"} value={null}/>
                  </MultiToggle>
                </div>
              </div>
            }

            { !queryBuilderStore.currentField.schema.canBe &&
              <div className={classes.option}>
                <div className={classes.optionLabel}>
                  Sort <small>(enabling sort on this field will disable sort on other fields)</small>
                </div>
                <div className={classes.optionInput}>
                  <MultiToggle selectedValue={queryBuilderStore.currentField.getOption("sort")} onChange={this.handleChangeSort}>
                    <MultiToggle.Toggle color={"var(--ft-color-loud)"} icon={"check"} value={true}/>
                    <MultiToggle.Toggle color={"var(--ft-color-loud)"} icon={"times"} value={null}/>
                  </MultiToggle>
                </div>
              </div>
            }

            { queryBuilderStore.currentField.schema.canBe &&
              !queryBuilderStore.currentField.parent.getOption("flatten") &&
              <div className={classes.option}>
                <div className={classes.optionLabel}>
                  Ensure original order <small>(only applicable if parent field is not flattened)</small>
                </div>
                <div className={classes.optionInput}>
                  <MultiToggle selectedValue={queryBuilderStore.currentField.getOption("ensure_order")} onChange={this.handleChangeEnsureOrder}>
                    <MultiToggle.Toggle color={"var(--ft-color-loud)"} icon={"check"} value={true}/>
                    <MultiToggle.Toggle color={"var(--ft-color-loud)"} icon={"times"} value={null}/>
                  </MultiToggle>
                </div>
              </div>
            }

            {queryBuilderStore.currentField.schema.canBe
              && queryBuilderStore.currentField !== queryBuilderStore.rootField
              && queryBuilderStore.currentField.fields.length === 1
              && <div className={classes.option}>
                <div className={classes.optionLabel}>
                  Flatten <small>(only applicable if this field has only one child field)</small>
                </div>
                <div className={classes.optionInput}>
                  <MultiToggle selectedValue={queryBuilderStore.currentField.getOption("flatten")} onChange={this.handleChangeFlatten}>
                    <MultiToggle.Toggle color={"var(--ft-color-loud)"} icon={"check"} value={true}/>
                    <MultiToggle.Toggle color={"var(--ft-color-loud)"} icon={"times"} value={null}/>
                  </MultiToggle>
                </div>
              </div>
            }
          </div>
        }

        {queryBuilderStore.currentField.schema.canBe &&
         !queryBuilderStore.currentField.getOption("flatten") &&
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

            {queryBuilderStore.currentField.schema.canBe &&
            !queryBuilderStore.currentField.getOption("flatten") &&
            queryBuilderStore.currentField.schema.canBe.map((schemaId)=>{
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