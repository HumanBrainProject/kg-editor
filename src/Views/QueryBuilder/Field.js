import React from "react";
import injectStyles from "react-jss";
import {observer} from "mobx-react";
import {Button, Modal} from "react-bootstrap";

import Fields from "./Fields";
import queryBuilderStore from "../../Stores/QueryBuilderStore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import MultiToggle from "../../Components/MultiToggle";

let styles = {
  container:{
    position:"relative",
    "&::before":{
      display:"block",
      content:"''",
      position:"absolute",
      left:"10px",
      width:"0",
      height:"calc(100% - 17px)",
      borderLeft:"1px dashed #ccc"
    },
    "&::after":{
      display:"block",
      content:"''",
      position:"absolute",
      left:"-9px",
      top:"20px",
      width:"10px",
      height:"0",
      borderTop:"1px dashed #ccc"
    }
  },
  label:{
    padding:"10px",
    margin:"1px",
    backgroundColor:"var(--bg-color-ui-contrast3)",
    position:"relative",
    zIndex:2
  },
  rename:{
    color:"var(--ft-color-louder)",
    fontWeight:"bold"
  },
  subFields:{
    paddingLeft:"20px"
  },
  optionsButton:{
    position:"absolute",
    right:"10px",
    top:"9px"
  },
  addButton:{
    marginLeft:"20px",
    position:"relative",
    "&::after":{
      display:"block",
      content:"''",
      position:"absolute",
      left:"-9px",
      top:"17px",
      width:"10px",
      height:"0",
      borderTop:"1px dashed #ccc"
    }
  }
};

@injectStyles(styles)
@observer
export default class Field extends React.Component{
  handleAddField = () => {
    queryBuilderStore.toggleShowModalFieldChoice(this.props.field);
  }

  handleShowOptions = () => {
    queryBuilderStore.toggleShowModalFieldOptions(this.props.field);
  }

  handleHideOptions = () => {
    queryBuilderStore.toggleShowModalFieldOptions();
  }

  handleChangeRequired = (value) => {
    this.props.field.setOption("required", value);
  }
  handleChangeName = (e) => {
    this.props.field.setOption("alias", e.target.value);
  }

  render(){
    const {classes, field} = this.props;
    return(

      <div className={classes.container}>
        <div className={classes.label}>
          {field.schema.label}&nbsp;
          {field.schema.canBe && field.schema.canBe.length &&
          <span className={classes.canBe}>
            ( {field.schema.canBe.map(schemaId => queryBuilderStore.findSchemaById(schemaId).label+" ")} )
          </span>}
          {field.getOption("name")?
            <span className={classes.rename}>
              <FontAwesomeIcon icon="long-arrow-alt-right"/>&nbsp;
              {field.getOption("name")}
            </span>
            :null}
          <Button className={classes.optionsButton} bsSize={"xsmall"} bsStyle={"primary"} onClick={this.handleShowOptions}>
            <FontAwesomeIcon icon="cog"/>
          </Button>
        </div>
        <div className={classes.subFields}>
          <Fields field={field}/>
        </div>
        {field.schema.canBe && field.schema.canBe.length &&
          <div className={classes.addButton}>
            <Button className={"btn btn-link"} onClick={this.handleAddField}>
              <FontAwesomeIcon icon={"plus-square"}/>
            </Button>
          </div>}

        <Modal show={queryBuilderStore.showModalFieldOptions === field} onHide={this.handleHideOptions}>
          <Modal.Header closeButton>
            Options for field : {field.schema.label}
          </Modal.Header>
          <Modal.Body>
            <div className={classes.option}>
              <div className={classes.optionLabel}>
                Target name
              </div>
              <div className={classes.optionInput}>
                <input type="text" onChange={this.handleChangeName} value={field.getOption("alias") || ""} placeholder={field.schema.label}/>
              </div>
            </div>
            <hr/>
            <div className={classes.option}>
              <div className={classes.optionLabel}>
                Required
              </div>
              <div className={classes.optionInput}>
                <MultiToggle selectedValue={field.getOption("required")} onChange={this.handleChangeRequired}>
                  <MultiToggle.Toggle color={"var(--ft-color-loud)"} icon={"check"} value={true}/>
                  <MultiToggle.Toggle color={"var(--ft-color-loud)"} icon={"times"} value={null}/>
                </MultiToggle>
              </div>
            </div>
          </Modal.Body>
        </Modal>
      </div>
    );
  }
}