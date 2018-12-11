import React from "react";
import injectStyles from "react-jss";
import {observer} from "mobx-react";
import {Button, Modal} from "react-bootstrap";

import queryBuilderStore from "../Stores/QueryBuilderStore";
import Field from "./QueryBuilder/Field";

import ReactJson from "react-json-view";

let styles = {
  container:{
    display:"grid",
    gridTemplateRows:"100%",
    gridTemplateColumns:"1fr 1fr 1fr",
    gridGap:"10px",
    padding:"10px",
    height:"100%"
  },
  schemas:{
    background:"var(--bg-color-ui-contrast1)",
    overflow:"auto",
    color:"var(--ft-color-normal)"
  },
  schemaSelectGroup:{
    fontSize:"1.25em",
    fontWeight:"bold",
    marginBottom:"10px"
  },
  schemaSelectSchema:{
    fontSize:"0.8em",
    fontWeight:"normal",
    paddingLeft:"10px"
  },
  query:{
    background:"rgb(50, 41, 49)",
  },
  result:{
    background:"rgb(50, 41, 49)",
  }
};

@injectStyles(styles)
@observer
export default class QueryBuilder extends React.Component{
  handleChooseRootSchema = () => {
    queryBuilderStore.toggleShowModalSchemaChoice();
  }

  handleSelectRootSchema = (schema) => {
    queryBuilderStore.selectRootSchema(schema);
  }

  handleAddField(schema){
    queryBuilderStore.addField(schema);
  }

  handleToggleRunStripVocab = () => {
    queryBuilderStore.toggleRunStripVocab();
  }

  render(){
    const {classes} = this.props;
    return(
      queryBuilderStore.structure?
        <div className={classes.container}>
          <div className={classes.schemas}>
            {!queryBuilderStore.rootField?
              <React.Fragment>
                <Button onClick={this.handleChooseRootSchema}>Choose a root schema</Button>
                <Modal show={queryBuilderStore.showModalSchemaChoice}>
                  <Modal.Body>
                    {queryBuilderStore.getSortedSchemaGroups().map(group => {
                      return(
                        <div className={classes.schemaSelectGroup} key={group}>
                          {group}
                          <div>
                            {queryBuilderStore.getSortedSchemasByGroup(group).map(schema => {
                              if(!schema.properties || !schema.properties.length){
                                return null;
                              }
                              return(
                                <div className={classes.schemaSelectSchema} key={schema.id} onClick={this.handleSelectRootSchema.bind(this, schema)}>
                                  {schema.label}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </Modal.Body>
                </Modal>
              </React.Fragment>
              :
              <React.Fragment>
                <Field field={queryBuilderStore.rootField}/>
                {queryBuilderStore.showModalFieldChoice &&
                  <Modal show={true}>
                    <Modal.Body>
                      <strong>Properties: </strong>
                      {queryBuilderStore.showModalFieldChoice.schema.canBe.map((schemaId)=>{
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
                      {queryBuilderStore.showModalFieldChoice.schema.canBe.map((schemaId)=>{
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
                    </Modal.Body>
                  </Modal>
                }
              </React.Fragment>
            }
          </div>

          <div className={classes.query}>
            {queryBuilderStore.rootField && <ReactJson onEdit={()=>{return false;}} collapsed={false} name={false} theme="hopscotch" src={queryBuilderStore.JSONQuery} />}
          </div>

          <div className={classes.result}>
            <Button onClick={()=>queryBuilderStore.executeQuery()}>
              Try it
            </Button>
            Strip vocab : <input type="checkbox" onChange={this.handleToggleRunStripVocab} checked={queryBuilderStore.runStripVocab}/>
            {queryBuilderStore.result && <ReactJson collapsed={1} name={false} theme="hopscotch" src={queryBuilderStore.result} />}
          </div>
        </div>
        :null
    );
  }
}