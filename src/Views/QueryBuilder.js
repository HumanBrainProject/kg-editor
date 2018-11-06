import React from "react";
import injectStyles from "react-jss";
import {observer} from "mobx-react";
import {Button, Modal} from "react-bootstrap";

import queryBuilderStore from "../Stores/QueryBuilderStore";
import Field from "./QueryBuilder/Field";

let styles = {
  container:{
    display:"grid",
    gridTemplateRows:"100%",
    gridTemplateColumns:"1fr 1fr",
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
                            {queryBuilderStore.getSortedSchemasByGroup(group).map(node => {
                              return(
                                <div className={classes.schemaSelectSchema} key={node.id} onClick={this.handleSelectRootSchema.bind(this, node)}>
                                  {node.label}
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
                          queryBuilderStore.findSchemaById(schemaId).props.filter(prop => !prop.canBe || !prop.canBe.length).map(propSchema => {
                            return (
                              <div key={propSchema.id+(propSchema.reverse?"reverse":"")} onClick={this.handleAddField.bind(this, propSchema)}>
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
                          queryBuilderStore.findSchemaById(schemaId).props.filter(prop => prop.canBe && prop.canBe.length).map(propSchema => {
                            return (
                              <div key={propSchema.id+(propSchema.reverse?"reverse":"")} onClick={this.handleAddField.bind(this, propSchema)}>
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

          <div className={classes.result}>
            {queryBuilderStore.rootField && <pre>
              {JSON.stringify(queryBuilderStore.JSONQuery,null,2)}
            </pre>}
          </div>
        </div>
        :null
    );
  }
}